#!/usr/bin/env node
/*
 * tests/staleness_parity_test.js -- regression guard for command-centre's
 * "genuine activity" staleness definition.
 *
 * WHY THIS EXISTS (root cause of the 15 Sep 2026 incident):
 * The genuine-activity definition -- an action-log entry only counts as real
 * activity if it has no "(email: ...)" tag, or the tag is Kevin's own sent
 * reply "(email: Kevin (sent to: ...)" -- is hand-duplicated in THREE places
 * because this repo has no build step and work-inbox is a separate repo:
 *   1. command-centre/js/app.js          -- lastActivityTs() / staleDays()  (CANONICAL)
 *   2. command-centre/docs/mockups/cc-full-v5.html -- inline <script> port
 *   3. work-inbox/js/app.js              -- loadCcTicker()'s ccLastActivityTs()
 * Copy #2 was pasted from the OLD, buggy version of #1 on 15 Sep 2026 (before
 * that day's fix), which is exactly how a live "27 days stale" false report
 * happened even though #1 had already been correct since 21 Aug. This script
 * doesn't stop someone editing only one copy -- it stops that edit from
 * shipping silently: it runs a fixed set of fixture tasks through all three
 * live implementations and fails loudly if they ever disagree.
 *
 * HOW TO RUN: node tests/staleness_parity_test.js
 * Pulls the current content of all three files by PATH (local checkout paths
 * below -- edit COMMAND_CENTRE_APP_JS / MOCKUP_HTML / WORK_INBOX_APP_JS if
 * your checkout layout differs) and extracts each implementation via a plain
 * text search for known markers, so it always tests the REAL shipped code,
 * never a hand-copied inline duplicate of the logic itself.
 *
 * Exit code 0 = all three copies agree on every fixture. Non-zero = drift
 * detected, or a copy's expected code shape could not be found (which is
 * itself a signal one of the ports was edited/removed without this test
 * being updated -- treat that as a failure too, not a skip).
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const COMMAND_CENTRE_APP_JS = path.join(REPO_ROOT, 'js', 'app.js');
const MOCKUP_HTML = path.join(REPO_ROOT, 'docs', 'mockups', 'cc-full-v5.html');
// work-inbox is a SEPARATE repo/checkout. If it's not present as a sibling
// directory, that copy's part of the test is skipped with a loud warning
// (not silently passed) rather than failing the whole run for something
// this repo can't see.
const WORK_INBOX_APP_JS = path.join(REPO_ROOT, '..', 'work-inbox', 'js', 'app.js');

function extractFunctionSource(fileText, fnNamePattern) {
  const m = fileText.match(fnNamePattern);
  if (!m) return null;
  const startIdx = m.index;
  // Brace-match from the first '{' after the match to find the function body end.
  let i = fileText.indexOf('{', startIdx);
  if (i === -1) return null;
  let depth = 0;
  for (; i < fileText.length; i++) {
    if (fileText[i] === '{') depth++;
    else if (fileText[i] === '}') {
      depth--;
      if (depth === 0) { i++; break; }
    }
  }
  return fileText.slice(startIdx, i);
}

function buildImpl(monthsSrc, fnSrc, fnName) {
  if (!monthsSrc || !fnSrc) return null;
  // eslint-disable-next-line no-eval
  const factory = new Function(`${monthsSrc}\n${fnSrc}\nreturn ${fnName};`);
  return factory();
}

function loadCommandCentreCanonical() {
  const src = fs.readFileSync(COMMAND_CENTRE_APP_JS, 'utf8');
  const months = extractFunctionSource(src, /var CC_MONTHS=\{[^}]*\};/);
  const fn = extractFunctionSource(src, /function lastActivityTs\(t\)\{/);
  return buildImpl(months, fn, 'lastActivityTs');
}

function loadMockupCopy() {
  const src = fs.readFileSync(MOCKUP_HTML, 'utf8');
  const months = extractFunctionSource(src, /var CC_MONTHS=\{[^}]*\};/);
  const fn = extractFunctionSource(src, /function lastActivityTs\(t\)\{/);
  return buildImpl(months, fn, 'lastActivityTs');
}

function loadWorkInboxCopy() {
  if (!fs.existsSync(WORK_INBOX_APP_JS)) return { missing: true };
  const src = fs.readFileSync(WORK_INBOX_APP_JS, 'utf8');
  const months = extractFunctionSource(src, /var CC_MONTHS=\{[^}]*\};/);
  const fn = extractFunctionSource(src, /function ccLastActivityTs\(t\)\{/);
  return buildImpl(months, fn, 'ccLastActivityTs');
}

/* Fixtures -- deliberately cover the exact classes of task that would have
   exposed the 15 Sep bug, plus a couple of edge cases already handled by the
   canonical function (see command-centre/js/app.js's own comment above
   lastActivityTs). Dates are fixed, not relative to "today", so this test's
   result never depends on when it's run -- only relative ORDERING between
   fixture timestamps and the code's own use of Date.now() elsewhere would
   vary, and this test only exercises lastActivityTs(), not staleDays(), so
   Date.now() is never called by the code under test here. */
const FIXTURES = [
  {
    name: 'genuine recent activity should NOT resolve to the old creation date',
    task: {
      dateAdded: '2026-08-18',
      actions: [
        '[12 Aug 2026] Some manual note with no email tag.',
        '[19 Aug 2026] Inbound reminder (email: Someone Else - FW: reminder)',
        '[14 Sep 2026] Kevin replied (email: Kevin (sent to: Someone))'
      ]
    },
    expectMonth: 8, expectDay: 14, expectYear: 2026 // 14 Sep 2026, zero-indexed month=8
  },
  {
    name: 'routine inbound-only mail must NOT count as genuine activity',
    task: {
      dateAdded: '2026-07-01',
      actions: [
        '[01 Jul 2026] Auto-created from inbox triage (email: Someone - Subject)',
        '[10 Aug 2026] Another forward (email: Someone Else - FW: thing)'
      ]
    },
    // No genuine entry exists -> falls back to earliest dated entry (01 Jul 2026).
    expectMonth: 6, expectDay: 1, expectYear: 2026
  },
  {
    name: 'manual (untagged) note counts as genuine even if recent',
    task: {
      dateAdded: '2026-01-01',
      actions: [
        '[01 Jan 2026] Auto-created (email: Someone - Subject)',
        '[10 Sep 2026] Kevin investigated directly, no tag.'
      ]
    },
    expectMonth: 8, expectDay: 10, expectYear: 2026
  }
];

function fmt(ts) {
  if (!ts) return '(falsy)';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function run() {
  const impls = {
    'command-centre/js/app.js (canonical)': loadCommandCentreCanonical(),
    'command-centre/docs/mockups/cc-full-v5.html': loadMockupCopy()
  };
  const wi = loadWorkInboxCopy();
  if (wi && wi.missing) {
    console.warn('WARNING: work-inbox/js/app.js not found as a sibling checkout -- skipping that copy. ' +
      'This is NOT a pass for that copy, just an inability to check it from this repo alone. ' +
      'Run this test from an environment with both repos checked out side by side to get full coverage.');
  } else {
    impls['work-inbox/js/app.js (loadCcTicker copy)'] = wi;
  }

  let failures = 0;
  for (const [label, fn] of Object.entries(impls)) {
    if (typeof fn !== 'function') {
      console.error(`FAIL: could not extract a working implementation from ${label} -- ` +
        `the expected function shape was not found. This means someone changed the code in a ` +
        `way this test's extraction no longer recognises. Treat this as a failure, not a skip: ` +
        `update this test AND re-verify parity, don't just let it go quiet.`);
      failures++;
    }
  }
  if (failures) {
    console.error(`\n${failures} implementation(s) could not be loaded -- aborting parity checks.`);
    process.exit(1);
  }

  let mismatches = 0;
  for (const fixture of FIXTURES) {
    const results = {};
    for (const [label, fn] of Object.entries(impls)) {
      results[label] = fn(fixture.task);
    }
    const values = Object.values(results);
    const allAgree = values.every(v => v === values[0]);
    // Expected date compared at day-string granularity (fmt()), not raw
    // timestamp equality -- the canonical function mixes two date-construction
    // paths internally (new Date(isoString) for dateAdded/lastUpdated, which
    // JS parses as UTC midnight for a bare YYYY-MM-DD string, vs new
    // Date(y,m,d) for action-log entries, which is LOCAL midnight) so raw
    // timestamps can differ by a timezone offset even when every implementation
    // agrees on which CALENDAR DAY is correct. That mixed-precision behaviour
    // is a pre-existing characteristic of the canonical function, not something
    // this test is asserting on -- it is out of scope for the 15 Sep fix, which
    // was about WHICH date wins (creation vs genuine activity), not about
    // sub-day precision. This test's job is (a) drift detection between the
    // three copies, and (b) confirming the DAY selected is the genuine-activity
    // day, not the creation day, in the cases that exposed the original bug.
    const expected = new Date(fixture.expectYear, fixture.expectMonth, fixture.expectDay).getTime();
    const matchesExpected = values.every(v => fmt(v) === fmt(expected));

    console.log(`\n${fixture.name}`);
    for (const [label, v] of Object.entries(results)) {
      console.log(`  ${label}: ${fmt(v)}`);
    }
    console.log(`  expected: ${fmt(expected)}`);

    if (!allAgree && !values.every(v => fmt(v) === fmt(values[0]))) {
      console.error('  ** MISMATCH BETWEEN IMPLEMENTATIONS -- the three copies have drifted apart. **');
      mismatches++;
    } else if (!matchesExpected) {
      console.error('  ** All copies agree with each other, but NOT with the expected value -- ' +
        'either this test\'s expectation is wrong, or all copies share a NEW bug. Investigate. **');
      mismatches++;
    } else {
      console.log('  OK -- all copies agree (at day granularity) and match the expected genuine-activity date.');
    }
  }

  if (mismatches) {
    console.error(`\n${mismatches} of ${FIXTURES.length} fixture(s) failed. See above.`);
    process.exit(1);
  }
  console.log(`\nAll ${FIXTURES.length} fixtures pass across all checked implementations.`);
}

run();

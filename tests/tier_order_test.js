#!/usr/bin/env node
'use strict';

/* Extract the shipped helpers, rather than carrying a second implementation. */
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');

function extract(pattern) {
  const match = source.match(pattern);
  if (!match) throw new Error(`Could not find ${pattern}`);
  const start = match.index;
  let at = source.indexOf('{', start), depth = 0;
  for (; at < source.length; at++) {
    if (source[at] === '{') depth++;
    if (source[at] === '}' && --depth === 0) return source.slice(start, at + 1);
  }
  throw new Error(`Could not brace-match ${pattern}`);
}

const months = extract(/var CC_MONTHS=\{[^}]*\};/);
const helpers = [
  /function ccMonthIdx\(s\)\{/, /function sourceDateFromText\(s\)\{/, /function earliestActionTs\(t\)\{/,
  /function cardSourceTs\(t\)\{/, /function sortBySourceDate\(arr\)\{/, /function orderTier\(arr\)\{/
].map(extract).join('\n');
const orderTier = new Function(`${months}\n${helpers}\nreturn orderTier;`)();

function card(id, source, tierRank) {
  const task = { id, source };
  if (tierRank !== undefined) task.tierRank = tierRank;
  return task;
}
function ids(items) { return items.map(item => item.id).join(','); }
function expect(name, items, wanted) {
  const actual = ids(orderTier(items));
  if (actual !== wanted) throw new Error(`${name}: expected ${wanted}; got ${actual}`);
  console.log(`PASS: ${name}`);
}

expect('no ranks keeps pure newest-first source order', [
  card('old', '01 Jan 2026'), card('new', '03 Jan 2026'), card('mid', '02 Jan 2026')
], 'new,mid,old');
expect('ranked backbone is preserved', [
  card('rank-two', '03 Jan 2026', 2), card('rank-one', '01 Jan 2026', 1), card('rank-three', '02 Jan 2026', 3)
], 'rank-one,rank-two,rank-three');
expect('newest unranked card slots at the top', [
  card('rank-one', '02 Jan 2026', 1), card('rank-two', '01 Jan 2026', 2), card('new', '03 Jan 2026')
], 'new,rank-one,rank-two');
expect('unranked card dated between ranks slots between them', [
  card('rank-newer', '03 Jan 2026', 1), card('rank-older', '01 Jan 2026', 2), card('between', '02 Jan 2026')
], 'rank-newer,between,rank-older');
expect('dragged rank stays put when a newer card arrives', [
  card('dragged', '01 Jan 2026', 1), card('neighbour', '02 Jan 2026', 2), card('newer-arrival', '04 Jan 2026')
], 'newer-arrival,dragged,neighbour');
console.log('All tier ordering checks passed.');

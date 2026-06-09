# Inbox Pickup Routine

## Purpose
This document defines the exact procedure Seat A (Claude) follows when Kevin types a trigger phrase.
Do not improvise — follow these steps in order.

## Trigger Phrases
Any of the following triggers the full routine. No clarifying questions:
- "pick up inbox"
- "read inbox"
- "update from inbox"
- "inbox update"
- "sync inbox"

---

## Step 1 — Fetch Data

Fetch both files via GitHub API using the standard PAT:

```
GET https://api.github.com/repos/begb0037admin/work-inbox/contents/data/briefing.json?ref=main
GET https://api.github.com/repos/begb0037admin/command-centre/contents/data/tasks.json?ref=main
```

Decode both from base64. Note the `refreshed_at` field from briefing.json.

---

## Step 2 — Staleness Guard

Read `refreshed_at` from briefing.json.

**If the briefing is more than 24 hours old: STOP.**

Output:
```
⚠️ Briefing is stale (last refreshed: [refreshed_at])
Run fetch_inbox.py before proceeding.
```

Do not update any tasks from stale data.

---

## Step 3 — Match Emails to Tasks

Scan all items in `urgent`, `needs`, and `fyi` arrays from briefing.json.
For each item, check `title`, `subject`, and `sub` fields against the keyword table.

### Keyword Table

| Task ID | Title | Match on |
|---------|-------|----------|
| t002 | Smart notes escalation | "00476764", "smart notes", "CCC-19664", "Cority", "draft or come back to a note" |
| t003 | Flex points plan | "flex points", "flex spend", "Athena" + "holiday", "compliance reports" |
| t004 | Change management record | "change management", "OSM change", "Marie" + "approver" |
| t005 | Pay admin buy codes | "pay admin", "buy codes", "level 6", "Division 901" |
| t006 | SharePoint documentation | "SharePoint", "shared drive", "documentation" + "guidance" |
| t007 | DSC upload monitoring | "DSC upload", "SFTP", "Cardinus", "DSE upload", "data import" |
| t008 | Odyssey annual review | "Odyssey", "annual review" + "Marie" |
| t009 | DPIA sign-off | "DPIA", "data protection impact", "Stage 7", "Marie" + "sign" |
| t010 | ORCID into PXD | "ORCID", "Social Hub", "researcher" |
| t011 | OSM P1 risk | "P1", "Major Incident", "Ivanti", "OSM", "Priority 1" |
| t012 | Odyssey issue monitoring | "Odyssey" + "error", "Odyssey" + "issue" |
| t013 | Fortnightly 1-1 cadence | "Simon" + "1-1", "Simon / Kevin", "fortnightly" |
| t014 | Chemistry bulk delete | "68974493", "67938206", "CDR2025Chemistry", "bulk delete", "Chemistry" + "appraisal", "Reenu" |
| t015 | Applicant status deactivation | "Applicant Successfully Hired", "deactivat", "cleardown" |
| t016 | DSE data feed issues | "DSE" + "feed", "SBS" + "DSE", "Cardinus" + "import" |
| t017 | Iris/ECO Online enhancements | "Iris", "ECO Online", "Michael Hanson", "WCAG" |
| t018 | Risk Base access | "Risk Base", "fire" + "assessment" |

### VIP Senders — Always Surface
Check `sub` and `title` for these names regardless of task match:
- **Simon Burford**
- **Marie Cooksey**

### Confidence Levels
- **High**: Case number or exact technical phrase (e.g. "CCC-19664", "68974493")
- **Medium**: Keyword match without exact identifier
- **Low**: Sender match or partial keyword only

An email may match multiple tasks.

---

## Step 4 — Apply Updates

### High-confidence matches
Append a dated action entry to the matched task's `actions` array and push immediately.

Format: `[DD Mon YYYY] [Brief summary from email subject/context]`

Mandatory write pattern:
1. GET current `tasks.json` for fresh SHA
2. Decode, append action entry
3. Re-encode to base64
4. PUT with: `{ "message": "Inbox pickup — [date]", "content": "<base64>", "sha": "<sha>" }`

### Medium-confidence matches
Propose the update. Wait for Kevin's confirmation. Do not push without it.

### No match
List in "unmatched — for your review". Do not push.

### New task warranted
If a VIP sender email is clearly action-required and has no existing task home,
propose a new task. Do not create without Kevin's confirmation.

---

## Step 5 — Output Format

```
📥 Inbox pickup — [refreshed_at]

✅ Pushed updates
[task ID] [task title] — [action entry added]

⏳ Awaiting your confirmation
[task ID] [task title] — [proposed action] — [reason]

🔍 Unmatched — for your review
[sender] — [subject] — [briefing tier]

⚠️ VIP emails flagged
[sender] — [subject] — [briefing tier]
```

Omit any section that is empty.

---

## Step 6 — Safety Rules

These override everything else:

1. **Never modify `briefing.json`** — read only.
2. **Never delete or overwrite existing action entries** in `tasks.json` — append only.
3. **Never change a task's `tier`** without Kevin's explicit instruction.
4. **Never create a new task** without Kevin's confirmation.
5. **Always GET fresh SHA before PUT** — if 409, re-fetch and retry once.
6. **Stop and report** if any GitHub API call fails — do not proceed.

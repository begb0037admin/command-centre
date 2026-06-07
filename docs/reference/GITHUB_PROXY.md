# GitHub Proxy - Infrastructure Reference

**Status:** Live
**URL:** https://github-proxy.lelitte.co.uk
**Platform:** Cloudflare Worker (github-proxy) on kevinlelitte.workers.dev
**Cloudflare Account:** kevin@lelitte.com - Account ID f1896a0ef4e88f1f90abcc2cbbdd87f1
**Last updated:** 2026-06-07

---

## What This Is

A Cloudflare Worker that proxies authenticated GitHub API requests,
allowing Seat A (Claude chat) to read any file or directory in any
begb0037admin repo directly - without auth headers, without Seat B,
without copy-paste.

The GitHub PAT is stored as a Cloudflare Worker secret (GITHUB_PAT).
It is never stored in any file or repo.

---

## Why It Exists

Claude's web_fetch tool cannot pass custom HTTP headers, making direct
GitHub API calls impossible from Seat A. Every file read previously
required a Seat B PowerShell round-trip. This proxy removes that
friction permanently.

Approaches tried before the proxy:
- Direct GitHub API from Seat A: impossible, no custom header support
- raw.githubusercontent.com: blocked by tool URL restriction
- web_search then fetch: unreliable, did not index repo file paths
- GitHub MCP connector: not available in registry at time of setup

---

## Usage

### Read a file
https://github-proxy.lelitte.co.uk/{repo}/{file/path}

Examples:
  https://github-proxy.lelitte.co.uk/work-inbox/CHAT_PROMPT.md
  https://github-proxy.lelitte.co.uk/clockify/docs/reference/CLOCKIFY_KB.md
  https://github-proxy.lelitte.co.uk/command-centre/CLAUDE.md

### List a directory
https://github-proxy.lelitte.co.uk/{repo}/
https://github-proxy.lelitte.co.uk/{repo}/{subdir}/

Returns a plain-text list of FILE and DIR entries with full proxy URLs.
Always start a GitHub session with a directory listing - this unlocks
all subsequent file fetches automatically.

### Specific branch
https://github-proxy.lelitte.co.uk/{repo}/{path}?ref=dev
Default ref is main.

---

## Seat Rules

| Seat | GitHub reads | GitHub writes |
|------|-------------|---------------|
| A - Claude chat | Proxy directly | Not possible - use Seat B |
| B - Kevin | PowerShell + PAT | PowerShell + PAT |
| C - Cowork | Proxy if needed | git commands |
| D - Chrome | N/A | N/A |

Standard Seat A pattern for any GitHub session:
1. Fetch https://github-proxy.lelitte.co.uk/{repo}/ for directory listing
2. All file URLs appear in the result
3. Fetch any file directly from that point - no further setup needed

---

## Maintenance

### If the PAT is rotated
1. Update Cloudflare Worker secret via Seat B:
   Invoke-RestMethod -Uri https://api.cloudflare.com/client/v4/accounts/f1896a0ef4e88f1f90abcc2cbbdd87f1/workers/scripts/github-proxy/secrets -Method PUT ...
2. Update Kevin AND Hope preferences the same day
3. The proxy will work immediately - no redeployment needed

### If the Cloudflare token expires
Regenerate at dash.cloudflare.com - My Profile - API Tokens
Use the Edit Cloudflare Workers template, account: kevin@lelitte.com

---

## Infrastructure Details

Worker name:     github-proxy
Custom domain:   github-proxy.lelitte.co.uk
workers.dev URL: github-proxy.kevinlelitte.workers.dev (robots blocked - use custom domain)
Zone:            lelitte.co.uk (zone ID c701b9cfe61f86e3b5626a5d29141a47)
Secret stored:   GITHUB_PAT (never visible after creation)
Deployed:        2026-06-07

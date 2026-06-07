# GitHub Proxy — Infrastructure Reference

**Status:** Live
**URL:** `https://github-proxy.lelitte.co.uk`
**Platform:** Cloudflare Worker (`github-proxy`) — `kevinlelitte.workers.dev`
**Cloudflare Account:** `kevin@lelitte.com` · Account ID `f1896a0ef4e88f1f90abcc2cbbdd87f1`
**Last updated:** 2026-06-07

---

## What This Is

A Cloudflare Worker that proxies authenticated GitHub API requests,
allowing Seat A (Claude chat) to read any file or directory in any
`begb0037admin` repo directly — without auth headers, without Seat B,
without copy-paste.

The GitHub PAT is stored as a Cloudflare Worker secret (`GITHUB_PAT`).
It is never stored in any file or repo.

---

## Why It Exists

Claude's `web_fetch` tool cannot pass custom HTTP headers, making direct
GitHub API calls impossible from Seat A. Every file read previously
required a Seat B PowerShell round-trip. This proxy removes that
friction permanently.

Approaches tried before the proxy:
- Direct GitHub API from Seat A — impossible, no custom header support
- raw.githubusercontent.com — blocked by tool URL restriction
- web_search then fetch — unreliable, did not index repo file paths
- GitHub MCP connector — not available in registry at time of setup

---

## Usage

### Read a file

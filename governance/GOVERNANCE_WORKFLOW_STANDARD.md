# GOVERNANCE_WORKFLOW_STANDARD.md
# Governance Workflow Standard

**Version:** 1.0  
**Status:** Ratified  
**Ratified by:** Kevin Lelitte  
**Date:** 2026-06-21  
**Owner:** HR Systems, University of Oxford  
**Governed by:** CONSTITUTION.md  
**Scope:** All multi-repository governance operations under begb0037admin  

---

## 1. Purpose

This standard defines the mandatory workflow, artefacts, agent responsibilities, and handoff requirements for all governance operations affecting two or more repositories. It exists to ensure that governance actions are independently verified, recoverable, and approved by Kevin before closure.

This standard does not cover single-repository routine writes (task updates, inbox triage, roadmap reads). It applies to any operation that:
- modifies shared governance files (CONSTITUTION.md, AGENT_MODEL.md, CLAUDE.md) across multiple repositories;
- adds or removes repositories from governance scope;
- changes authentication, credential, or access architecture; or
- is designated as a named Phase by Kevin.

---

## 2. Mandatory Artefact Set

Every governed operation produces the following artefacts in sequence. No stage may begin until all artefacts required by the preceding stage exist and are verified.

| Stage | Artefact | Template | Produced by |
|-------|----------|----------|-------------|
| 1 — Execute | Work product (code, files, commits) | — | Executing agent |
| 2 — Evidence | Phase Evidence Package | PHASE_EVIDENCE_PACKAGE_TEMPLATE.md | Executing agent |
| 3 — Review | Phase Review Request | PHASE_REVIEW_REQUEST_TEMPLATE.md | Executing agent |
| 3 — Challenge | Phase Challenge Report | PHASE_CHALLENGE_REPORT_TEMPLATE.md | Challenging agent |
| 4 — Remediation (conditional) | Phase Remediation Request | PHASE_REMEDIATION_REQUEST_TEMPLATE.md | Executing agent |
| 4 — Remediation (conditional) | Phase Remediation Evidence | PHASE_REMEDIATION_EVIDENCE_TEMPLATE.md | Executing agent |
| 5 — Validation | Phase Validation Request | PHASE_VALIDATION_REQUEST_TEMPLATE.md | Executing agent |
| 5 — Validation | Phase Validation Report | PHASE_VALIDATION_REPORT_TEMPLATE.md | Challenging agent |
| 6 — Governance | Phase Governance Review Request | PHASE_GOVERNANCE_REVIEW_REQUEST_TEMPLATE.md | Executing agent |
| 6 — Governance | Phase Governance Decision | PHASE_GOVERNANCE_DECISION_TEMPLATE.md | Kevin |

Stages 4 and 5 (Remediation and Validation) are conditional: required if the Challenge Report finds any FAIL or PARTIAL findings; skipped if all findings are PASS.

---

## 3. Stage Definitions

### Stage 1 — Execute

The executing agent performs the approved work. All writes follow the backup-first protocol defined in AGENT_MODEL.md Section 4 and the applicable CLAUDE.md. The executing agent records commit SHAs, content SHAs, and backup locations as work proceeds — not retrospectively.

**Exit criterion:** All intended writes committed to the target branch. No exit criterion requires Kevin's input at this stage unless an approval gate (AGENT_MODEL.md Section 2) is triggered mid-execution.

### Stage 2 — Evidence

The executing agent produces a Phase Evidence Package using the PHASE_EVIDENCE_PACKAGE_TEMPLATE.md. The package must contain primary evidence (commit SHAs, content SHAs, API response excerpts) for every claim. Assertions without evidence are inadmissible.

The package is committed to `governance/evidence/` in command-centre with the filename pattern `PHASE_[NAME]_EVIDENCE_PACKAGE_YYYYMMDD.md`.

**Exit criterion:** Evidence Package committed to main and GET-verified.

### Stage 3 — Review and Challenge

The executing agent produces a Phase Review Request addressed to an independent challenging agent (typically Codex or a fresh Claude Code session). The request is committed alongside the Evidence Package. The executing agent explicitly instructs the challenger to treat the Evidence Package as an unverified claim set — not as an authoritative record.

The challenging agent independently verifies each claim in the Evidence Package. Where verification requires a live API call, the challenger must make it. Where it cannot be independently verified, the challenger must state that explicitly as a PARTIAL or FAIL finding.

The Challenge Report is committed to `governance/evidence/` with the filename pattern `PHASE_[NAME]_CHALLENGE_REPORT_YYYYMMDD.md`.

**Exit criterion:** Challenge Report committed. If all findings are PASS → proceed to Stage 6. If any finding is FAIL or PARTIAL → Stage 4 is mandatory.

### Stage 4 — Remediation (conditional)

The executing agent produces a Remediation Request documenting each gap identified in the Challenge Report and the proposed remediation action. On Kevin's approval, the executing agent implements the remediation and produces a Remediation Evidence document.

Remediation Evidence follows the same backup-first and GET-verify protocol as Stage 1.

**Exit criterion:** All FAIL/PARTIAL findings addressed. Remediation Evidence committed.

### Stage 5 — Validation (conditional)

The executing agent submits a Validation Request to the challenging agent. The challenger independently re-verifies each previously failed or partial finding.

The Validation Report records a revised finding for each item. All items must reach PASS before Stage 6 can proceed.

**Exit criterion:** Validation Report committed with all findings at PASS.

### Stage 6 — Governance Decision

The executing agent produces a Governance Review Request summarising the full evidence chain for Kevin. Kevin reviews the chain and issues a Governance Decision (APPROVED / REJECTED / DEFERRED). No governed operation is considered complete until a Governance Decision at APPROVED has been committed.

**Exit criterion:** Governance Decision committed by Kevin. Operation is closed.

---

## 4. Agent Responsibilities

### Executing Agent (Claude Code)

- Performs Stage 1 work under AGENT_MODEL.md Section 3 (Execution Protocol).
- Produces all evidence-side artefacts (Stages 2, 4 execute, 5 request, 6 request).
- Does not self-challenge. The executing agent must not produce the Challenge Report or Validation Report for work it performed.
- Commits all artefacts to command-centre `governance/` before handing off.
- Notifies Kevin at the Stage 3 handoff and again at Stage 6.

### Challenging Agent (Codex / independent Claude Code session)

- Receives the Review Request and Evidence Package as its sole inputs. The challenging agent has no memory of the execution session and must treat all claims as unverified.
- Independently queries GitHub API to verify commit SHAs, content SHAs, repository scope, and backup existence.
- Records each finding as PASS, PARTIAL, or FAIL with primary evidence.
- Does not communicate with the executing agent during the challenge. All findings are committed to the repo.
- Produces the Challenge Report and, where Stage 5 is required, the Validation Report.

### Kevin (Approval Authority — Seat B)

- Reviews and approves the Governance Review Request before Stage 6 artefact is committed.
- Issues the Governance Decision.
- May DEFER if evidence chain is incomplete or if a finding requires escalation.
- The Governance Decision is the only artefact in this workflow that Kevin commits directly.

---

## 5. Handoff Requirements

### Executing Agent → Challenging Agent (Stage 3 handoff)

The Review Request must include:
1. The repository path of the Evidence Package (owner/repo/path at commit SHA).
2. Explicit instruction that the Evidence Package is an unverified claim set.
3. The complete list of verification tasks, with required evidence type for each.
4. A statement of what the challenging agent must NOT accept as evidence (e.g., the executing agent's own assertions).
5. The commit SHA of the Review Request itself, for chain integrity.

### Challenging Agent → Executing Agent (Stage 3 → 4 handoff, if remediation required)

The Challenge Report must include:
1. A finding for every verification task listed in the Review Request. No silent passes.
2. For each FAIL or PARTIAL: the specific gap, the expected evidence, and what was actually found.
3. A clear overall verdict: ALL PASS (→ Stage 6) or GAPS FOUND (→ Stage 4).

### Executing Agent → Kevin (Stage 6 handoff)

The Governance Review Request must include:
1. A one-paragraph plain-English summary of what was done and what was verified.
2. The full artefact chain with repository paths and commit SHAs for every document.
3. Any residual risks or open items not resolved during remediation.
4. A clear statement of what Kevin is being asked to approve.

---

## 6. Naming Conventions

All governance artefacts are stored in `governance/evidence/` within the command-centre repository and named as follows:

| Artefact | Filename pattern |
|----------|------------------|
| Evidence Package | `PHASE_[NAME]_EVIDENCE_PACKAGE_YYYYMMDD.md` |
| Review Request | `PHASE_[NAME]_REVIEW_REQUEST_YYYYMMDD.md` |
| Challenge Report | `PHASE_[NAME]_CHALLENGE_REPORT_YYYYMMDD.md` |
| Remediation Request | `PHASE_[NAME]_REMEDIATION_REQUEST_YYYYMMDD.md` |
| Remediation Evidence | `PHASE_[NAME]_REMEDIATION_EVIDENCE_YYYYMMDD.md` |
| Validation Request | `PHASE_[NAME]_VALIDATION_REQUEST_YYYYMMDD.md` |
| Validation Report | `PHASE_[NAME]_VALIDATION_REPORT_YYYYMMDD.md` |
| Governance Review Request | `PHASE_[NAME]_GOVERNANCE_REVIEW_REQUEST_YYYYMMDD.md` |
| Governance Decision | `PHASE_[NAME]_GOVERNANCE_DECISION_YYYYMMDD.md` |

`[NAME]` is the uppercase phase identifier (e.g., `1`, `2A`, `CONSTITUTION_V2`).

---

## 7. Relationship to Other Governance Documents

| Document | Relationship |
|----------|--------------|
| CONSTITUTION.md | Supreme authority. This standard operates within it. |
| AGENT_MODEL.md | Defines execution mechanics, backup rules, and approval gates referenced in Stages 1 and 4. |
| CLAUDE.md (per repo) | Defines repo-specific backup and branch rules that Stage 1 must follow. |
| HANDOVER.md (command-centre) | Updated at session close to reference all committed governance artefacts. |

---

## 8. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-06-21 | Initial ratification. Establishes 6-stage workflow, 10-artefact set, and agent responsibilities. |

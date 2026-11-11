---
name: wave-orchestrator
description: Execute an existing multi-terminal wave specification by keeping the invoking Codex agent as orchestrator, delegating disjoint work to subagents with task-appropriate Sol, Terra, or Luna models, batching around concurrency limits, integrating patches, and running the wave gates. Use when the user asks to implement a wave with different models or agents. Do not use merely to design a phased plan.
disable-model-invocation: true
---

# Wave Orchestrator

Execute the supplied wave; do not rewrite its architecture. The invoking agent remains the orchestrator and owns integration, shared files, final gates, and user updates.

## Before delegation

1. Read repository agent instructions and the wave file. If the repository requires a code-intelligence tool such as Graphify, use it before raw browsing.
2. Extract each terminal's dependencies, owned files, forbidden files, done criteria, tests, and shared-file patches.
3. Inspect worktree state without modifying it. Preserve unrelated user changes.
4. Use worktrees only when the branch baseline contains the current wave and required uncommitted work. Otherwise use separate subagent shell sessions in the shared workspace with strict file ownership; state this distinction to the user.
5. Keep a short plan/status checkpoint. Host context compaction is automatic; never claim to have invoked a manual compaction control unless one is actually available.

## Route models

Use current official OpenAI model guidance when model names or roles may have changed. Default routing:

- `gpt-5.6-sol`: ambiguous, cross-cutting, security-critical, data-loss-sensitive, or final-gate work.
- `gpt-5.6-terra`: ordinary backend/frontend implementation, integration-heavy features, and nuanced UI work.
- `gpt-5.6-luna`: bounded data, fixtures, deterministic tests, mechanical documentation, and narrow repeatable changes.

Reasoning effort should match risk, not model prestige: high or xhigh for security/integration work; medium or high for bounded work. Preserve any model the user explicitly requests.

## Launch safely

- Reserve one concurrency slot for the orchestrator. Batch excess terminals; start dependencies only after their inputs exist.
- Spawn one subagent per terminal section. Its prompt must carry the wave section, repository rules, ownership boundaries, exact tests, and required final report.
- Agents may edit only owned files. Shared or forbidden-file changes are proposed under the wave's patch convention and applied only by the orchestrator.
- Do not push, commit, call paid providers, or perform external/destructive actions unless the user explicitly authorized them.
- While workers run, the orchestrator may inspect and prepare integration, but must not race an active worker in its owned files.
- Tell the user which terminals started, which are queued, and why. Separate agent sessions are not the same thing as visible GUI Terminal windows.

## Integrate

1. Review every worker report and diff for ownership violations, hidden blockers, and conflicting assumptions.
2. Apply shared-file patches centrally using the repository's edit conventions.
3. Run focused tests, then the exact full backend, client, container, UI, ledger, and mutation gates required by the wave.
4. Update coverage only from observed evidence. External host, account, licence, simulator, or human work remains partial or blocked.
5. Run the repository's required code-index refresh after code changes.
6. Report model/terminal assignments, files delivered, exact gate counts, queued or external gaps, and whether sessions were shared-workspace shells or isolated worktrees.

Stop only when the local wave outcome is integrated and verified, or when the remaining work requires new authority or unavailable external state.

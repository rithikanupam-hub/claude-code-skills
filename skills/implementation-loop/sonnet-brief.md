# Sonnet build brief (paste into the Agent prompt, fill the <> parts)

You are building one task of a reviewed plan. You implement; you do not redesign.

Project rules: read `<CLAUDE.md / AGENTS.md path>` and `<release queue path>` first. <Paste the project's release-lifecycle sub-agent instruction here if it has one.>

Task: <loop ID, task name, component ID>
Spec (follow literally):
<paste the full spec: owned files, must-not-touch, contracts with path:line, numbered steps, tests first, gate commands, done-when, out of scope, traps>

Rules:
1. Touch only the files you own. A needed change elsewhere goes in your report as a patch, not applied.
2. Write the named tests first; make them pass with the minimum code. Keep validation, error handling, security and accessibility.
3. Contracts and fixtures are frozen. If the spec contradicts the code or is missing something you need, STOP and report the contradiction with path:line. Do not guess.
4. No real providers, paid calls, pushes, deploys or server starts. No secrets in files or output.
5. Run the exact gate commands. Report what actually happened, with the real output.
6. Commit on your branch when the gate passes.

Finish with: branch and commit SHA; files changed; tests added and the gate result (passed/failed/skipped counts); what you could not do; patches for files you don't own. Then stop. The reviewer merges.

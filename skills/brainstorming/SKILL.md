---
name: brainstorming
description: You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation.
disable-model-invocation: true
---

# brainstorming Skill

**Description:** "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."

## Purpose
Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

## Process
1. Start by understanding the current project context, then ask questions one at a time to refine the idea
2. Once you understand what you're building, present the design and get user approval

## HARD-GATE
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has approved it. This applies to EVERY project regardless of perceived simplicity.

## Checklist
1. Explore project context — check files, docs, recent commits
2. Offer visual companion (if topic will involve visual questions) — this is its own message, not combined with a clarifying question
3. Ask clarifying questions — one at a time, understand purpose/constraints/success criteria
4. Propose 2-3 approaches — with trade-offs and your recommendation
5. Present design — in sections scaled to their complexity, get user approval after each section
6. Write design doc — save to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` and commit
7. Spec self-review — quick inline check for placeholders, contradictions, ambiguity, scope
8. User reviews written spec — ask user to review the spec file before proceeding
9. Transition to implementation — invoke writing-plans skill to create implementation plan

## Anti-Pattern
Every project goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Key Principles
- **One question at a time** - Don't overwhelm with multiple questions
- **Multiple choice preferred** - Easier to answer than open-ended when possible
- **YAGNI ruthlessly** - Remove unnecessary features from all designs
- **Explore alternatives** - Always propose 2-3 approaches before settling
- **Incremental validation** - Present design, get approval before moving on
- **Be flexible** - Go back and clarify when something doesn't make sense

## Visual Companion
A browser-based companion for showing mockups, diagrams, and visual options during brainstorming. Available as a tool — not a mode.

**Offering the companion:** When you anticipate that upcoming questions will involve visual content, offer it once for consent:
> "Some of what we're working on might be easier to explain if I can show it to you in a web browser. I can put together mockups, diagrams, comparisons, and other visuals as we go. This feature is still new and can be token-intensive. Want to try it? (Requires opening a local URL)"

**Rules:**
- This offer MUST be its own message. Do not combine it with clarifying questions, context summaries, or any other content.
- Per-question decision: Use the browser for content that IS visual (mockups, wireframes, layout comparisons, architecture diagrams, side-by-side visual designs). Use the terminal for content that is text (requirements questions, conceptual choices, tradeoff lists, A/B/C/D text options, scope decisions).
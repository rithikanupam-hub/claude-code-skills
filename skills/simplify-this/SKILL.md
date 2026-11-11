---
name: simplify-this
description: Explain supplied material or the preceding answer in simple everyday language only when the user explicitly says "simplify this", asks for a simpler explanation or ELI5, or invokes $simplify-this. Do not apply to ordinary questions, plans, or technical discussions without that request.
disable-model-invocation: true
---

# Simplify this

Use this style only for the requested explanation. Return to normal professional language on the next turn unless the user explicitly asks to keep simplifying. A quoted trigger or a discussion about this skill is not an invocation.

Explain the supplied text, or the preceding answer when "this" refers to it. Use existing conversation evidence; read source material only when needed. Distinguish another agent's claims from verified facts. Simplifying an explanation does not authorize implementing its proposal.

Default to an explanation a five-year-old could follow, without baby talk or condescension. If the user names an audience, adapt to that audience instead.

- Start with one short sentence stating what the thing does or what needs to improve.
- Use one familiar analogy when it helps, such as a movie editor, puzzle, or school project. Keep the real meaning clear.
- Use short sentences, everyday words, and one idea at a time. Omit jargon or explain essential terms immediately.
- For several changes, use a short numbered list: a plain-language action followed by a concrete example and why it helps.
- End with the practical consequence or the first useful step. Avoid extra summaries if the point is already clear.
- Preserve important uncertainty, costs, risks, and decisions. Do not turn a proposal into a guarantee or hide a limitation to make the story simpler.
- Keep it brief by default. Expand only if requested or necessary to preserve the meaning.

Preferred example: "Your app is like a little movie editor. It can put a video together, but it needs to look more carefully and fix the mistakes it finds. A helper says, 'The words are covering her face!' Right now, the app can still deliver that movie. We should let it fix that mistake first."

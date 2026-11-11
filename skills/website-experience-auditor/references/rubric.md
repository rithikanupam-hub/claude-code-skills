# Evidence audit rubric (Track A)

Every point needs a file reference (screen or source) and is an observation, not an opinion about how customers feel.

## 0. Layman checks (required, before the matrix)
The site is judged on whether **any layman** understands it, not on whether a marketer likes it.
| Check | How | Output |
|---|---|---|
| **Drunk-user test** | Per section, look only at big text + the picture for 3 seconds. Could a tired, distracted (or drunk) visitor say what it is and what to do, without thinking? | Pass / fail per section, with the screen |
| **Grandpa test** | Could a 75-year-old who never used an app follow each headline and sentence? Flag jargon, English words, tech words, abstract lines, insider terms, missing subjects ("lui" who?) | List of words/sentences that fail, each with a plain rewrite |
| **Communication** | Write the site's message as received, in one sentence a layman would say. Compare with the intended message from `site.md` | Intended vs received, match / drift |
| **Problem statement** | Is the visitor's own problem clear (the need the product answers, in their words)? Respect the site's rules on *where* problem stats go | Clear / implied / absent, with the screen |
| **Sentence pass** | Read **every sentence** on every page and collapsed state, in order, not just headlines. One row each: `screen | sentence | what a layman understands | problem (jargon / abstract / ambiguous / grammar / unconfirmed claim / repeats) | plain rewrite or keep`. Save as `SENTENCES.md` | Table + count of sentences that fail |
| **Length** | Total screens per device; screens until the first concrete answer; screens until the next CTA; where each persona stopped vs where the answer to their question sits. No fixed limit: a page is too long when the answer a persona needs sits after the point where they stop | Verdict per persona + which sections to cut or move |

## 1. Section matrix (required)
| Section | Intended message | Visibly communicated (big text / small text / visual) | Personas noticed | Personas understood | Unanswered | Gap type | Smallest useful change |
Gap types: Missing · Easy to miss · Misunderstood · Unconvincing. Pick the fix that matches the type: add (missing), move or enlarge (easy to miss), reword or re-picture (misunderstood), proof (unconvincing).

## 2. Messaging
- Screen 00: what it is, for whom, the next step.
- Headlines: concrete vs mood. Generic test: could a competitor use the line unchanged?
- Support lines explain *how* the headline is true.
- Terms the audience wouldn't use; inconsistencies between pages; grammar.
- Claims: allowed by the brand rules and present in `facts.md`.

## 3. Visuals by purpose
| Visual | Job (explain / recognise / remember / brand) | Does it do the job? | Attention cost (screens; before or after the first concrete answer) | Keep / shorten / move / remove + reason |

## 4. Commitment per audience
| Audience | Action asked | What they must know to do it | Present? | Where |

## 5. UX
Navigation labels, CTA wording and what happens after it, form fields vs need, success and error states, mobile reach and legibility, links to other audiences, legal and trust markers.

## 6. Brand fit
Against `brand-criteria.md`: what lands, what drifts, conflicts between the owner's own documents (flag them, don't pick a side).

## 7. Keep list
What works, with the evidence, so the next round doesn't lose it.

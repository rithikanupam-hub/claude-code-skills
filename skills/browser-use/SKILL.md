---
name: browser-use
description: Drive a real Chrome browser with the browser-use CLI (click, type, log in, book, scrape JS pages), or build a hosted browser-use agent. Manual only, via /browser-use.
disable-model-invocation: true
---

# Browser Use

Installed 2026-10-14: browser-use 0.13.11 in this folder's own venv. Nothing is on PATH, so call it by full path:

```bash
BU=~/.claude/skills/browser-use/.venv/bin/browser-use
```

## Two modes

1. **Claude drives the browser (default).** Claude is the LLM, so no API key is needed. Use the CLI with Python heredocs:
   ```bash
   $BU <<'PY'
   new_tab("https://example.com")
   wait_for_load()
   print(page_info())
   PY
   ```
   Helpers are pre-imported (`new_tab`, `goto_url`, `wait_for_load`, `page_info`, `js`, `cdp`, `click_at_xy`, `list_tabs`, `switch_tab`, `ensure_real_tab`, ...).
   Read the full reference only when you need it: `$BU skill` (about 15 KB, so don't read it by default).

2. **Hosted bot (browser-use's own agent with its own LLM).** For a server or cloud service, use the Python `Agent` from `.venv/bin/python`. It needs an LLM key (`ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, or `BROWSER_USE_API_KEY` for `ChatBrowserUse`). None is set on this Mac as of 2026-10-14. Check `inspect.signature(Agent.__init__)` before writing code, because the API changes between versions.

## Token rules (follow every time)

- If `curl` or WebFetch can read the page, don't open a browser.
- Find elements through the accessibility tree and **filter in Python before printing**. Never print the whole AX tree, the HTML, or `page_info()` in a loop.
- Use a screenshot only when the layout or an image matters.
- Batch several actions into one heredoc, and print only what proves the step worked.
- Reuse one tab and the default daemon. Don't make a new `new_tab()` per call, and don't create named daemons.
- For a flow that repeats, save the working steps as a script in `scripts/` and replay it next time instead of re-exploring.
- Hosted agent: `use_vision=False` (or `"auto"`), `flash_mode=True` with a cheap model for steps, a stronger `fallback_llm`, `max_history_items`, `allowed_domains`, `max_steps`, and `calculate_cost=True` to measure.

## Safety (booking, payments, accounts)

- **Stop before paying.** Show the user the final item, date, seats and total, and get an explicit yes for that exact purchase.
- Never type card numbers, passwords or OTPs on your own. Ask the user to enter them in the visible browser, or to pass them in that turn.
- Stop at login walls, MFA, consent screens and CAPTCHAs, and hand control to the user.
- Never call `activate_tab()` unless the user asks to see the tab.

## macOS first run

The first local command may wait for Chrome's remote-debugging "Allow" prompt. Leave that command running and run `$BU mac-approve` in a second call. If it reports `accessibility-required`, ask the user once to grant Accessibility to the terminal app. If something breaks, run `$BU --doctor`.

## Cloud browsers

Use them for parallel tasks or bot-protected sites. Check `$BU auth status`; if there's no auth, ask the user to run `! ~/.claude/skills/browser-use/.venv/bin/browser-use auth login`. Cloud browsers bill until stopped, so ask before leaving one running (`stop_remote_daemon(name)`).

## Update

`$BU --update -y`, then record the new version in the first line of this file.

## Lessons learned
- 2026-10-14: `capture_screenshot()` returns a file path (str), not base64; Read that path. `timeout` is not on macOS PATH. ITDOG (itdog.cn/http) shows placeholder results on page load and gates real runs behind a click-the-characters CAPTCHA, so hand that step to the user; never read its default numbers as a result.
- 2026-10-14 (Gmail attachments): the Claude-in-Chrome extension was not connected, browser-use worked instead. The daemon's Chrome only had one Gmail account signed in; the second account lives in Chrome "Profile 6", opened into the same debuggable Chrome with `open -a "Google Chrome" --args --profile-directory="Profile 6" "<gmail compose url>"`, then `list_tabs()` + `switch_tab()` on the tab whose title names the account (check `~/Library/Application Support/Google/Chrome/Local State` → profile.info_cache for which profile holds which account). Attach files with CDP `DOM.setFileInputFiles` on Gmail's hidden `input[type=file][name=Filedata]` (no picker, no 10 MB tool cap); poll `[role=progressbar]` count in the compose dialog until 0. Script: `scripts/gmail-attach.py`. Avoid `\s` regexes inside `js("""...""")` strings; split('\n') is safer.
- 2026-10-16 (Lovable): the daemon's Chrome may be logged into the app but NOT into Lovable with an account that can open the project ("You don't have access"); opening Profile 6 did not attach a new debuggable tab. Hand the Lovable login to the user. React inputs: set values via the native value setter + input/change events inside an IIFE (re-declaring `const` across `js()` calls throws).
- 2026-10-25 (LinkedIn outreach): `new_tab("https://www.linkedin.com/...")` opened in a Chrome context that was NOT signed in (authwall), while existing "Feed | LinkedIn" tabs were signed in as the founder. Fix: `list_tabs()`, pick the signed-in LinkedIn tab, `switch_tab()` and `goto_url()` inside it. `cdp("Target.closeTarget", {"targetId": ...})` failed with "mandatory field missing"; leave stray tabs rather than fight it. `img.global-nav__me-photo` alt is empty on the new LinkedIn nav, so identify the account by opening `/in/me/` in that tab instead.

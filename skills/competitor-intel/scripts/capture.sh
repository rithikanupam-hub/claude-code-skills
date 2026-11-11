#!/usr/bin/env bash
# competitor-intel capture: screenshots + computed fonts/colours + page text for one URL.
# Usage: capture.sh <url> <out_dir>          e.g. capture.sh https://www.veo.com research/competitors/veo/captures/2026-11-04
# Writes into out_dir (prefix = page slug, "home" for the root):
#   <p>-hero.png (current Chrome viewport, as loaded)   <p>-hero-clean.png (cookie/overlay layers hidden, not accepted)
#   <p>-hero-t4.png, <p>-hero-t8.png (hero again after 4s/8s: shows what a hero video cycles through)
#   <p>-full.png (full page)  <p>-full-tiles/NN.jpg (readable 50% slices)  <p>-computed.json  <p>-text.txt
# Uses the browser-use CLI (local Chrome via CDP). Prints only a short summary (token rule).
set -euo pipefail
URL="${1:?url}"; OUT="${2:?out_dir}"
mkdir -p "$OUT"
BU="$HOME/.claude/skills/browser-use/.venv/bin/browser-use"
SLUG=$(python3 -c "import sys,urllib.parse as u;p=u.urlparse(sys.argv[1]).path.strip('/');print(p.replace('/','-') or 'home')" "$URL")
export CI_URL="$URL" CI_OUT="$(cd "$OUT" && pwd)" CI_SLUG="$SLUG" CI_JS="$(dirname "$0")/capture.js"
CI_JS="$(cd "$(dirname "$CI_JS")" && pwd)/capture.js"; export CI_JS

"$BU" <<'PY'
import os, json, time
url, out, slug = os.environ["CI_URL"], os.environ["CI_OUT"], os.environ["CI_SLUG"]
P = lambda name: os.path.join(out, f"{slug}-{name}")
cdp("Emulation.setDeviceMetricsOverride", width=1440, height=900, deviceScaleFactor=1, mobile=False)
new_tab(url); wait_for_load(); wait(3)
capture_screenshot(P("hero.png"))
js("""(() => { for (const el of document.querySelectorAll('body *')) { const s = getComputedStyle(el);
  if ((s.position === 'fixed' || s.position === 'sticky') && /cookie|consent|privacy|gdpr|accept/i.test((el.innerText||'') + el.id + el.className) && el.tagName !== 'HEADER')
    el.style.setProperty('display', 'none', 'important'); }
  for (const id of ['onetrust-consent-sdk','CybotCookiebotDialog','usercentrics-root','cookiebanner']) { const e = document.getElementById(id); if (e) e.style.setProperty('display','none','important'); } })()""")
wait(0.5); capture_screenshot(P("hero-clean.png"))
wait(4); capture_screenshot(P("hero-t4.png"))
wait(4); capture_screenshot(P("hero-t8.png"))
# scroll to trigger lazy media, then capture data at the top
h = js("document.body.scrollHeight") or 0
for y in range(0, int(h), 700):
    js(f"window.scrollTo(0,{y})"); wait(0.35)
js("window.scrollTo(0,0)"); wait(1.5)
data = js(open(os.environ["CI_JS"]).read())
open(P("computed.json"), "w").write(json.dumps(json.loads(data), indent=1, ensure_ascii=False))
open(P("text.txt"), "w").write(js("document.body.innerText") or "")
try:
    capture_screenshot(P("full.png"), full=True)
except Exception as e:  # very long pages: stitch viewport shots instead
    from PIL import Image
    vh = js("window.innerHeight"); shots = []
    for i, y in enumerate(range(0, int(h), int(vh))):
        js(f"window.scrollTo(0,{y})"); wait(0.6); shots.append(Image.open(capture_screenshot(P(f"_s{i}.png"))).convert("RGB"))
    W = shots[0].width; scale = W / js("window.innerWidth")
    canvas = Image.new("RGB", (W, sum(s.height for s in shots)))
    for i, s in enumerate(shots): canvas.paste(s, (0, int(i * vh * scale)))
    canvas.save(P("full.png"))
    for i in range(len(shots)): os.remove(P(f"_s{i}.png"))
    js("window.scrollTo(0,0)")
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
im = Image.open(P("full.png")).convert("RGB")
tiles = P("full-tiles"); os.makedirs(tiles, exist_ok=True)
step = 1800
for i, y in enumerate(range(0, im.height, step)):
    t = im.crop((0, y, im.width, min(y + step, im.height)))
    t.thumbnail((720, 900)); t.save(os.path.join(tiles, f"{i:02d}.jpg"), quality=80)
d = json.loads(data)
print(json.dumps({"saved": out, "slug": slug, "title": d["title"], "h1": d["hero"]["h1"], "fonts": [f["value"] for f in d["fontsByTextVolume"][:3]],
  "pageHeight": d["pageHeight"], "images": d["media"]["imageCount"], "videos": d["media"]["videoCount"], "tiles": len(os.listdir(tiles))}, ensure_ascii=False))
PY

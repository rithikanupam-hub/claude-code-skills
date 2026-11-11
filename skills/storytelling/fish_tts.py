#!/usr/bin/env python3
"""Fish Audio TTS for the project narration. Stdlib only.

Key: FISH_AUDIO_API_KEY in "Open Conversation/.env" (or the environment).

  # find a voice (e.g. a Japanese-accented English narrator)
  python3 fish_tts.py voices "japanese accent english"

  # make a take; direct delivery inline with [brackets]
  python3 fish_tts.py say "[calm, slightly amused] Nobody told the robot." \
      --voice <voice_id> --out take1.wav

Options: --model s2.1-pro (default) | s2-pro | s1, --speed 1.0, --temp 0.7, --format wav|mp3
"""
import argparse, json, os, sys, urllib.parse, urllib.request
from pathlib import Path

API = "https://api.fish.audio"
ENV = Path.home() / "Open Conversation" / ".env"


def key():
    k = os.environ.get("FISH_AUDIO_API_KEY", "").strip()
    if not k and ENV.exists():
        for line in ENV.read_text().splitlines():
            if line.startswith("FISH_AUDIO_API_KEY="):
                k = line.split("=", 1)[1].strip().strip('"\'')
    if not k:
        sys.exit(f"FISH_AUDIO_API_KEY is empty. Paste your key into {ENV}")
    return k


def call(req):
    try:
        return urllib.request.urlopen(req, timeout=180)
    except urllib.error.HTTPError as e:
        msg = {401: "bad API key", 402: "no credit left on Fish Audio"}.get(e.code, "")
        sys.exit(f"Fish Audio error {e.code} {msg}: {e.read()[:300].decode(errors='ignore')}")


def voices(query, n):
    q = urllib.parse.urlencode({"title": query, "page_size": n, "sort_by": "score"})
    req = urllib.request.Request(f"{API}/model?{q}", headers={"Authorization": f"Bearer {key()}"})
    data = json.load(call(req))
    for m in data.get("items", []):
        langs = ",".join(m.get("languages", []))
        print(f"{m['_id']}  {m.get('title','')[:50]:50}  [{langs}]  likes={m.get('like_count',0)}")
    print(f"\nListen first: https://fish.audio/m/<id>")


def say(a):
    body = {"text": a.text, "format": a.format, "temperature": a.temp,
            "prosody": {"speed": a.speed, "normalize_loudness": True}}
    if a.voice:
        body["reference_id"] = a.voice
    req = urllib.request.Request(f"{API}/v1/tts", data=json.dumps(body).encode(), headers={
        "Authorization": f"Bearer {key()}", "Content-Type": "application/json", "model": a.model})
    Path(a.out).write_bytes(call(req).read())
    print(f"saved {a.out}  ({len(a.text)} chars, model {a.model})")


p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
sub = p.add_subparsers(dest="cmd", required=True)
v = sub.add_parser("voices"); v.add_argument("query"); v.add_argument("-n", type=int, default=15)
s = sub.add_parser("say"); s.add_argument("text"); s.add_argument("--voice"); s.add_argument("--out", default="fish_take.wav")
s.add_argument("--model", default="s2.1-pro"); s.add_argument("--speed", type=float, default=1.0)
s.add_argument("--temp", type=float, default=0.7); s.add_argument("--format", default="wav")
a = p.parse_args()
voices(a.query, a.n) if a.cmd == "voices" else say(a)

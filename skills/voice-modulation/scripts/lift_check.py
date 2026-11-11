#!/usr/bin/env python3
"""Does the voice lift where the score says, and stay plain everywhere else?  (numbers only, never a listening claim)
Usage: lift_check.py <take.wav> <take.words.json> <phrases.json>
phrases.json = [{"name":"genova","i":0,"j":6}, {"name":"meritocrazia","i":39,"j":41,"lift":"land"}, ...]  (word indexes, inclusive)
Per phrase it prints: median pitch in semitones against the take's median, pitch spread (p10-p90), loudness against the take's
median, words per second. Then two verdicts:
  lift = true  -> the voice goes UP (brighter, fuller);  lift = "land" -> the words are LANDED (slower, firm, not quieter)
  LIFT OK / LIFT WEAK  for every phrase marked lift: it should sit above the plain phrases in pitch or loudness (>= +1.0 st or >= +1.5 dB vs the plain median)
  plain ok / OVERSOLD  for every other phrase: OVERSOLD when it sits >= 3 st above the plain median without being quieter (a phrase acted that the score left plain)
Run it in an environment with librosa (e.g. Open Conversation/lingosync/.venv/bin/python)."""
import json, sys, numpy as np, librosa, warnings; warnings.filterwarnings('ignore')
wav, wj, pj = sys.argv[1:4]
y, sr = librosa.load(wav, sr=16000, mono=True); W = json.load(open(wj)); P = json.load(open(pj))
hop = 160
f0, _, _ = librosa.pyin(y, fmin=60, fmax=400, sr=sr, frame_length=1024, hop_length=hop)
rms = librosa.feature.rms(y=y, frame_length=640, hop_length=hop)[0]; db = 20 * np.log10(rms + 1e-9)
med = np.nanmedian(f0); st = 12 * np.log2(f0 / med); voiced = db > db.max() - 35; dbm = np.median(db[voiced])
rows = []
for p in P:
    a, b = int(W[p['i']]['start'] * sr / hop), int(W[p['j']]['end'] * sr / hop) + 1
    s = st[a:b]; s = s[~np.isnan(s)]; d = db[a:b]; d = d[voiced[a:b]]
    if len(s) < 3: rows.append((p, 0, 0, 0, 0)); continue
    wps = (p['j'] - p['i'] + 1) / max(0.2, W[p['j']]['end'] - W[p['i']]['start'])
    rows.append((p, float(np.median(s)), float(np.percentile(s, 90) - np.percentile(s, 10)), float(np.percentile(d, 75) - dbm), wps))
plain = [r for r in rows if not r[0].get('lift')]; lifts = [r for r in rows if r[0].get('lift')]
pm, pl = np.median([r[1] for r in plain]), np.median([r[3] for r in plain])
pw = np.median([r[4] for r in plain])
wl_p = min([r[1] for r in lifts], default=99); wl_l = min([r[3] for r in lifts], default=99)
print(f"{'phrase':22} pitch st  spread  loud dB  w/s   verdict   (plain median: pitch {pm:+.1f} st, loud {pl:+.1f} dB)")
ok = True
for p, m, sp, l, w in rows:
    if p.get('lift') == 'land': v = 'LIFT OK' if (w <= 0.65 * pw and l - pl >= 0) else 'LIFT WEAK'   # a landed word: slower and not quieter
    elif p.get('lift'): v = 'LIFT OK' if (m - pm >= 1.0 or l - pl >= 1.5) else 'LIFT WEAK'
    else: v = 'OVERSOLD' if (m - pm >= 3.0 and l - pl >= -0.5) else 'plain ok'
    ok &= v in ('LIFT OK', 'plain ok')
    print(f"{p['name'][:22]:22} {m:+7.1f} {sp:7.1f} {l:+8.1f} {w:5.1f}   {v}")
print('RESULT:', 'score followed' if ok else 'score NOT followed: re-take or re-direct before anyone listens')

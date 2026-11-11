#!/usr/bin/env python3
"""Regenerate INDEX.md and COMPARISON.md from every <slug>/PROFILE.md in a competitors store.

Usage: python3 build_comparison.py <project>/research/competitors

Reads from each PROFILE.md:
  - header lines  "**Name:** ...", "**URL:** ...", "**Category:** ...", "**Last checked:** ..."
  - the "## Snapshot" bullets  "- Key: value"  (keys listed in SNAPSHOT_KEYS)
Keeps hand-written text between these markers when it rewrites the files:
  INDEX.md       <!-- watchlist:start --> ... <!-- watchlist:end -->        (competitors without a profile yet)
  COMPARISON.md  <!-- implications:start --> ... <!-- implications:end -->  ("What this means for us")
"""
import os, re, sys, datetime

SNAPSHOT_KEYS = ["Positioning", "Target customer", "Who pays", "Price signal", "Hardware", "Product & AI",
                 "Italy presence", "Visual identity", "Imagery & video", "Threat to us"]
CAT_ORDER = ["direct", "adjacent", "inspiration"]


def keep(path, name, default):
    if os.path.exists(path):
        m = re.search(rf"(<!-- {name}:start -->.*?<!-- {name}:end -->)", open(path, encoding="utf-8").read(), re.S)
        if m:
            return m.group(1)
    return f"<!-- {name}:start -->\n{default}\n<!-- {name}:end -->"


def parse(path):
    t = open(path, encoding="utf-8").read()
    hdr = lambda k: (re.search(rf"^\*\*{k}:\*\*\s*(.+)$", t, re.M) or [None, ""])[1].strip()
    snap = {}
    m = re.search(r"^## Snapshot.*?\n(.*?)(?=^## )", t, re.S | re.M)
    for line in (m.group(1) if m else "").splitlines():
        mm = re.match(r"^- ([^:]+):\s*(.+)$", line.strip())
        if mm:
            snap[mm.group(1).strip()] = re.sub(r"\s*\[[^\]]*\]\s*$", "", mm.group(2)).replace("|", "/").strip()
    return {"name": hdr("Name") or os.path.basename(os.path.dirname(path)), "url": hdr("URL"),
            "cat": hdr("Category").split()[0].lower() if hdr("Category") else "adjacent",
            "checked": hdr("Last checked"), "snap": snap, "slug": os.path.basename(os.path.dirname(path))}


def main(store):
    profs = [parse(os.path.join(store, d, "PROFILE.md")) for d in sorted(os.listdir(store))
             if os.path.isfile(os.path.join(store, d, "PROFILE.md"))]
    profs.sort(key=lambda p: (CAT_ORDER.index(p["cat"]) if p["cat"] in CAT_ORDER else 9, p["name"].lower()))
    today = datetime.date.today().isoformat()

    idx = ["# Competitor index", "",
           f"Generated {today} by `~/.claude/skills/competitor-intel/scripts/build_comparison.py` from the profiles. "
           "Edit the profiles, not this table. Categories: direct = sells video/data for amateur youth football to the same buyers; "
           "adjacent = overlaps one layer (capture, family app, scouting, club admin); inspiration = other sport or model worth learning from.", "",
           "| Competitor | URL | Category | Last checked | Positioning (one line) |", "|---|---|---|---|---|"]
    for p in profs:
        idx.append(f"| [{p['name']}]({p['slug']}/PROFILE.md) | {p['url']} | {p['cat']} | {(p["checked"].split() or [""])[0]} | {p['snap'].get('Positioning', '')} |")
    idx += ["", "## Watchlist (no profile yet)", "", keep(os.path.join(store, "INDEX.md"), "watchlist", "| Name | URL | Category | Note |\n|---|---|---|---|"), ""]
    open(os.path.join(store, "INDEX.md"), "w", encoding="utf-8").write("\n".join(idx))

    cmp_ = ["# Competitor comparison", "",
            f"Generated {today} from the Snapshot section of each profile (`build_comparison.py`). Each cell is the latest value; "
            "dates and sources are in the profile. Blank = not researched yet.", ""]
    for cat in CAT_ORDER + sorted({p['cat'] for p in profs} - set(CAT_ORDER)):
        group = [p for p in profs if p["cat"] == cat]
        if not group:
            continue
        cmp_ += [f"## {cat.capitalize()} competitors", "", "| Dimension | " + " | ".join(p["name"] for p in group) + " |",
                 "|---|" + "---|" * len(group)]
        for k in SNAPSHOT_KEYS:
            cmp_.append(f"| **{k}** | " + " | ".join(p["snap"].get(k, "") for p in group) + " |")
        cmp_.append("")
    cmp_ += ["## What this means for us", "", keep(os.path.join(store, "COMPARISON.md"), "implications", "(write the implications here)"), ""]
    open(os.path.join(store, "COMPARISON.md"), "w", encoding="utf-8").write("\n".join(cmp_))
    print(f"{len(profs)} profiles -> INDEX.md, COMPARISON.md")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "research/competitors")

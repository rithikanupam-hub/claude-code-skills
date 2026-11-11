#!/usr/bin/env bash
# competitor-intel: turn every video on a captured page into one contact sheet (6 frames, 3x2),
# so you can SEE what a competitor's site video shows (raw match footage vs product renders vs people).
# Usage: media_frames.sh <capture_dir> [page_slug=home]
# Reads <slug>-computed.json (from capture.sh), downloads each visible video into <capture_dir>/media/,
# writes media/<n>-<name>-sheet.jpg and media/index.tsv (n, duration s, size MB, url). Prints the index only.
set -euo pipefail
DIR="${1:?capture_dir}"; SLUG="${2:-home}"; M="$DIR/media"; mkdir -p "$M"
python3 -I -c "
import json,sys
d=json.load(open(sys.argv[1]))
for v in d['media']['videos']:
    if v['src'].endswith(('.mp4','.webm','.mov')) or '.mp4' in v['src']: print(v['src'].replace('%2F','/'))
" "$DIR/$SLUG-computed.json" > "$M/video-urls.txt"
: > "$M/index.tsv"; n=0
while read -r url; do
  n=$((n+1)); name=$(basename "${url%%\?*}" | sed 's/%20/_/g' | cut -c1-60); f="$M/$(printf %02d $n)-$name"
  [ -s "$f" ] || curl -sL --max-filesize 150000000 -o "$f" "$url" || { echo "skip $url"; continue; }
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f" 2>/dev/null || echo 0)
  fps=$(python3 -c "d=float('${dur:-0}' or 0);print(6/d if d>0 else 1)")
  ffmpeg -loglevel error -y -i "$f" -vf "fps=$fps,scale=480:-2,tile=3x2" -frames:v 1 "${f%.*}-sheet.jpg" || true
  printf "%02d\t%.0f\t%s\t%s\n" $n "${dur:-0}" "$(du -m "$f" | cut -f1)" "$url" >> "$M/index.tsv"
done < "$M/video-urls.txt"
cat "$M/index.tsv"

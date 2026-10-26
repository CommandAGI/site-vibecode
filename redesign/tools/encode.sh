#!/usr/bin/env bash
# The shipped loops and posters from fal's sources (redesign/media, kept on the build machine): each clip graded,
# played forward then back so the loop has no seam, at 1280 px, AV1 in WebM and H.264 in MP4, each under ~3 MB.
#   FF=<an ffmpeg with libaom and libx264> redesign/tools/encode.sh
set -euo pipefail
cd "$(dirname "$0")/../.."
FF=${FF:-ffmpeg}
# sorts: the ultramarine duotone (shadow #0e1650, highlight #fdfdfb); proof: a little cooler; ink: as made.
declare -A GRADE=(
  [sorts]="format=gray,format=rgb24,lutrgb=r='14+(253-14)*val/255':g='22+(253-22)*val/255':b='80+(251-80)*val/255'"
  [proof]="eq=saturation=0.82:contrast=1.04,colorbalance=bs=0.03:bh=0.02"
  [ink]="null"
)
for v in sorts proof ink; do
  g=${GRADE[$v]}
  loop="[0:v]$g,scale=1280:-2,fps=24,split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[o]"
  "$FF" -loglevel error -y -i "redesign/media/$v.mp4" -filter_complex "$loop" -map '[o]' -an \
    -c:v libaom-av1 -crf 42 -b:v 0 -cpu-used 6 -row-mt 1 -pix_fmt yuv420p "media/$v.webm"
  "$FF" -loglevel error -y -i "redesign/media/$v.mp4" -filter_complex "$loop" -map '[o]' -an \
    -c:v libx264 -crf 29 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart "media/$v.mp4"
  "$FF" -loglevel error -y -i "redesign/media/$v.mp4" -vf "$g,scale=1600:-2" -frames:v 1 -q:v 4 "media/$v.jpg"
done

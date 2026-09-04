#!/usr/bin/env bash
# Genuine slow motion, not a lower playbackRate. Dropping the rate in the
# browser shows each existing frame for longer, which judders; minterpolate
# synthesises the in-between frames so the motion stays smooth at 24fps.
set -e
export PATH="$PATH:/c/ffmpeg/ffmpeg-8.1.1-essentials_build/bin"
cd "$(dirname "$0")/.."
mkdir -p assets/video/_fast
FACTOR=1.7
for n in hair spa boutique nails; do
  [ -f "assets/video/$n.mp4" ] || continue
  cp -n "assets/video/$n.mp4" "assets/video/_fast/$n.mp4" 2>/dev/null || true
  ffmpeg -v error -y -i "assets/video/_fast/$n.mp4" -an \
    -vf "setpts=${FACTOR}*PTS,minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1" \
    -c:v libx264 -profile:v high -preset medium -crf 26 -pix_fmt yuv420p \
    -movflags +faststart "assets/video/$n.slow.mp4"
  mv -f "assets/video/$n.slow.mp4" "assets/video/$n.mp4"
  echo "slowed $n -> $(ffprobe -v error -show_entries format=duration -of csv=p=0 assets/video/$n.mp4)s"
done
echo "ALL DONE"

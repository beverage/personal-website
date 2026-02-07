#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <input.mp4>"
  exit 1
fi

input="$1"
base="${input%.mp4}"

for height in 360 720 1024; do
  ffmpeg -i "$input" \
    -vf "scale=-2:$height" \
    -c:v libx264 -crf 22 -preset slow \
    -g 30 -keyint_min 15 \
    -movflags +faststart \
    -an \
    "${base}-${height}.mp4"
done

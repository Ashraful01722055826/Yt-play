#!/bin/sh
# run inside backend container to verify binaries and versions
set -e
echo "Checking ffmpeg..."
if command -v ffmpeg >/dev/null 2>&1; then
  ffmpeg -version | head -n 1
else
  echo "ffmpeg: NOT FOUND"
fi

echo "Checking yt-dlp..."
if command -v yt-dlp >/dev/null 2>&1; then
  yt-dlp --version
else
  echo "yt-dlp: NOT FOUND"
fi

echo "Node version:"
node --version || echo "node: NOT FOUND"
echo "npm version:"
npm --version || echo "npm: NOT FOUND"
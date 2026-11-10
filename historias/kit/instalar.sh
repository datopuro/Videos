#!/bin/sh
pip install --break-system-packages -q playwright numpy pillow 2>&1 | tail -3
python3 -m playwright install chromium 2>&1 | tail -3
which ffmpeg >/dev/null || (apt-get install -y -q ffmpeg 2>&1 | tail -3)

#!/bin/bash
# Launcher otomatis A-Frame VR Offline untuk macOS

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=================================================="
echo "   🚀 MENJALANKAN A-FRAME VR (MODE OFFLINE)      "
echo "=================================================="
echo "Server aktif di: http://localhost:8080"
echo "Membuka browser otomatis..."
echo "Tekan Ctrl+C di jendela ini untuk menghentikan server."
echo "=================================================="

# Buka browser otomatis ke http://localhost:8080
sleep 1 && open "http://localhost:8080" &

# Jalankan HTTP server bawaan macOS (Ruby / Python)
if command -v ruby >/dev/null 2>&1; then
  ruby -run -ehttpd . -p8080
elif command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 8080
else
  echo "Jalankan live server pada index.html"
fi

# Yt-play Starter (Frontend + Backend)

Short: A minimal starter that accepts a YouTube URL, embeds the video for playback, and provides an optional local download endpoint that uses yt-dlp + ffmpeg to create an MP3 for download.

Important legal note
- Downloading audio from YouTube can violate YouTube's Terms of Service and copyright law in many situations. Use the download feature only for personal/educational use and only when you have the right to download the content. Do NOT deploy public download services without verifying legality.

What's included
- frontend: React (Vite) app — input URL, shows embedded video, "Download Audio" button (calls backend).
- backend: Express server — /api/info to get basic meta (via YouTube oEmbed), /api/download to create an MP3 using yt-dlp (local-only example).

Setup (local)
1. Clone/place files to your machine in one folder with two subfolders: `backend/` and `frontend/`.

Backend
- Requires Node 18+.
- Requires yt-dlp and ffmpeg installed on your system (for the download endpoint).
  - Example (macOS with Homebrew): `brew install yt-dlp ffmpeg`
  - Linux (Debian/Ubuntu): `sudo apt install ffmpeg` and install yt-dlp per docs (or pip: `python3 -m pip install -U yt-dlp`).
- From `backend/`:
  - npm install
  - copy `.env.example` to `.env` and edit if needed
  - npm start
  - Default runs on port 4000

Frontend
- From `frontend/`:
  - npm install
  - npm run dev
  - Default Vite dev server runs on port 5173

Usage
- Open frontend URL from Vite (usually http://localhost:5173), paste a YouTube URL and press Search.
- Video will embed. Click "Download Audio (server)" to request backend MP3 creation and download (backend must have yt-dlp and ffmpeg available).

Notes & future improvements
- Use YouTube Data API for richer metadata and related video lists (requires API key).
- Add progress indicator for server-side conversion.
- Add authentication/ratelimiting if enabling downloads on a public server (to avoid abuse).
- Consider removing direct-download support to stay strictly within YouTube ToS.
# YouTube Audio/Video Player & (Local) Download Starter

**Important:** This project is a learning/prototype starter. Downloading audio/video from YouTube may violate YouTube's Terms of Service and copyright law. Use this code only for local testing and learning. Do NOT publish or distribute without ensuring legal compliance.

## What is included
- `backend/` — Node.js (Express) server using `yt-dlp` to fetch metadata and proxy audio streams.
- `frontend/` — Expo (React Native) starter `App.js` showing URL input, thumbnail/title, audio play and download triggering backend endpoint.

## Quick run (local)
### Prerequisites
- Node.js (v18+), npm
- Python `yt-dlp` installed system-wide (e.g. `pip install -U yt-dlp`) or ensure `yt-dlp` binary is available.

### Backend
```bash
cd backend
npm install
# ensure yt-dlp is available on PATH
node server.js
# backend will start on http://localhost:7000
```

### Frontend (Expo)
```bash
cd frontend
npm install
npx expo start
```

## Notes
- The backend proxies the audio stream for local playback and download. For production or public distribution, remove download features or follow YouTube's policies.

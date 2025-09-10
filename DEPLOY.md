# Deploy guide — Yt-play (Frontend on Vercel, Backend on Render/Railway)

Overview
- Frontend: Vite app (frontend/) → Vercel (static)
- Backend: Node + yt-dlp + ffmpeg in Docker (backend/) → Render / Railway / Fly.io / VPS

1) Deploy backend to Render (quick)
- Sign in to https://render.com
- New → Web Service → Connect GitHub → select repository `Yt-play`
- Set "Root" or "Service Path" to `backend`
- Use Docker (Render will use backend/Dockerfile)
- Start command: `node index.js` (Dockerfile also sets CMD)
- Wait for deploy; note the public URL, e.g. `https://yt-play-backend.onrender.com`

2) Deploy frontend to Vercel
- Sign in to https://vercel.com
- New Project → Import GitHub repo `Yt-play`
- Root Directory: select `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Add Environment Variable in Vercel project settings:
  - Key: `VITE_API_BASE`
  - Value: `https://<your-backend-url>` (from Render)
- Deploy and open the Vercel URL.

3) Local test before deploy
- Backend:
  - cd backend
  - npm install
  - Ensure system has ffmpeg & python3 + pip3
    - Ubuntu example:
      sudo apt-get update
      sudo apt-get install -y ffmpeg python3 python3-pip
      pip3 install yt-dlp
  - npm start
  - Test: http://localhost:4000/api/info?url=https://www.youtube.com/watch?v=VIDEO_ID
  - Stream test:
    curl -v "http://localhost:4000/api/stream?url=https://www.youtube.com/watch?v=VIDEO_ID" --output sample.mp3

- Frontend:
  - cd frontend
  - npm install
  - echo "VITE_API_BASE=http://localhost:4000" > .env
  - npm run dev
  - Open http://localhost:5173

Notes & cautions
- Do NOT attempt to run yt-dlp/ffmpeg in Vercel serverless functions — use a persistent Docker service for the backend.
- Add rate-limiting / abuse-protection in production.
- Monitor logs on Render/Railway for ffmpeg / yt-dlp errors (missing binaries, permissions).
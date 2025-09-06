Simple deploy instructions

1) Docker build
   docker build -t yt-play-backend ./backend
   docker run -p 4000:4000 --env-file .env yt-play-backend

2) Render / Railway
   - Create a new service pointing to the backend folder.
   - Set start command: node index.js
   - Provide environment variables as needed.

Notes: For audio download support install yt-dlp and ffmpeg in the image or host a machine with those binaries.

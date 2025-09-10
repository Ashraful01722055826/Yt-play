FROM node:18-bullseye

# Install system deps: ffmpeg + python3 + pip + yt-dlp
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    pip3 install --upgrade yt-dlp && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package.json first for cached installs (adjust if your backend package.json path different)
COPY backend/package*.json ./ 
RUN npm install --production

# Copy app source
COPY backend/ ./

ENV PORT=4000
EXPOSE 4000

# healthcheck to confirm yt-dlp and ffmpeg exist
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD ["sh", "-c", "command -v yt-dlp >/dev/null && command -v ffmpeg >/dev/null || exit 1"]

CMD ["npm", "start"]
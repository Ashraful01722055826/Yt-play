# Use node:18 slim
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# If you need ffmpeg/yt-dlp, uncomment and install them here (image size will increase)
# RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip && pip3 install yt-dlp && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 4000
CMD ["node", "index.js"]

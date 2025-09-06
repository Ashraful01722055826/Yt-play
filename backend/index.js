import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import os from "os";
import fs from "fs";
import { spawn } from "child_process";
import axios from "axios";
import glob from "glob";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Helper: extract YouTube video id
function extractVideoId(url) {
  if (!url) return null;
  const regex = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:&|$)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// GET /api/info?url=YOUTUBE_URL
// returns { videoId, title, thumbnail }
app.get("/api/info", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing url" });
    const videoId = extractVideoId(url);
    // try oembed for simple metadata (no API key required)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
        url
      )}&format=json`;
      const { data } = await axios.get(oembedUrl);
      return res.json({
        videoId,
        title: data.title,
        thumbnail: data.thumbnail_url
      });
    } catch (err) {
      // fallback: return id only
      return res.json({ videoId, title: null, thumbnail: null });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST or GET /api/download?url=YOUTUBE_URL
// This endpoint demonstrates a local download flow using yt-dlp + ffmpeg.
// WARNING: Do not expose this publicly without considering legal and ToS implications.
app.get("/api/download", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "Missing url" });
    const videoId = extractVideoId(url) || Date.now().toString();
    const tmpDir = os.tmpdir();
    const outTemplate = path.join(tmpDir, `${videoId}.%(ext)s`);

    // Spawn yt-dlp to extract audio as mp3 into tmp
    // Command: yt-dlp -x --audio-format mp3 -o /tmp/{videoId}.%(ext)s {url}
    const yt = spawn("yt-dlp", [
      "-x",
      "--audio-format",
      "mp3",
      "-o",
      outTemplate,
      url
    ]);

    yt.stderr.on("data", (data) => {
      // yt-dlp logs progress to stderr; you can forward to logs if you want
      // console.log("yt-dlp:", data.toString());
    });

    yt.on("error", (err) => {
      console.error("yt-dlp spawn error:", err.message);
      return res
        .status(500)
        .json({ error: "yt-dlp not found or failed to start on server." });
    });

    yt.on("close", (code) => {
      if (code !== 0) {
        console.error("yt-dlp exited with code", code);
        return res.status(500).json({ error: "Conversion failed." });
      }
      // look for the mp3 file
      const expected = path.join(tmpDir, `${videoId}.mp3`);
      if (fs.existsSync(expected)) {
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${videoId}.mp3"`
        );
        const stream = fs.createReadStream(expected);
        stream.pipe(res);
        stream.on("close", () => {
          // cleanup
          try {
            fs.unlinkSync(expected);
          } catch (e) {
            // ignore
          }
        });
      } else {
        // try glob (in case extension or name differs)
        glob(path.join(tmpDir, `${videoId}.*`), (err, files) => {
          if (err || files.length === 0) {
            return res.status(500).json({ error: "Result file not found." });
          }
          const file = files[0];
          res.download(file, path.basename(file), (err) => {
            try {
              fs.unlinkSync(file);
            } catch (e) {}
          });
        });
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// Simple health
app.get("/", (req, res) => res.send("Yt-play backend running"));

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});

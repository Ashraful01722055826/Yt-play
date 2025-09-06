const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Yt-play backend running'));
function safeFilename(name) {
  return name.replace(/[^a-z0-9_\-\.()\s]/gi, '_').trim();
}

// Return metadata + available formats using yt-dlp -j (json)
app.get('/api/info', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url required' });

  try {
    // Basic restriction: only youtu.be / youtube hostnames
    if (!/youtube|youtu.be/.test(url)) return res.status(400).json({ error: 'only YouTube URLs allowed' });

    // Run yt-dlp -j to get metadata
    const ytdlp = spawn('yt-dlp', ['-j', url]);
    let out = '';
    let err = '';

    ytdlp.stdout.on('data', (d) => (out += d.toString()));
    ytdlp.stderr.on('data', (d) => (err += d.toString()));

    ytdlp.on('close', (code) => {
      if (code !== 0 || !out) {
        console.error('yt-dlp failed', code, err);
        return res.status(502).json({ error: 'failed to fetch metadata', details: err.slice(0, 1000) });
      }
      try {
        const meta = JSON.parse(out);
        // Map formats to a simpler list (audio-only and audio-containing)
        const formats = (meta.formats || []).filter(f => f.acodec && f.acodec !== 'none').map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          abr: f.abr || null,
          vbr: f.vbr || null,
          filesize: f.filesize || null,
          format_note: f.format_note || '',
          protocol: f.protocol || ''
        }));
        return res.json({
          videoId: meta.id,
          title: meta.title,
          thumbnail: meta.thumbnail || `https://i.ytimg.com/vi/${meta.id}/hqdefault.jpg`,
          uploader: meta.uploader,
          duration: meta.duration,
          formats
        });
      } catch (e) {
        console.error('parse meta failed', e);
        return res.status(500).json({ error: 'parse failed' });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

// Stream/Download endpoint: yt-dlp -> ffmpeg on-the-fly -> mp3
// Query params: url, format_id (optional). If no format_id, use bestaudio.
app.get('/api/stream', (req, res) => {
  const url = req.query.url;
  const format_id = req.query.format_id;
  if (!url) return res.status(400).json({ error: 'url required' });
  if (!/youtube|youtu.be/.test(url)) return res.status(400).json({ error: 'only YouTube URLs allowed' });

  // Build yt-dlp args
  const ytdlpArgs = ['-o', '-', '--no-playlist', '-f', format_id || 'bestaudio', url];
  // Spawn yt-dlp
  const ytdlp = spawn('yt-dlp', ytdlpArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  // Spawn ffmpeg to convert to mp3 for consistent playback/download
  const ffmpeg = spawn('ffmpeg', ['-i', 'pipe:0', '-vn', '-f', 'mp3', '-'], { stdio: ['pipe', 'pipe', 'pipe'] });

  // Pipe ytdlp stdout -> ffmpeg stdin
  ytdlp.stdout.pipe(ffmpeg.stdin);

  ytdlp.stderr.on('data', d => console.error('yt-dlp:', d.toString()));
  ffmpeg.stderr.on('data', d => console.error('ffmpeg:', d.toString()));

  // Set headers for audio stream
  res.setHeader('Content-Type', 'audio/mpeg');
  // Attempt to get nice filename from url (fallback)
  let filename = 'audio.mp3';
  try {
    const u = new URL(url);
    const vid = (u.searchParams.get('v')) || u.pathname.split('/').pop();
    filename = `${vid}.mp3`;
  } catch (_) {}

  res.setHeader('Content-Disposition', `attachment; filename="${safeFilename(filename)}"`);

  // Pipe ffmpeg stdout to response
  ffmpeg.stdout.pipe(res);

  // Handle child exit/errors
  ytdlp.on('error', err => {
    console.error('yt-dlp spawn error', err);
    try { res.end(); } catch {}
  });
  ffmpeg.on('error', err => {
    console.error('ffmpeg spawn error', err);
    try { res.end(); } catch {}
  });

  // If client disconnects, kill children
  req.on('close', () => {
    try { ytdlp.kill('SIGKILL'); } catch {}
    try { ffmpeg.kill('SIGKILL'); } catch {}
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Listening on', port));
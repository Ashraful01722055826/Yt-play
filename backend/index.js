const express = require('express');
const cors = require('cors');
const { URL } = require('url');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('Yt-play backend is running'));

app.get('/api/info', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    let videoId = null;
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) videoId = u.pathname.slice(1);
      else videoId = u.searchParams.get('v');
    } catch (e) {}

    if (!videoId) {
      const m = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
      if (m) videoId = m[1];
    }

    if (!videoId) return res.status(400).json({ error: 'could not extract video id' });

    const oembedUrl = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent('https://www.youtube.com/watch?v=' + videoId)}`;
    const r = await fetch(oembedUrl);
    if (!r.ok) return res.status(502).json({ error: 'failed to fetch oembed' });
    const data = await r.json();

    return res.json({ videoId, title: data.title, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, author_name: data.author_name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
});

app.get('/api/download', (req, res) => {
  // Streaming downloads require yt-dlp/ffmpeg. Keep stub here to avoid unexpected failures.
  res.status(501).json({ error: 'Download not implemented. Install yt-dlp/ffmpeg and enable download endpoint.' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Listening on', port));

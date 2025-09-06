import React, { useState, useEffect } from "react";
import { fetchInfo, downloadUrl, pingBackend } from "./api";
import "./styles.css";

export default function App() {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [checkedBackend, setCheckedBackend] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await pingBackend();
      setBackendAvailable(ok);
      setCheckedBackend(true);
    })();
  }, []);

  const handleSearch = async () => {
    setError("");
    setVideoId("");
    setTitle("");
    setThumbnail("");
    if (!url) return setError("Please paste a YouTube URL");
    setLoading(true);
    try {
      const info = await fetchInfo(url);
      if (!info || !info.videoId) {
        setError("Could not extract video id. Check URL.");
      } else {
        setVideoId(info.videoId);
        setTitle(info.title || "");
        setThumbnail(info.thumbnail || "");
        const ok = await pingBackend();
        setBackendAvailable(ok);
        setCheckedBackend(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch video info");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h2>Yt-play (demo)</h2>

      <div className="row">
        <input
          placeholder="Paste YouTube URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {videoId && (
        <div className="player">
          <div className="meta">
            {thumbnail && <img src={thumbnail} alt="thumb" />}
            <div>
              <h3>{title || "YouTube Video"}</h3>
              <div className="actions">
                {checkedBackend ? (
                  backendAvailable ? (
                    <a
                      className="download"
                      href={downloadUrl(url)}
                      rel="noreferrer"
                    >
                      Download Audio (server)
                    </a>
                  ) : (
                    <button
                      className="download"
                      disabled
                      title="Backend not available. Either deploy the backend or set VITE_API_BASE env var."
                      style={{ opacity: 0.7, cursor: "not-allowed" }}
                    >
                      Download (unavailable)
                    </button>
                  )
                ) : (
                  <button className="download" disabled>
                    Checking backend...
                  </button>
                )}

                <a
                  className="openyt"
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on YouTube
                </a>
              </div>
            </div>
          </div>

          <div className="embed">
            <iframe
              width="640"
              height="360"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <p className="note">
            Note: Download requires a running backend that supports /api/download
            and yt-dlp/ffmpeg if using the local extractor.
          </p>
        </div>
      )}
    </div>
  );
}

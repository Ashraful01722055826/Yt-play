````markdown
```markdown
# Docker deploy (local / server)

এই গাইডটি ধরে আপনি একটি সম্পূর্ণ Docker‑based লোকাল/সার্ভার সেটআপ পাবেন — frontend (Vite) nginx দিয়ে সার্ভ, backend (Node) yt-dlp ও ffmpeg সমর্থিত।

প্রকল্প কাঠামো (আশা করা হচ্ছে)
- backend/           <-- আপনার backend NodeJS কোড (package.json, index.js, etc.)
- frontend/          <-- আপনার Vite frontend (package.json, src, vite config)
- docker-compose.yml
- frontend/Dockerfile
- backend/Dockerfile
- nginx.conf

প্রয়োজনীয়তাসমূহ
- Docker (20+) এবং docker-compose (v1.29+ or Compose v2)
- পর্যাপ্ত ডিস্ক স্পেস (ভিডিও ডাউনলোড ও transcoding-এর জন্য)

চালানোর ধাপ (লোকাল / সার্ভার)
1. কোড ঠিক জায়গায় আছে কিনা নিশ্চিত করুন:
   - backend/ তে আপনার Node app এবং package.json থাকতে হবে
   - frontend/ তে Vite app এবং package.json ও build script থাকতে হবে (npm run build → dist তৈরি হয়)

2. ফাইলগুলো কপি/পেস্ট করে প্রজেক্ট রুটে রাখুন (docker-compose.yml, frontend/Dockerfile, backend/Dockerfile, nginx.conf ইত্যাদি)

3. বিল্ড ও চালান:
   docker-compose build --pull
   docker-compose up -d

4. কনটেইনার লগ দেখুন:
   docker-compose logs -f backend
   docker-compose logs -f frontend

5. dependency পরীক্ষা (বিকল্প):
   docker-compose exec backend sh /app/check-deps.sh
   # অথবা সরাসরি yt-dlp চলান:
   docker-compose exec backend yt-dlp -j "https://www.youtube.com/watch?v=VIDEO_ID"

বহুল ব্যবহারের টিপস / কনফিগ:
- VITE_API_BASE: build time বা runtime environment variable — frontend build করলে VITE_API_BASE ঠিক থাকবে কিনা দেখুন। উপরে docker-compose উদাহরণে এটি http://localhost:4000 দেয়া আছে। প্রোডাকশনে এটি backend-এর public URL এ আপডেট করুন।
- যদি আপনার backend অন্য নামে থাকে (server, api ইত্যাদি), docker-compose.yml-এ সেই সেবার নাম অনুযায়ী nginx.conf proxy_pass URL আপডেট করুন।
- বড় ভিডিওর জন্য আপনি কনটেইনারের tmp বা ডাউনলোড লোকেশনকে ভলিউমে রাখবেন যাতে পুনরায় ডাউনলোড না করতে হয়:
  volumes:
    - ./downloads:/app/downloads
- যদি yt-dlp বা ffmpeg কেলেঙ্কারি করে (region/block/rate-limit), তাহলে cookies বা proxy প্যারামিটার যোগ করতে হতে পারে। backend কোডে yt-dlp কল প্যারামিটারগুলো দেখুন।

সম্ভাব্য সমস্যা ও দ্রুত সমাধান:
- build এ ব্যর্থ হলে logs চেক করুন (npm deps, build script)
- `yt-dlp: command not found` → backend image-এ yt-dlp ইনস্টল হয়নি; উপরের Dockerfile-এ pip3 install yt-dlp আছে, নিশ্চিত করুন Build সফল হয়েছে
- `ffmpeg` সংক্রান্ত error → apt-get install ffmpeg করা আছে কিনা পরীক্ষা করুন
- যদি frontend route‑এ 404 আসেন → nginx.conf-এ try_files $uri $uri/ /index.html আছে কিনা নিশ্চিত করুন

---

এই ফাইলগুলো আপনার রেপোতে যুক্ত করলে এবং `docker-compose up -d` চালালে একটি একক সার্ভিস হিসেবে কাজ করা উচিত — frontend 80 পোর্টে সার্ভ হবে এবং `/api/*` রিকোয়েস্টগুলো backend:4000 এ যাবে। যদি কোন নির্দিষ্ট URL দিয়ে `Failed to fetch video info` সমস্যা আসে, তাহলে সেই URL দিন — আমি লোকালভাবে yt-dlp চালিয়ে দেখে বলব কোন দিকে সমস্যা আসে।
````
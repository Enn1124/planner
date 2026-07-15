/* Service Worker — 블록 플래너 PWA
   버전 번호를 올리면 캐시가 자동으로 갱신됩니다. */
const CACHE = 'planner-v3'; // ← 파일 교체 후 버전 올리기
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // 즉시 활성화
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // 열린 탭 즉시 제어
  );
});

self.addEventListener('fetch', e => {
  // Firebase 요청은 캐시 없이 네트워크 직통
  if (e.request.url.includes('firebasedatabase.app') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('gstatic.com') ||
      e.request.url.includes('firebaseapp.com')) return;

  e.respondWith(
    // 네트워크 우선 → 실패 시 캐시 (항상 최신 파일을 받으려고)
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)
        .then(cached => cached || caches.match('./index.html'))
      )
  );
});

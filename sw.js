/* Service Worker — 캐시 비활성화 버전
   기존 캐시를 모두 삭제하고 아무것도 하지 않습니다. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
// fetch 핸들러 없음 — 모든 요청이 네트워크로 직접 전달됨

// 서비스 워커(Service Worker) 캐시 이름 및 기본 오프라인 지원 설정
const CACHE_NAME = 'moorim-aion-cache-v1';

// 설치 시 즉시 활성화
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 활성화 시 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 네트워크 요청 제어 (네트워크 우선, 실패 시 기본 캐시 확인)
self.addEventListener('fetch', (event) => {
  // GET 요청 및 http/https 프로토콜만 캐싱 검토
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

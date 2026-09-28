// PAT WORKSPACE — service worker
// Chỉ cache tài nguyên tĩnh (app shell + thư viện CDN). Không đụng vào bất kỳ
// request nào liên quan tới lưu trữ dữ liệu nghiệp vụ (localStorage/IndexedDB
// sống hoàn toàn trong trình duyệt, service worker không thể và không được
// can thiệp vào các API đó).

const CACHE_NAME = 'pat-workspace-cache-v5';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apps/chen-chu-ky-pdf.html',
  './apps/ghep-nhieu-anh.html'
];

// Thư viện ngoài gọi qua CDN (dùng trong apps/ghep-nhieu-anh.html) — cache
// cùng app shell để tính năng ghép ảnh/PDF vẫn dùng được khi offline sau lần
// mở đầu tiên.
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch(() => {
            // Bỏ qua nếu một URL app-shell lẻ tẻ không cache được (không chặn install)
          })
        ).concat(
          CDN_ASSETS.map((url) =>
            cache.add(new Request(url, { mode: 'cors' })).catch(() => {
              // Thư viện CDN có thể chặn CORS trong môi trường cài đặt cục bộ;
              // bỏ qua lỗi để không chặn cài đặt PWA — app vẫn hoạt động online
              // bình thường, chỉ mất tính năng offline đầy đủ nếu lỗi.
            })
          )
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Chỉ xử lý GET tới tài nguyên tĩnh (app shell + CDN đã liệt kê ở trên).
  // Mọi request khác (bao gồm mọi thao tác đọc/ghi dữ liệu nghiệp vụ, vốn
  // luôn là localStorage/IndexedDB nội bộ trình duyệt chứ không phải network
  // request) không đi qua service worker này nên không bị ảnh hưởng.
  if (req.method !== 'GET') return;

  const isAppShell = APP_SHELL.some((path) => req.url.endsWith(path.replace('./', '/')) || req.url.endsWith(path));
  const isCDN = CDN_ASSETS.includes(req.url);

  if (!isAppShell && !isCDN) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => {
          // Offline và không có trong cache: fallback về index.html cho
          // điều hướng trang, tránh màn hình trắng.
          if (req.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

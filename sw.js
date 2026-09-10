// یک سرویس‌ورکر حداقلی — فقط برای اینکه Chrome/PWABuilder صفحه را
// "نصب‌شدنی" تشخیص بدهند. خود برنامه (داخل iframe) آفلاین کار نمی‌کند
// چون از اپس‌اسکریپت لود می‌شود، ولی همین کافی‌ست تا مانیفست شناسایی و
// تبدیل به TWA/اپ اندروید با PWABuilder ممکن شود.

const CACHE_NAME = 'tinfit-shell-v1';
const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// فقط درخواست‌های خودِ shell (نه محتوای اپس‌اسکریپت داخل iframe) را از کش سرو می‌کند
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate' || SHELL_FILES.some((f) => event.request.url.endsWith(f.replace('./', '')))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});

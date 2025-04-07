const CACHE_NAME = 'kktc-tufe-cache-v1'; // Cache versiyonunu değiştirerek güncellemeyi tetikleyebilirsiniz
const urlsToCache = [
  '/', // Ana sayfa (index.html)
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/KKTC_TUFE_HarcamaGruplar_2001-2025.csv', // CSV dosyasını da cache'le
  'https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js', // Kütüphaneler
  'https://cdn.jsdelivr.net/npm/chart.js@3.7.0/dist/chart.min.js',
  '/icons/icon-192x192.png', // İkonlar
  '/icons/icon-512x512.png',
   'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap', // Google Fonts
   'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmSU5fBBc4.woff2' // Font dosyaları (tarayıcı tarafından istenenler değişebilir)
];

// Yükleme Olayı: Cache'i aç ve dosyaları ekle
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache açıldı');
        // Önemli olmayan kaynaklarda hata olursa install işlemini durdurma (opsiyonel)
        const cachePromises = urlsToCache.map(urlToCache => {
            return cache.add(urlToCache).catch(err => {
                console.warn(`Cache eklenemedi: ${urlToCache}`, err);
            });
        });
        return Promise.all(cachePromises);
       // return cache.addAll(urlsToCache); // Tüm dosyalar cache'lenemezse install başarısız olur
      })
  );
});

// Aktivasyon Olayı: Eski cache'leri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Yeni service worker'ın sayfayı hemen kontrol etmesini sağla
  return self.clients.claim();
});

// Fetch Olayı: Cache'den veya network'ten cevap ver (Cache First Stratejisi)
self.addEventListener('fetch', event => {
  // Google Fonts gibi dış kaynakları veya API isteklerini cache'lememek için kontrol eklenebilir
  // Sadece kendi domain'imizdeki veya belirli CDN'lerdeki istekleri cache'lemek daha güvenli olabilir.
  // Örnek: if (event.request.url.startsWith(self.location.origin) || event.request.url.includes('cdn.jsdelivr.net')) { ... }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'de varsa oradan dön
        if (response) {
          return response;
        }

        // Cache'de yoksa network'ten al, cache'e ekle ve dön
        return fetch(event.request).then(
          networkResponse => {
            // Yanıt geçerli mi kontrol et
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' && !networkResponse.type.includes('cors')) {
               // Sadece geçerli ve cache'lenebilir yanıtları cache'le (CORS vb. dikkat)
               // Basic type kendi domain'imizden gelenler için.
              return networkResponse;
            }

            // Yanıtı klonla. Birisi cache'e, diğeri tarayıcıya gidecek.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
            console.error("Fetch hatası (muhtemelen offline):", error);
            // Offline durumunda gösterilecek özel bir sayfa/mesaj döndürülebilir.
            // return caches.match('/offline.html'); // Örnek
        });
      })
  );
});
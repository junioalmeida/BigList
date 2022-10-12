var cacheName = 'toferrado-v1.0';

self.addEventListener('install', function () {
  caches.open(cacheName).then((cache) => {
    cache.addAll([
      '/',
      '/manifest.webmanifest',
      '/resources/framework/styles/styles.css',
      '/resources/images/logo/android-icon-48x48.png',
      '/resources/images/logo/android-icon-72x72.png',
      '/resources/images/logo/android-icon-96x96.png',
      '/resources/images/logo/android-icon-144x144.png',
      '/resources/images/logo/android-icon-192x192.png',
      '/resources/images/logo/favicon.ico',
      '/resources/images/plus1.png',
      '/resources/images/empty-list.png',
      '/resources/scripts/bigList.js',
      '/resources/styles/bigList.css',
      '/resources/images/logo/apple-icon-72x72.png',
      '/resources/images/logo/apple-icon-120x120.png',
      '/resources/images/logo/apple-icon-144x144.png',
      '/resources/images/logo/apple-icon-152x152.png',
      '/resources/images/logo/apple-icon-180x180.png',
    ]);
  });
});

self.addEventListener('activate', function() {
    caches.keys().then((listKeys) => {
        listKeys.forEach(k => {
            if(k !== cacheName){
                caches.delete(k);
            }
        });
    });
});

self.addEventListener('fetch', function (e) {
    let response = caches.open(cacheName).then((cache) => {
        return cache.match(e.request).then((resource) => {
            if (resource) {
                return resource;
            } 
            return fetch(e.request).then((resource) => {
                cache.put(e.request, resource.clone());
                return resource;
            });
        });
    });

    e.respondWith(response);
});
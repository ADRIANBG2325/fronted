const CACHE_NAME = "attendance-system-v1"
const urlsToCache = ["/", "/static/js/bundle.js", "/static/css/main.css", "/manifest.json"]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("📦 Cache abierto")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Interceptar requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - devolver respuesta
      if (response) {
        return response
      }
      return fetch(event.request)
    }),
  )
})

// Activar Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ Eliminando cache antiguo:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

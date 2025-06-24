const CACHE_NAME = "attendance-system-v2"
const urlsToCache = ["/", "/manifest.json"]

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("🔧 SW: Instalando...")
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 SW: Cache abierto")
        // Cachear solo recursos que sabemos que existen
        return cache.addAll(urlsToCache.filter((url) => url))
      })
      .catch((error) => {
        console.error("❌ SW: Error al cachear:", error)
      }),
  )
  // Forzar activación inmediata
  self.skipWaiting()
})

// Activar Service Worker
self.addEventListener("activate", (event) => {
  console.log("✅ SW: Activando...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑️ SW: Eliminando cache antiguo:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  // Tomar control inmediatamente
  self.clients.claim()
})

// Interceptar requests
self.addEventListener("fetch", (event) => {
  // Solo manejar requests GET
  if (event.request.method !== "GET") {
    return
  }

  // Ignorar requests a la API externa
  if (event.request.url.includes("onrender.com")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si está en cache, devolverlo
      if (response) {
        return response
      }

      // Si no está en cache, hacer fetch
      return fetch(event.request)
        .then((response) => {
          // Verificar si es una respuesta válida
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clonar la respuesta
          const responseToCache = response.clone()

          // Agregar al cache solo si es un recurso estático
          if (
            event.request.url.includes("/_next/static/") ||
            event.request.url.endsWith(".js") ||
            event.request.url.endsWith(".css") ||
            event.request.url.endsWith(".png") ||
            event.request.url.endsWith(".ico")
          ) {
            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
              .catch((error) => {
                console.log("⚠️ SW: No se pudo cachear:", event.request.url)
              })
          }

          return response
        })
        .catch((error) => {
          console.log("❌ SW: Error en fetch:", error)
          // Si falla el fetch y es la página principal, devolver página offline básica
          if (event.request.url.endsWith("/")) {
            return new Response(
              `<!DOCTYPE html>
                <html>
                <head>
                  <title>Sin conexión - Sistema de Asistencia</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline { color: #666; }
                  </style>
                </head>
                <body>
                  <div class="offline">
                    <h1>📱 Sistema de Asistencia</h1>
                    <h2>Sin conexión a internet</h2>
                    <p>Por favor, verifica tu conexión e intenta nuevamente.</p>
                    <button onclick="window.location.reload()">Reintentar</button>
                  </div>
                </body>
                </html>`,
              {
                headers: { "Content-Type": "text/html" },
              },
            )
          }
          throw error
        })
    }),
  )
})

// Manejar mensajes del cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

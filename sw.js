// ============================
// IBIZAGIRL.PICS SERVICE WORKER v4.1.0
// PWA + Cache Management
// ============================

const CACHE_NAME = 'ibizagirl-v4.1.0';
const DYNAMIC_CACHE = 'ibizagirl-dynamic-v4.1.0';
const IMAGE_CACHE = 'ibizagirl-images-v4.1.0';
const VIDEO_CACHE = 'ibizagirl-videos-v4.1.0';

// Archivos esenciales para cachear
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/main.html',
    '/styles.css',
    '/manifest.json',
    '/content-data1.js',
    '/content-data2.js',
    '/content-data3.js',
    '/content-data4.js',
    '/content-data5.js',
    '/content-data6.js',
    '/main-integrated.js'
];

// Imágenes críticas para precachear
const CRITICAL_IMAGES = [
    '/full/bikini.webp',
    '/full/bikbanner.webp',
    '/full/bikbanner2.webp',
    '/full/backbikini.webp',
    '/full/bikini3.webp',
    '/full/bikini5.webp'
];

// Límites de caché
const CACHE_LIMITS = {
    images: 100,  // Máximo 100 imágenes en caché
    videos: 10,   // Máximo 10 videos en caché
    age: 7 * 24 * 60 * 60 * 1000  // 7 días
};

// ============================
// INSTALACIÓN
// ============================

self.addEventListener('install', event => {
    console.log('[Service Worker] Instalando versión:', CACHE_NAME);
    
    event.waitUntil(
        Promise.all([
            // Cachear archivos estáticos
            caches.open(CACHE_NAME).then(cache => {
                console.log('[Service Worker] Cacheando archivos estáticos');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Cachear imágenes críticas
            caches.open(IMAGE_CACHE).then(cache => {
                console.log('[Service Worker] Cacheando imágenes críticas');
                return cache.addAll(CRITICAL_IMAGES);
            })
        ]).then(() => {
            console.log('[Service Worker] Instalación completada');
            return self.skipWaiting();
        })
    );
});

// ============================
// ACTIVACIÓN
// ============================

self.addEventListener('activate', event => {
    console.log('[Service Worker] Activando versión:', CACHE_NAME);
    
    event.waitUntil(
        Promise.all([
            // Limpiar cachés antiguos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('ibizagirl-') && 
                                   cacheName !== CACHE_NAME &&
                                   cacheName !== DYNAMIC_CACHE &&
                                   cacheName !== IMAGE_CACHE &&
                                   cacheName !== VIDEO_CACHE;
                        })
                        .map(cacheName => {
                            console.log('[Service Worker] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            
            // Limpiar entradas antiguas en cachés de imágenes y videos
            cleanOldCacheEntries()
        ]).then(() => {
            console.log('[Service Worker] Activación completada');
            return self.clients.claim();
        })
    );
});

// ============================
// FETCH - ESTRATEGIAS DE CACHÉ
// ============================

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar peticiones que no sean GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Ignorar peticiones de PayPal y analytics
    if (url.hostname.includes('paypal') || 
        url.hostname.includes('google') ||
        url.hostname.includes('googletagmanager')) {
        return;
    }
    
    // Estrategia para imágenes
    if (request.destination === 'image' || 
        /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(url.pathname)) {
        event.respondWith(handleImageRequest(request));
        return;
    }
    
    // Estrategia para videos
    if (request.destination === 'video' || 
        /\.(mp4|webm|ogg)$/i.test(url.pathname)) {
        event.respondWith(handleVideoRequest(request));
        return;
    }
    
    // Estrategia para archivos JavaScript y CSS
    if (/\.(js|css)$/i.test(url.pathname)) {
        event.respondWith(handleStaticRequest(request));
        return;
    }
    
    // Estrategia para HTML (Network First)
    if (request.mode === 'navigate' || 
        request.destination === 'document' ||
        url.pathname.endsWith('.html')) {
        event.respondWith(handleNavigationRequest(request));
        return;
    }
    
    // Estrategia por defecto
    event.respondWith(handleDefaultRequest(request));
});

// ============================
// MANEJADORES DE PETICIONES
// ============================

// Manejar peticiones de imágenes (Cache First)
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGE_CACHE);
    
    // Buscar en caché
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        // Actualizar en segundo plano si es antigua
        const cacheTime = await getCacheTime(request);
        if (Date.now() - cacheTime > CACHE_LIMITS.age) {
            fetchAndCache(request, cache);
        }
        return cachedResponse;
    }
    
    // Si no está en caché, buscar en red
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Clonar la respuesta antes de cachearla
            cache.put(request, networkResponse.clone());
            
            // Limpiar caché si es necesario
            limitCacheSize(IMAGE_CACHE, CACHE_LIMITS.images);
        }
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Error al obtener imagen:', error);
        // Devolver imagen placeholder si falla
        return cache.match('/full/bikini.webp');
    }
}

// Manejar peticiones de videos (Network First)
async function handleVideoRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Solo cachear videos pequeños (< 10MB)
            const contentLength = networkResponse.headers.get('content-length');
            if (contentLength && parseInt(contentLength) < 10485760) {
                const cache = await caches.open(VIDEO_CACHE);
                cache.put(request, networkResponse.clone());
                limitCacheSize(VIDEO_CACHE, CACHE_LIMITS.videos);
            }
        }
        return networkResponse;
    } catch (error) {
        // Si falla la red, buscar en caché
        const cache = await caches.open(VIDEO_CACHE);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Manejar archivos estáticos (Cache First con actualización)
async function handleStaticRequest(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Actualizar en segundo plano
        fetchAndCache(request, cache);
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Error al obtener recurso estático:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Manejar navegación (Network First)
async function handleNavigationRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Si falla la red, buscar en caché
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Si no hay caché, devolver página offline
        return cache.match('/index.html') || 
               new Response(generateOfflinePage(), {
                   headers: { 'Content-Type': 'text/html' }
               });
    }
}

// Manejar peticiones por defecto
async function handleDefaultRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// ============================
// FUNCIONES AUXILIARES
// ============================

// Obtener y cachear en segundo plano
async function fetchAndCache(request, cache) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse);
        }
    } catch (error) {
        // Silenciosamente fallar si no se puede actualizar
    }
}

// Limitar tamaño del caché
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        // Eliminar los más antiguos
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(
            keysToDelete.map(key => cache.delete(key))
        );
    }
}

// Limpiar entradas antiguas del caché
async function cleanOldCacheEntries() {
    const cacheNames = [IMAGE_CACHE, VIDEO_CACHE, DYNAMIC_CACHE];
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const dateHeader = response.headers.get('date');
                if (dateHeader) {
                    const cacheTime = new Date(dateHeader).getTime();
                    if (Date.now() - cacheTime > CACHE_LIMITS.age) {
                        await cache.delete(request);
                    }
                }
            }
        }
    }
}

// Obtener tiempo de caché
async function getCacheTime(request) {
    const cache = await caches.open(IMAGE_CACHE);
    const response = await cache.match(request);
    
    if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
            return new Date(dateHeader).getTime();
        }
    }
    
    return 0;
}

// Generar página offline
function generateOfflinePage() {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sin Conexión - IbizaGirl.pics</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    text-align: center;
                    padding: 20px;
                }
                .offline-container {
                    max-width: 400px;
                }
                h1 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 1.2em;
                    opacity: 0.9;
                    margin-bottom: 30px;
                }
                button {
                    padding: 15px 30px;
                    background: linear-gradient(45deg, #ff1493, #ff69b4);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 1.1em;
                    cursor: pointer;
                    transition: transform 0.3s;
                }
                button:hover {
                    transform: translateY(-2px);
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <h1>📡 Sin Conexión</h1>
                <p>Parece que no tienes conexión a Internet.</p>
                <p>Por favor, verifica tu conexión e intenta de nuevo.</p>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        </body>
        </html>
    `;
}

// ============================
// MENSAJES Y SINCRONIZACIÓN
// ============================

// Escuchar mensajes del cliente
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }).then(() => {
                return event.ports[0].postMessage({ 
                    type: 'CACHE_CLEARED',
                    message: 'Todos los cachés han sido eliminados'
                });
            })
        );
    }
});

// Background Sync para actualizar contenido
self.addEventListener('sync', event => {
    if (event.tag === 'update-content') {
        event.waitUntil(updateContent());
    }
});

async function updateContent() {
    try {
        // Actualizar archivos críticos
        const cache = await caches.open(CACHE_NAME);
        const updates = STATIC_ASSETS.map(url => 
            fetch(url).then(response => {
                if (response.ok) {
                    return cache.put(url, response);
                }
            }).catch(() => {})
        );
        
        await Promise.all(updates);
        console.log('[Service Worker] Contenido actualizado en segundo plano');
    } catch (error) {
        console.error('[Service Worker] Error actualizando contenido:', error);
    }
}

// Push notifications (preparado para futuro uso)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nuevo contenido disponible en IbizaGirl.pics',
        icon: '/full/bikini.webp',
        badge: '/full/bikini.webp',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ver Ahora',
                icon: '/full/bikini.webp'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/full/bikini.webp'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('IbizaGirl.pics 🏖️', options)
    );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('https://ibizagirl.pics/main.html')
        );
    }
});

console.log('[Service Worker] Cargado y listo - Versión:', CACHE_NAME);

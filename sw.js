// ============================
// IBIZAGIRL.PICS SERVICE WORKER v2.1.0
// Versión corregida sin archivos faltantes
// ============================

const CACHE_VERSION = 'v2.1.0';
const CACHE_NAME = `ibizagirl-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ibizagirl-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `ibizagirl-images-${CACHE_VERSION}`;
const VIDEO_CACHE = `ibizagirl-videos-${CACHE_VERSION}`;

// Archivos esenciales para cachear (SOLO los que existen)
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
    // REMOVIDOS: content-data-integration.js y main-script-updated.js que no existen
];

// Imágenes críticas para precachear
const CRITICAL_IMAGES = [
    '/full/bikini.webp',
    '/full/bikbanner.webp',
    '/full/bikbanner2.webp',
    '/full/backbikini.webp'
];

// Límites de caché
const CACHE_LIMITS = {
    images: 50,  // Reducido para Vercel
    videos: 5,   // Reducido para Vercel
    age: 7 * 24 * 60 * 60 * 1000  // 7 días
};

// ============================
// INSTALACIÓN
// ============================

self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Cachear archivos estáticos con manejo de errores individual
            caches.open(CACHE_NAME).then(cache => {
                console.log('[SW] Cacheando recursos esenciales...');
                return Promise.allSettled(
                    STATIC_ASSETS.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`[SW] No se pudo cachear ${url}:`, err.message);
                            return null;
                        })
                    )
                );
            }),
            
            // Cachear imágenes críticas con manejo de errores
            caches.open(IMAGE_CACHE).then(cache => {
                console.log('[SW] Cacheando imágenes críticas...');
                return Promise.allSettled(
                    CRITICAL_IMAGES.map(url => 
                        cache.add(url).catch(err => {
                            console.warn(`[SW] No se pudo cachear imagen ${url}:`, err.message);
                            return null;
                        })
                    )
                );
            })
        ]).then(() => {
            console.log('[SW] ✅ Instalación completada');
            return self.skipWaiting();
        })
    );
});

// ============================
// ACTIVACIÓN
// ============================

self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Limpiar cachés antiguos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('ibizagirl-') && 
                                   !cacheName.includes(CACHE_VERSION);
                        })
                        .map(cacheName => {
                            console.log('[SW] Eliminando caché antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            
            // Tomar control de todos los clientes
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] ✅ Activación completada');
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
    
    // Ignorar peticiones de PayPal, analytics y otros servicios externos
    const ignoredHosts = ['paypal', 'google', 'googletagmanager', 'juicyads', 'exoclick'];
    if (ignoredHosts.some(host => url.hostname.includes(host))) {
        return;
    }
    
    // Ignorar archivos que sabemos que no existen
    const nonExistentFiles = [
        'content-data-integration.js',
        'main-script-updated.js',
        'jads.js'
    ];
    if (nonExistentFiles.some(file => url.pathname.includes(file))) {
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
    
    // Estrategia para HTML
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
    try {
        const cache = await caches.open(IMAGE_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
            limitCacheSize(IMAGE_CACHE, CACHE_LIMITS.images);
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Error con imagen:', error);
        // Intentar devolver una imagen de fallback
        const cache = await caches.open(IMAGE_CACHE);
        const fallback = await cache.match('/full/bikini.webp');
        return fallback || new Response('', { status: 404 });
    }
}

// Manejar peticiones de videos (Network First)
async function handleVideoRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // Solo cachear videos pequeños
            const contentLength = networkResponse.headers.get('content-length');
            if (contentLength && parseInt(contentLength) < 5242880) { // 5MB
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
        return cachedResponse || new Response('', { status: 503 });
    }
}

// Manejar archivos estáticos
async function handleStaticRequest(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            // Actualizar en segundo plano
            fetch(request).then(response => {
                if (response.ok) {
                    cache.put(request, response);
                }
            }).catch(() => {});
            
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Error con archivo estático:', error);
        return new Response('', { status: 503 });
    }
}

// Manejar navegación
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
        
        // Página offline de respaldo
        return cache.match('/index.html') || generateOfflinePage();
    }
}

// Manejar peticiones por defecto
async function handleDefaultRequest(request) {
    try {
        return await fetch(request);
    } catch (error) {
        const cache = await caches.open(DYNAMIC_CACHE);
        return await cache.match(request) || new Response('', { status: 503 });
    }
}

// ============================
// FUNCIONES AUXILIARES
// ============================

// Limitar tamaño del caché
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(
            keysToDelete.map(key => cache.delete(key))
        );
    }
}

// Generar página offline
function generateOfflinePage() {
    const html = `
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
                h1 { font-size: 2.5em; margin-bottom: 20px; }
                p { font-size: 1.2em; opacity: 0.9; margin-bottom: 30px; }
                button {
                    padding: 15px 30px;
                    background: linear-gradient(45deg, #ff1493, #ff69b4);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    font-size: 1.1em;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <h1>📡 Sin Conexión</h1>
                <p>Parece que no tienes conexión a Internet.</p>
                <button onclick="window.location.reload()">Reintentar</button>
            </div>
        </body>
        </html>
    `;
    
    return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// ============================
// MENSAJES
// ============================

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service Worker', CACHE_VERSION, 'cargado');

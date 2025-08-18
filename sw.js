// ============================
// IBIZAGIRL.PICS SERVICE WORKER v4.1.0
// PWA + Performance + Cache Optimization
// ============================

const CACHE_VERSION = '4.1.0';
const CACHE_NAME = `ibizagirl-v${CACHE_VERSION}`;
const STATIC_CACHE = `ibizagirl-static-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `ibizagirl-dynamic-v${CACHE_VERSION}`;
const IMAGE_CACHE = `ibizagirl-images-v${CACHE_VERSION}`;
const VIDEO_CACHE = `ibizagirl-videos-v${CACHE_VERSION}`;

// Archivos críticos para cachear
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/main.html',
    '/styles.css',
    '/manifest.json',
    '/main-script.js',
    '/content-data1.js',
    '/content-data2.js',
    '/content-data3.js',
    '/content-data4.js',
    '/content-data5.js',
    '/content-data6.js',
    '/content-data-integration.js'
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

// Scripts externos para cachear
const EXTERNAL_SCRIPTS = [
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// URLs que NO deben ser cacheadas
const EXCLUDED_URLS = [
    'chrome-extension://',
    'extension://',
    'paypal.com',
    'paypalobjects.com',
    'googletagmanager.com',
    'google-analytics.com',
    'gtag/js',
    'doubleclick.net'
];

// ============================
// INSTALACIÓN
// ============================

self.addEventListener('install', event => {
    console.log('🔧 Service Worker: Instalando versión', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Cachear archivos estáticos
            caches.open(STATIC_CACHE).then(cache => {
                console.log('📦 Cacheando archivos estáticos...');
                return Promise.allSettled(
                    STATIC_ASSETS.map(url =>
                        cache.add(url).catch(err => 
                            console.warn(`No se pudo cachear: ${url}`, err)
                        )
                    )
                );
            }),
            
            // Cachear imágenes críticas
            caches.open(IMAGE_CACHE).then(cache => {
                console.log('🖼️ Cacheando imágenes críticas...');
                return Promise.allSettled(
                    CRITICAL_IMAGES.map(url =>
                        cache.add(url).catch(err => 
                            console.warn(`No se pudo cachear imagen: ${url}`, err)
                        )
                    )
                );
            }),
            
            // Cachear scripts externos
            caches.open(DYNAMIC_CACHE).then(cache => {
                console.log('🌐 Cacheando recursos externos...');
                return Promise.allSettled(
                    EXTERNAL_SCRIPTS.map(url =>
                        cache.add(url).catch(err => 
                            console.warn(`No se pudo cachear script externo: ${url}`, err)
                        )
                    )
                );
            })
        ]).then(() => {
            console.log('✅ Service Worker: Instalación completada');
            self.skipWaiting();
        })
    );
});

// ============================
// ACTIVACIÓN
// ============================

self.addEventListener('activate', event => {
    console.log('⚡ Service Worker: Activando versión', CACHE_VERSION);
    
    event.waitUntil(
        Promise.all([
            // Limpiar caches antiguos
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => {
                            return cacheName.startsWith('ibizagirl-') && 
                                   !cacheName.includes(CACHE_VERSION);
                        })
                        .map(cacheName => {
                            console.log('🗑️ Eliminando cache antiguo:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            
            // Tomar control de todos los clientes
            clients.claim()
        ]).then(() => {
            console.log('✅ Service Worker: Activación completada');
        })
    );
});

// ============================
// FETCH - ESTRATEGIA DE CACHE
// ============================

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar URLs excluidas
    if (EXCLUDED_URLS.some(excluded => request.url.includes(excluded))) {
        return;
    }
    
    // Ignorar peticiones que no sean GET
    if (request.method !== 'GET') {
        return;
    }
    
    // Estrategia para imágenes
    if (request.destination === 'image' || /\.(webp|jpg|jpeg|png|gif|svg)$/i.test(url.pathname)) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    return fetch(request).then(response => {
                        if (response.ok) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    }).catch(() => {
                        // Imagen de fallback si falla
                        return cache.match('/full/bikini.webp');
                    });
                });
            })
        );
        return;
    }
    
    // Estrategia para videos
    if (request.destination === 'video' || /\.(mp4|webm|ogg)$/i.test(url.pathname)) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    
                    return fetch(request).then(response => {
                        // Solo cachear videos pequeños (< 10MB)
                        const contentLength = response.headers.get('content-length');
                        if (contentLength && parseInt(contentLength) < 10485760) {
                            cache.put(request, response.clone());
                        }
                        return response;
                    });
                });
            })
        );
        return;
    }
    
    // Estrategia para archivos estáticos (JS, CSS)
    if (/\.(js|css)$/i.test(url.pathname) || STATIC_ASSETS.includes(url.pathname)) {
        event.respondWith(
            caches.match(request).then(cachedResponse => {
                if (cachedResponse) {
                    // Actualizar cache en background
                    event.waitUntil(
                        fetch(request).then(response => {
                            if (response.ok) {
                                return caches.open(STATIC_CACHE).then(cache => {
                                    cache.put(request, response);
                                });
                            }
                        }).catch(() => {})
                    );
                    return cachedResponse;
                }
                
                return fetch(request).then(response => {
                    if (response.ok) {
                        return caches.open(STATIC_CACHE).then(cache => {
                            cache.put(request, response.clone());
                            return response;
                        });
                    }
                    return response;
                });
            })
        );
        return;
    }
    
    // Estrategia Network First para HTML
    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response.ok) {
                        return caches.open(STATIC_CACHE).then(cache => {
                            cache.put(request, response.clone());
                            return response;
                        });
                    }
                    return response;
                })
                .catch(() => {
                    return caches.match(request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Página de fallback
                        return caches.match('/main.html');
                    });
                })
        );
        return;
    }
    
    // Estrategia por defecto: Network First con Cache Fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok) {
                    return caches.open(DYNAMIC_CACHE).then(cache => {
                        cache.put(request, response.clone());
                        return response;
                    });
                }
                return response;
            })
            .catch(() => {
                return caches.match(request);
            })
    );
});

// ============================
// BACKGROUND SYNC
// ============================

self.addEventListener('sync', event => {
    console.log('🔄 Background Sync:', event.tag);
    
    if (event.tag === 'update-content') {
        event.waitUntil(
            updateContent()
        );
    }
});

// Función para actualizar contenido
async function updateContent() {
    try {
        const cache = await caches.open(STATIC_CACHE);
        const requests = STATIC_ASSETS.map(url => 
            fetch(url).then(response => {
                if (response.ok) {
                    return cache.put(url, response);
                }
            }).catch(() => {})
        );
        
        await Promise.all(requests);
        console.log('✅ Contenido actualizado en background');
    } catch (error) {
        console.error('❌ Error actualizando contenido:', error);
    }
}

// ============================
// PUSH NOTIFICATIONS
// ============================

self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Nuevo contenido disponible!',
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
                title: 'Ver ahora',
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
        self.registration.showNotification('IbizaGirl.pics', options)
    );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/main.html')
        );
    }
});

// ============================
// MENSAJES
// ============================

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
                event.ports[0].postMessage({ type: 'CACHE_CLEARED' });
            })
        );
    }
});

console.log('Service Worker v' + CACHE_VERSION + ' cargado');

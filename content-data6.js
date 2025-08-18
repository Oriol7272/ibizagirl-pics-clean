/**
 * content-data6.js - Unified API v4.1.0 FIXED
 * API unificada y funciones principales del sistema
 */

'use strict';

console.log('📦 Cargando módulo content-data6.js - API unificada...');

// ============================
// VERIFICACIÓN DE DEPENDENCIAS
// ============================

(function() {
    const requiredModules = [
        { name: 'ContentConfig', module: 'content-data1.js' },
        { name: 'FULL_IMAGES_POOL', module: 'content-data2.js' },
        { name: 'PREMIUM_IMAGES_PART1', module: 'content-data3.js' },
        { name: 'PREMIUM_IMAGES_PART2', module: 'content-data4.js' },
        { name: 'PREMIUM_VIDEOS_POOL', module: 'content-data5.js' }
    ];
    
    const missingModules = requiredModules.filter(m => !window[m.name]);
    
    if (missingModules.length > 0) {
        console.warn('⚠️ Módulos faltantes:', missingModules.map(m => m.module));
        console.log('⏳ Esperando carga de módulos...');
    }
})();

// ============================
// CONTENT API SIMPLIFICADA
// ============================

const ContentAPI = {
    // Obtener imágenes públicas
    getPublicImages(count = 10) {
        if (!window.FULL_IMAGES_POOL) return [];
        
        if (window.ArrayUtils) {
            return window.ArrayUtils.getRandomItems(window.FULL_IMAGES_POOL, count);
        }
        
        return window.FULL_IMAGES_POOL.slice(0, count);
    },
    
    // Obtener imágenes premium
    getPremiumImages(count = 10) {
        const allPremium = [
            ...(window.PREMIUM_IMAGES_PART1 || []),
            ...(window.PREMIUM_IMAGES_PART2 || [])
        ];
        
        if (window.ArrayUtils) {
            return window.ArrayUtils.getRandomItems(allPremium, count);
        }
        
        return allPremium.slice(0, count);
    },
    
    // Obtener videos
    getVideos(count = 10) {
        if (!window.PREMIUM_VIDEOS_POOL) return [];
        
        if (window.ArrayUtils) {
            return window.ArrayUtils.getRandomItems(window.PREMIUM_VIDEOS_POOL, count);
        }
        
        return window.PREMIUM_VIDEOS_POOL.slice(0, count);
    },
    
    // Obtener banners
    getBanners() {
        if (window.BannerTeaserManager) {
            return window.BannerTeaserManager.getBanners();
        }
        
        return (window.FULL_IMAGES_POOL || [])
            .filter(img => img.includes('banner') || img.includes('bik'))
            .slice(0, 6);
    },
    
    // Obtener teasers
    getTeasers() {
        if (window.BannerTeaserManager) {
            return window.BannerTeaserManager.getTeasers();
        }
        
        return (window.FULL_IMAGES_POOL || [])
            .filter(img => img.includes('teaser') || img.includes('Sin') || img.includes('bikini'))
            .slice(0, 10);
    },
    
    // Buscar contenido
    search(query) {
        const results = {
            photos: [],
            videos: []
        };
        
        if (!query) return results;
        
        const queryLower = query.toLowerCase();
        
        // Buscar en fotos
        const allPhotos = [
            ...(window.FULL_IMAGES_POOL || []),
            ...(window.PREMIUM_IMAGES_PART1 || []),
            ...(window.PREMIUM_IMAGES_PART2 || [])
        ];
        
        results.photos = allPhotos.filter(img => 
            img.toLowerCase().includes(queryLower)
        );
        
        // Buscar en videos
        results.videos = (window.PREMIUM_VIDEOS_POOL || []).filter(video => 
            video.toLowerCase().includes(queryLower)
        );
        
        return results;
    },
    
    // Obtener estadísticas
    getStats() {
        return {
            total: this.getTotalCount(),
            public: window.FULL_IMAGES_POOL ? window.FULL_IMAGES_POOL.length : 0,
            premium: this.getPremiumCount(),
            videos: window.PREMIUM_VIDEOS_POOL ? window.PREMIUM_VIDEOS_POOL.length : 0
        };
    },
    
    // Obtener conteo total
    getTotalCount() {
        let total = 0;
        total += window.FULL_IMAGES_POOL ? window.FULL_IMAGES_POOL.length : 0;
        total += window.PREMIUM_IMAGES_PART1 ? window.PREMIUM_IMAGES_PART1.length : 0;
        total += window.PREMIUM_IMAGES_PART2 ? window.PREMIUM_IMAGES_PART2.length : 0;
        total += window.PREMIUM_VIDEOS_POOL ? window.PREMIUM_VIDEOS_POOL.length : 0;
        return total;
    },
    
    // Obtener conteo premium
    getPremiumCount() {
        let count = 0;
        count += window.PREMIUM_IMAGES_PART1 ? window.PREMIUM_IMAGES_PART1.length : 0;
        count += window.PREMIUM_IMAGES_PART2 ? window.PREMIUM_IMAGES_PART2.length : 0;
        return count;
    },
    
    // Rotar contenido
    rotate() {
        if (window.BannerTeaserManager) {
            window.BannerTeaserManager.rotateContent();
        }
        
        if (window.EventManager) {
            window.EventManager.emit('contentRotated', {
                timestamp: Date.now()
            });
        }
        
        return true;
    }
};

// ============================
// UNIFIED CONTENT API COMPLETA
// ============================

const UnifiedContentAPI = {
    initialized: false,
    
    // Inicializar API
    async initialize() {
        if (this.initialized) return true;
        
        console.log('🚀 Inicializando UnifiedContentAPI...');
        
        // Verificar dependencias
        const required = ['FULL_IMAGES_POOL', 'PREMIUM_IMAGES_PART1', 'PREMIUM_IMAGES_PART2', 'PREMIUM_VIDEOS_POOL'];
        const missing = required.filter(dep => !window[dep]);
        
        if (missing.length > 0) {
            console.error('❌ Dependencias faltantes:', missing);
            return false;
        }
        
        this.initialized = true;
        console.log('✅ UnifiedContentAPI inicializada');
        return true;
    },
    
    // Obtener todas las imágenes públicas
    getAllPublicImages() {
        return window.FULL_IMAGES_POOL || [];
    },
    
    // Obtener todas las imágenes premium
    getAllPremiumImages() {
        return [
            ...(window.PREMIUM_IMAGES_PART1 || []),
            ...(window.PREMIUM_IMAGES_PART2 || [])
        ];
    },
    
    // Obtener todos los videos
    getAllVideos() {
        return window.PREMIUM_VIDEOS_POOL || [];
    },
    
    // Obtener todo el contenido
    getAllContent() {
        return {
            publicImages: this.getAllPublicImages(),
            premiumImages: this.getAllPremiumImages(),
            videos: this.getAllVideos(),
            banners: ContentAPI.getBanners(),
            teasers: ContentAPI.getTeasers()
        };
    },
    
    // Buscar en todo el contenido
    searchAll(query) {
        if (!query) {
            return this.getAllContent();
        }
        
        const queryLower = query.toLowerCase();
        const all = this.getAllContent();
        
        return {
            publicImages: all.publicImages.filter(img => 
                img.toLowerCase().includes(queryLower)
            ),
            premiumImages: all.premiumImages.filter(img => 
                img.toLowerCase().includes(queryLower)
            ),
            videos: all.videos.filter(video => 
                video.toLowerCase().includes(queryLower)
            ),
            banners: all.banners.filter(img =>
                img.toLowerCase().includes(queryLower)
            ),
            teasers: all.teasers.filter(img =>
                img.toLowerCase().includes(queryLower)
            )
        };
    },
    
    // Obtener estadísticas del sistema
    getSystemStats() {
        return {
            photos: {
                public: this.getAllPublicImages().length,
                premium: this.getAllPremiumImages().length,
                total: this.getAllPublicImages().length + this.getAllPremiumImages().length
            },
            videos: {
                total: this.getAllVideos().length,
                estimatedSize: `${this.getAllVideos().length * 15}MB`
            },
            total: {
                files: this.getAllPublicImages().length + 
                       this.getAllPremiumImages().length + 
                       this.getAllVideos().length,
                images: this.getAllPublicImages().length + 
                        this.getAllPremiumImages().length,
                videos: this.getAllVideos().length
            },
            system: {
                version: window.ContentConfig?.version || '4.1.0',
                environment: window.ContentConfig?.environment || 'production',
                initialized: this.initialized
            }
        };
    },
    
    // Obtener contenido del día
    getTodaysContent() {
        if (!window.TimeUtils || !window.ArrayUtils) {
            console.warn('⚠️ TimeUtils o ArrayUtils no disponibles');
            return this.getAllContent();
        }
        
        const seed = window.TimeUtils.getDailySeed();
        
        return {
            photos: [
                ...window.ArrayUtils.shuffleWithSeed(this.getAllPublicImages(), seed).slice(0, 50),
                ...window.ArrayUtils.shuffleWithSeed(this.getAllPremiumImages(), seed + 1).slice(0, 150)
            ],
            videos: window.ArrayUtils.shuffleWithSeed(this.getAllVideos(), seed + 2).slice(0, 50),
            banners: window.ArrayUtils.shuffleWithSeed(ContentAPI.getBanners(), seed + 3),
            teasers: window.ArrayUtils.shuffleWithSeed(ContentAPI.getTeasers(), seed + 4),
            newPhotoIndices: new Set([0, 1, 2, 3, 4, 10, 11, 12, 20, 21, 22, 30, 31, 32]),
            newVideoIndices: new Set([0, 1, 2, 5, 6, 7]),
            lastUpdate: new Date(),
            seed: seed,
            stats: this.getSystemStats()
        };
    },
    
    // Paginar contenido
    paginateContent(type, page = 1, perPage = 24) {
        let content = [];
        
        switch(type) {
            case 'public':
                content = this.getAllPublicImages();
                break;
            case 'premium':
                content = this.getAllPremiumImages();
                break;
            case 'videos':
                content = this.getAllVideos();
                perPage = 12; // Menos videos por página
                break;
            case 'all':
                content = [
                    ...this.getAllPublicImages(),
                    ...this.getAllPremiumImages()
                ];
                break;
            default:
                content = [];
        }
        
        if (window.ArrayUtils) {
            return window.ArrayUtils.paginate(content, page, perPage);
        }
        
        const start = (page - 1) * perPage;
        const end = start + perPage;
        
        return {
            data: content.slice(start, end),
            page,
            perPage,
            total: content.length,
            totalPages: Math.ceil(content.length / perPage),
            hasNext: end < content.length,
            hasPrev: page > 1
        };
    },
    
    // Obtener contenido aleatorio con seed
    getRandomContentWithSeed(seed, photosCount = 200, videosCount = 50) {
        if (!window.ArrayUtils) {
            return {
                photos: [],
                videos: []
            };
        }
        
        const allPhotos = [
            ...this.getAllPublicImages(),
            ...this.getAllPremiumImages()
        ];
        
        return {
            photos: window.ArrayUtils.shuffleWithSeed(allPhotos, seed).slice(0, photosCount),
            videos: window.ArrayUtils.shuffleWithSeed(this.getAllVideos(), seed + 1).slice(0, videosCount)
        };
    }
};

// ============================
// CONTENT SYSTEM MANAGER
// ============================

class ContentSystemManager {
    constructor() {
        this.initialized = false;
        this.currentRotation = null;
        this.lastRotationTime = null;
    }
    
    async initialize() {
        console.log('🎯 Inicializando ContentSystemManager...');
        
        // Inicializar UnifiedContentAPI
        const apiReady = await UnifiedContentAPI.initialize();
        
        if (!apiReady) {
            console.error('❌ No se pudo inicializar UnifiedContentAPI');
            return false;
        }
        
        // Generar primera rotación
        this.generateRotation();
        
        // Configurar rotación automática
        if (window.ContentConfig?.content?.rotationEnabled) {
            this.setupAutoRotation();
        }
        
        this.initialized = true;
        console.log('✅ ContentSystemManager inicializado');
        return true;
    }
    
    generateRotation() {
        this.currentRotation = UnifiedContentAPI.getTodaysContent();
        this.lastRotationTime = new Date();
        
        // Emitir evento
        if (window.EventManager) {
            window.EventManager.emit('rotationGenerated', this.currentRotation);
        }
        
        return this.currentRotation;
    }
    
    setupAutoRotation() {
        const intervalHours = window.ContentConfig?.content?.rotationIntervalHours || 1;
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        setInterval(() => {
            this.generateRotation();
            console.log('🔄 Rotación automática ejecutada');
        }, intervalMs);
        
        console.log(`⏰ Rotación automática configurada cada ${intervalHours} hora(s)`);
    }
    
    getContent() {
        if (!this.currentRotation) {
            this.generateRotation();
        }
        return this.currentRotation;
    }
    
    getStats() {
        return {
            ...UnifiedContentAPI.getSystemStats(),
            rotation: {
                lastUpdate: this.lastRotationTime,
                currentSeed: this.currentRotation?.seed,
                enabled: window.ContentConfig?.content?.rotationEnabled
            }
        };
    }
}

// ============================
// EXPORTAR GLOBALMENTE
// ============================

window.ContentAPI = ContentAPI;
window.UnifiedContentAPI = UnifiedContentAPI;
window.ContentSystemManager = ContentSystemManager;

// Auto-inicializar UnifiedContentAPI
UnifiedContentAPI.initialize().then(success => {
    if (success) {
        console.log('✅ Sistema de contenido unificado listo');
    }
});

console.log('✅ Módulo content-data6.js cargado correctamente');
console.log('📊 APIs disponibles:', {
    ContentAPI: !!window.ContentAPI,
    UnifiedContentAPI: !!window.UnifiedContentAPI,
    ContentSystemManager: !!window.ContentSystemManager
});

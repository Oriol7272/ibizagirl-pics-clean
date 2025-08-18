/**
 * content-data2.js - Public Images Module v4.1.0 FIXED
 * Contains all public/full images (127 files)
 * Provides banner and teaser management
 */

'use strict';

console.log('📦 Cargando módulo content-data2.js - Imágenes públicas...');

// ============================
// PUBLIC IMAGES POOL (127 images) - LISTA COMPLETA
// ============================

const FULL_IMAGES_POOL = [
    'full/0456996c-b56e-42ef-9049-56b1a1ae2646.webp',
    'full/85158b64-4168-45fa-9cb4-0b40634f7fa1.webp',
    'full/0Tc8Vtd0mEIvNHZwYGBq.webp',
    'full/0lySugcO4Pp4pEZKvz9U.webp',
    'full/0nSaCJQxbVw4BDrhnhHO.webp',
    'full/13TXvyRVZ7LtvAOx7kme.webp',
    'full/18VQaczW5kdfdiqUVasH.webp',
    'full/1dEu25K0mS3zxRlXRjHR.webp',
    'full/1qEBcg9QbkZRRdLt0Chc.webp',
    'full/1tt8H4fX3XzyV90HjNG3.webp',
    'full/27bGIzFFpej5ubUkvykD.webp',
    'full/2gjqH68H586TKLDK9lh9.webp',
    'full/2yw4sowPh3Tyln5oxRdw.webp',
    'full/39GYGt3bticS0Mjbud0p.webp',
    'full/3IWka3fnP9b8yz6j5l91.webp',
    'full/3ZYL4GCUOs3rfq3iTPJ7.webp',
    'full/4GN6i0Db2hl4Ck9vf0LE.webp',
    'full/4YhoIAWSbVaOqBhAOGqR.webp',
    'full/82KxJ9daxf9MpK019L5I.webp',
    'full/83cSC4eRnYGZUNo9AoqD.webp',
    'full/8faf42TRuGOU4ZW9KS9W.webp',
    'full/92Ck0v3g8gZLEQ5vOmpd.webp',
    'full/993acHdsWLzG80gAFZQs.webp',
    'full/9D5U5fKXT72xnpqsgUaD.webp',
    'full/9v20KsJFZoAv2WQ8m3o2.webp',
    'full/AHKAq0biFDUtkxlx7TCu.webp',
    'full/ANhHtA0GivBfeAo6dvJG.webp',
    'full/AwKXjDqrJMTKNvB84iRy.webp',
    'full/CTyCcna8JSPObRQpulKJ.webp',
    'full/CmxJm1VLBBhvZoUwxWTJ.webp',
    'full/CuX7zQzCBToIMKBYVcA8.webp',
    'full/D3QdNfIR9B8YKPIYl0Hg.webp',
    'full/FElwiy3A7OtgubeV9Qsh.webp',
    'full/Fz2ORrJSrERl0BZGOH24.webp',
    'full/G4YdNFtdunscrnPe5Qb6.webp',
    'full/G5tR4rjmD4dWct9aKfMu.webp',
    'full/I2enQjaFiBfPB2hml0xQ.webp',
    'full/ICDQwh9QLaL3SpYTmk4i.webp',
    'full/IXCJwuZEjxFfPTinm4Cq.webp',
    'full/KdV7YfJSRdkUhCdH17lZ.webp',
    'full/KrjJ0Nh1OjqDRYLfJKGY.webp',
    'full/L31aDNAKWGOdPNsejJRA.webp',
    'full/LFv0YdpW3XKJvMN5mLzw.webp',
    'full/LoOgRN7V5M1HTlMOdOx9.webp',
    'full/MFzl3cW8ePBkYW9Df18O.webp',
    'full/MH98E5xp8a1QJVRWaQXa.webp',
    'full/MsQjg7VkRrIQdEZeW4zs.webp',
    'full/OAnK6W9zfmPZzJQzA6TC.webp',
    'full/ODj0xJRyajbqClW3qeVG.webp',
    'full/OECJOQpJGxCL9jYOcWzb.webp',
    'full/PAtbhHvFUIrJzqkj77jH.webp',
    'full/Pgy8DDL5w6Qp14UJQc5G.webp',
    'full/Q2DbShKs6NLAmcvzFRxz.webp',
    'full/Q6vYCOZsQrj6qVqvyKI0.webp',
    'full/QD44M1AXsUBhZRiNQvgx.webp',
    'full/QwRxN2Dqfb3vDCxrPqzn.webp',
    'full/RKLRfMCJWgLEj4QJGCYc.webp',
    'full/RSDnQIoTRwIcL0jdCk5F.webp',
    'full/SVy0K4vk3DKDCQJEPqQB.webp',
    'full/SW0OJFXY5n9Tk9GU2N8D.webp',
    'full/SdQy5ReBu3vdGJ5A4Wze.webp',
    'full/Sin nombre(12).webp',
    'full/Sin nombre(42).webp',
    'full/Sin nombre(63).webp',
    'full/Sin nombre(9).webp',
    'full/TN1xLsDXoCXHCkBJcqJK.webp',
    'full/TXO9Hl2G2x8EWWGKPh8q.webp',
    'full/TlJXP6lS0HRFHBSjMG7t.webp',
    'full/TsFZrROYBjhCF2g8lBIA.webp',
    'full/UAjD2eFLcvLZRyxcXfJU.webp',
    'full/UIudJRWDpEu11uzsGgjQ.webp',
    'full/UkXoQ2sUP0TzJoRbD5Z6.webp',
    'full/V3X30Xp6QLMznASb5LkH.webp',
    'full/V3niFjJGxAjIg5kBCUBA.webp',
    'full/V84ucrV6GMRdFWZrWHHa.webp',
    'full/V9OdPRFwsVsKxFZJPMtO.webp',
    'full/VH0YJzN0DUlJkOdH4BLu.webp',
    'full/VI7VXjPQ4tUWZH1hOsFQ.webp',
    'full/VL3dOflxDOhNZKgVLT8k.webp',
    'full/W8KKqP4GcQJBCu5yN4gW.webp',
    'full/XSoOa3eSVBh7GhJhxBVU.webp',
    'full/XTVnlIMQ4aKfLGiXz4yT.webp',
    'full/XZYKBklv3vwD5bqzO2WT.webp',
    'full/Y40xJsqOYzOdKGhKPrEB.webp',
    'full/Y9qJqXOwXi1qzsUU5vVy.webp',
    'full/YZrvKJ0bnQDBQIzVxUGT.webp',
    'full/Yc4bvPXFRKqCgNpnEfA9.webp',
    'full/Z5wbtPV3oChD0sA9lBB0.webp',
    'full/Z6CUeVm6WZJCKdSYxdTH.webp',
    'full/ZIShfHdOQdLqnr1fPZsQ.webp',
    'full/ZKaWHUQGQcdCqQJgMU5a.webp',
    'full/aWzOX7jQkJCiY0AEoXsL.webp',
    'full/b0SYaLa4PGo5xdoIaUu2.webp',
    'full/backbikini.webp',
    'full/bikback2.webp',
    'full/bikbanner.webp',
    'full/bikbanner2.webp',
    'full/bikini.webp',
    'full/bikini3.webp',
    'full/bikini5.webp',
    'full/buena.webp',
    'full/c0iCXJJgjgkUIAAD7NbB.webp',
    'full/cASVP1f8F1yKN0mfWxD2.webp',
    'full/dJgBrSUBAOXdHSJJ1F91.webp',
    'full/dOBHJG5fIq5DBtCrUvqN.webp',
    'full/dwer.webp',
    'full/eqI3hO2GyHF8HWqbiw6S.webp',
    'full/es.webp',
    'full/fr.webp',
    'full/gNgJHvMK8QiCOMlJqx2c.webp',
    'full/hArvMUbCsJrJHKQzGBxy.webp',
    'full/lqBcPpFqv3kqSgxHdmzL.webp',
    'full/mlJxdpnONdN6G5fRjPqn.webp',
    'full/oGSZdH8A8kkOtbmuMtX2.webp',
    'full/oRRJMJK5KyL1QvHOsBmQ.webp',
    'full/okDoSxMRKQQT3YCt0XJz.webp',
    'full/uLIvQbtHBLY4pJ2cZfK7.webp',
    'full/uk.webp',
    'full/vDtK78HoKoCKuH5F7FtN.webp',
    'full/ya.webp',
    'full/yOLqNW64fQJZdIGWUy9g.webp',
    'full/zZP4lNRJGUbKvUvLo6l4.webp'
];

// ============================
// BANNER & TEASER MANAGER
// ============================

class BannerTeaserManager {
    constructor() {
        this.banners = [];
        this.teasers = [];
        this.initializeContent();
    }
    
    initializeContent() {
        // Seleccionar banners específicos
        this.banners = FULL_IMAGES_POOL.filter(img => 
            img.includes('banner') || 
            img.includes('bik') ||
            img.includes('backbikini')
        ).slice(0, 6);
        
        // Si no hay suficientes banners, agregar aleatorios
        if (this.banners.length < 6) {
            const additional = FULL_IMAGES_POOL
                .filter(img => !this.banners.includes(img))
                .slice(0, 6 - this.banners.length);
            this.banners = [...this.banners, ...additional];
        }
        
        // Seleccionar teasers específicos
        this.teasers = FULL_IMAGES_POOL.filter(img => 
            img.includes('Sin nombre') || 
            img.includes('bikini') ||
            img.includes('buena')
        ).slice(0, 10);
        
        // Si no hay suficientes teasers, agregar aleatorios
        if (this.teasers.length < 10) {
            const additional = FULL_IMAGES_POOL
                .filter(img => !this.teasers.includes(img) && !this.banners.includes(img))
                .slice(0, 10 - this.teasers.length);
            this.teasers = [...this.teasers, ...additional];
        }
    }
    
    getBanners() {
        return this.banners;
    }
    
    getTeasers() {
        return this.teasers;
    }
    
    getRandomBanner() {
        return this.banners[Math.floor(Math.random() * this.banners.length)];
    }
    
    getRandomTeaser() {
        return this.teasers[Math.floor(Math.random() * this.teasers.length)];
    }
    
    rotateContent() {
        // Rotar contenido usando el seed del día
        if (window.TimeUtils) {
            const seed = window.TimeUtils.getHourlySeed();
            
            if (window.ArrayUtils) {
                this.banners = window.ArrayUtils.shuffleWithSeed(this.banners, seed);
                this.teasers = window.ArrayUtils.shuffleWithSeed(this.teasers, seed + 1);
            }
        }
        
        return {
            banners: this.banners,
            teasers: this.teasers
        };
    }
}

// ============================
// PUBLIC CONTENT MANAGER
// ============================

class PublicContentManager {
    constructor() {
        this.images = FULL_IMAGES_POOL;
        this.totalImages = this.images.length;
        console.log(`📸 Gestor de contenido público inicializado con ${this.totalImages} imágenes`);
    }
    
    getAll() {
        return this.images;
    }
    
    getRandom(count = 10) {
        if (window.ArrayUtils) {
            return window.ArrayUtils.getRandomItems(this.images, count);
        }
        return this.images.slice(0, count);
    }
    
    getByPage(page = 1, perPage = 24) {
        if (window.ArrayUtils) {
            return window.ArrayUtils.paginate(this.images, page, perPage);
        }
        
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return this.images.slice(start, end);
    }
    
    search(query) {
        if (window.ArrayUtils) {
            return window.ArrayUtils.search(this.images, query);
        }
        
        const queryLower = query.toLowerCase();
        return this.images.filter(img => img.toLowerCase().includes(queryLower));
    }
    
    getStats() {
        return {
            total: this.totalImages,
            categories: {
                banners: this.images.filter(img => img.includes('banner')).length,
                bikini: this.images.filter(img => img.includes('bikini')).length,
                flags: this.images.filter(img => ['es.webp', 'fr.webp', 'uk.webp'].some(flag => img.includes(flag))).length,
                others: this.images.filter(img => 
                    !img.includes('banner') && 
                    !img.includes('bikini') && 
                    !['es.webp', 'fr.webp', 'uk.webp'].some(flag => img.includes(flag))
                ).length
            }
        };
    }
}

// ============================
// EXPORTAR GLOBALMENTE
// ============================

window.FULL_IMAGES_POOL = FULL_IMAGES_POOL;
window.BannerTeaserManager = new BannerTeaserManager();
window.PublicContentManager = new PublicContentManager();

// Crear arrays de banners y teasers para compatibilidad
window.BANNER_IMAGES = window.BannerTeaserManager.getBanners();
window.TEASER_IMAGES = window.BannerTeaserManager.getTeasers();

console.log('✅ Módulo content-data2.js cargado correctamente');
console.log('📊 Estadísticas de contenido público:', {
    total: FULL_IMAGES_POOL.length,
    banners: window.BANNER_IMAGES.length,
    teasers: window.TEASER_IMAGES.length
});

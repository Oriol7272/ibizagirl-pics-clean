/**
 * content-data1.js - Configuration and Base Utilities v4.1.0 FIXED
 * Configuración base y utilidades para el sistema modular
 * IbizaGirl.pics - Paradise Gallery System
 */

'use strict';

console.log('📦 Cargando módulo content-data1.js - Configuración base...');

// ============================
// CONFIGURACIÓN GLOBAL
// ============================

const ContentConfig = {
    version: '4.1.0',
    environment: window.location.hostname === 'localhost' ? 'development' : 'production',
    
    // Configuración de contenido
    content: {
        photosPerPage: 24,
        videosPerPage: 12,
        bannersCount: 6,
        teasersCount: 9,
        rotationEnabled: true,
        rotationIntervalHours: 1
    },
    
    // Configuración de caché
    cache: {
        enabled: true,
        duration: 3600000, // 1 hora
        maxSize: 100 // MB
    },
    
    // Configuración de lazy loading
    lazyLoad: {
        enabled: true,
        offset: 50,
        throttle: 100
    },
    
    // PayPal configuración
    paypal: {
        clientId: 'AfQEdiielw5fm3wF08p9pcxwqR3gPz82YRNUTKY4A8WNG9AktiGsDNyr2i7BsjVzSwwpeCwR7Tt7DPq5',
        currency: 'EUR',
        environment: 'production'
    },
    
    // Precios
    pricing: {
        monthly: 15,
        lifetime: 100,
        packs: {
            small: 10,
            medium: 25,
            large: 50
        }
    },
    
    // Configuración de anuncios
    ads: {
        enabled: true,
        refreshInterval: 30000,
        maxPerPage: 4,
        networks: ['exoclick', 'trafficstars']
    }
};

// ============================
// UTILIDADES DE TIEMPO
// ============================

const TimeUtils = {
    // Obtener fecha actual
    getCurrentDate() {
        return new Date();
    },
    
    // Obtener seed diario para rotación
    getDailySeed() {
        const now = new Date();
        return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    },
    
    // Obtener seed horario
    getHourlySeed() {
        const now = new Date();
        return this.getDailySeed() * 100 + now.getHours();
    },
    
    // Formatear tiempo
    formatTime(date) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    },
    
    // Tiempo relativo
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `hace ${days} día${days > 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
        } else if (seconds > 0) {
            return `hace ${seconds} segundo${seconds > 1 ? 's' : ''}`;
        }
        
        return 'justo ahora';
    }
};

// ============================
// UTILIDADES DE ARRAYS
// ============================

const ArrayUtils = {
    // Mezclar array con seed
    shuffleWithSeed(array, seed) {
        const arr = [...array];
        let m = arr.length;
        let t, i;
        
        // Generador de números pseudoaleatorios con seed
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
        
        while (m) {
            i = Math.floor(random() * m--);
            t = arr[m];
            arr[m] = arr[i];
            arr[i] = t;
        }
        
        return arr;
    },
    
    // Obtener items aleatorios
    getRandomItems(array, count, seed = null) {
        if (!array || array.length === 0) return [];
        
        if (seed !== null) {
            const shuffled = this.shuffleWithSeed(array, seed);
            return shuffled.slice(0, Math.min(count, shuffled.length));
        }
        
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    
    // Dividir array en chunks
    chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    },
    
    // Paginar array
    paginate(array, page, perPage) {
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return {
            data: array.slice(start, end),
            page,
            perPage,
            total: array.length,
            totalPages: Math.ceil(array.length / perPage),
            hasNext: end < array.length,
            hasPrev: page > 1
        };
    },
    
    // Filtrar duplicados
    unique(array) {
        return [...new Set(array)];
    },
    
    // Buscar en array
    search(array, query, keys = []) {
        if (!query) return array;
        
        const queryLower = query.toLowerCase();
        return array.filter(item => {
            if (typeof item === 'string') {
                return item.toLowerCase().includes(queryLower);
            }
            
            if (keys.length > 0) {
                return keys.some(key => 
                    item[key] && item[key].toString().toLowerCase().includes(queryLower)
                );
            }
            
            return false;
        });
    },
    
    // Ordenar array
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = typeof a === 'object' ? a[key] : a;
            const bVal = typeof b === 'object' ? b[key] : b;
            
            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }
};

// ============================
// GESTOR DE EVENTOS
// ============================

class EventManager {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        this.on(event, onceCallback);
    }
}

// ============================
// GESTOR DE ALMACENAMIENTO
// ============================

class StorageManager {
    constructor(prefix = 'ibizagirl_') {
        this.prefix = prefix;
        this.storage = this.isAvailable() ? localStorage : this.memoryStorage();
    }
    
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    memoryStorage() {
        const data = {};
        return {
            getItem: (key) => data[key] || null,
            setItem: (key, value) => data[key] = value,
            removeItem: (key) => delete data[key],
            clear: () => Object.keys(data).forEach(key => delete data[key])
        };
    }
    
    get(key) {
        try {
            const item = this.storage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch(e) {
            return null;
        }
    }
    
    set(key, value, ttl = null) {
        try {
            const item = {
                value,
                timestamp: Date.now(),
                ttl
            };
            this.storage.setItem(this.prefix + key, JSON.stringify(item));
            return true;
        } catch(e) {
            return false;
        }
    }
    
    remove(key) {
        try {
            this.storage.removeItem(this.prefix + key);
            return true;
        } catch(e) {
            return false;
        }
    }
    
    clear() {
        try {
            Object.keys(this.storage)
                .filter(key => key.startsWith(this.prefix))
                .forEach(key => this.storage.removeItem(key));
            return true;
        } catch(e) {
            return false;
        }
    }
    
    isExpired(key) {
        const item = this.get(key);
        if (!item || !item.ttl) return false;
        return Date.now() - item.timestamp > item.ttl;
    }
}

// ============================
// DETECTOR DE CARACTERÍSTICAS
// ============================

const FeatureDetector = {
    // Detectar soporte WebP
    supportsWebP() {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        return canvas.toDataURL('image/webp').indexOf('image/webp') === 0;
    },
    
    // Detectar Intersection Observer
    supportsIntersectionObserver() {
        return 'IntersectionObserver' in window;
    },
    
    // Detectar Service Worker
    supportsServiceWorker() {
        return 'serviceWorker' in navigator;
    },
    
    // Detectar modo oscuro
    prefersDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    },
    
    // Detectar conexión lenta
    isSlowConnection() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            return connection.effectiveType === 'slow-2g' || 
                   connection.effectiveType === '2g' ||
                   connection.saveData === true;
        }
        return false;
    },
    
    // Detectar dispositivo móvil
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    // Detectar navegador
    getBrowser() {
        const ua = navigator.userAgent;
        if (ua.indexOf("Chrome") > -1) return "Chrome";
        if (ua.indexOf("Safari") > -1) return "Safari";
        if (ua.indexOf("Firefox") > -1) return "Firefox";
        if (ua.indexOf("Edge") > -1) return "Edge";
        return "Unknown";
    }
};

// ============================
// EXPORTAR GLOBALMENTE
// ============================

window.ContentConfig = ContentConfig;
window.TimeUtils = TimeUtils;
window.ArrayUtils = ArrayUtils;
window.EventManager = new EventManager();
window.StorageManager = new StorageManager();
window.FeatureDetector = FeatureDetector;

console.log('✅ Módulo content-data1.js cargado correctamente');
console.log('📊 Configuración:', ContentConfig);
console.log('🛠️ Utilidades disponibles:', {
    TimeUtils: !!TimeUtils,
    ArrayUtils: !!ArrayUtils,
    EventManager: !!window.EventManager,
    StorageManager: !!window.StorageManager,
    FeatureDetector: !!FeatureDetector
});

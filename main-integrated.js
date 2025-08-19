// ============================
// IBIZAGIRL.PICS - SISTEMA INTEGRADO v4.1.0
// Integración con módulos content-data existentes
// ============================

'use strict';

// ============================
// VERIFICACIÓN DE MÓDULOS CARGADOS
// ============================

function checkModulesLoaded() {
    const requiredModules = [
        'ContentConfig',        // content-data1.js
        'FULL_IMAGES_POOL',    // content-data2.js
        'PREMIUM_IMAGES_PART1', // content-data3.js
        'PREMIUM_IMAGES_PART2', // content-data4.js
        'PREMIUM_VIDEOS_POOL',  // content-data5.js
        'UnifiedContentAPI'     // content-data6.js
    ];
    
    const missingModules = requiredModules.filter(module => !window[module]);
    
    if (missingModules.length > 0) {
        console.warn('⚠️ Módulos faltantes:', missingModules);
        return false;
    }
    
    console.log('✅ Todos los módulos cargados correctamente');
    return true;
}

// ============================
// CONFIGURACIÓN EXTENDIDA
// ============================

const ExtendedConfig = {
    ...window.ContentConfig,
    
    // Override de PayPal con las credenciales correctas
    paypal: {
        clientId: 'AfQEdiielw5fm3wF08p9pcxwqR3gPz82YRNUTKY4A8WNG9AktiGsDNyr2i7BsjVzSwwpeCwR7Tt7DPq5',
        currency: 'EUR'
    },
    
    // Precios actualizados
    pricing: {
        photo: 0.10,
        video: 0.30,
        monthly: 19.99,
        lifetime: 100.00
    },
    
    // Configuración de visualización
    display: {
        photosPerPage: 24,
        videosPerPage: 12,
        bannersToShow: 6,
        teasersToShow: 10
    }
};

// ============================
// ESTADO GLOBAL DE LA APLICACIÓN
// ============================

const GlobalState = {
    isVIP: false,
    currentView: 'gallery',
    currentGalleryType: 'free',
    currentPage: 1,
    selectedItems: [],
    purchases: [],
    dailyContent: null,
    bannerIndex: 0,
    isLoading: false,
    modalOpen: false
};

// ============================
// GESTOR DE CONTENIDO MEJORADO
// ============================

class ContentSystemManager {
    constructor() {
        this.initialized = false;
        this.allPremiumImages = [];
        this.currentRotation = null;
    }
    
    async initialize() {
        // Esperar a que todos los módulos estén cargados
        let attempts = 0;
        while (!checkModulesLoaded() && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!checkModulesLoaded()) {
            throw new Error('No se pudieron cargar todos los módulos necesarios');
        }
        
        // Combinar todas las imágenes premium
        this.allPremiumImages = [
            ...(window.PREMIUM_IMAGES_PART1 || []),
            ...(window.PREMIUM_IMAGES_PART2 || [])
        ];
        
        // Obtener contenido del día
        if (window.UnifiedContentAPI && window.UnifiedContentAPI.getTodaysContent) {
            this.currentRotation = window.UnifiedContentAPI.getTodaysContent();
            GlobalState.dailyContent = this.currentRotation;
        }
        
        this.initialized = true;
        console.log('✅ ContentSystemManager inicializado');
        console.log('📊 Estadísticas:', this.getStats());
    }
    
    getStats() {
        return {
            publicPhotos: window.FULL_IMAGES_POOL ? window.FULL_IMAGES_POOL.length : 0,
            premiumPhotos: this.allPremiumImages.length,
            videos: window.PREMIUM_VIDEOS_POOL ? window.PREMIUM_VIDEOS_POOL.length : 0,
            total: (window.FULL_IMAGES_POOL?.length || 0) + 
                   this.allPremiumImages.length + 
                   (window.PREMIUM_VIDEOS_POOL?.length || 0)
        };
    }
    
    getPublicPhotos(count = null) {
        const photos = window.FULL_IMAGES_POOL || [];
        return count ? photos.slice(0, count) : photos;
    }
    
    getPremiumPhotos(count = null) {
        return count ? this.allPremiumImages.slice(0, count) : this.allPremiumImages;
    }
    
    getVideos(count = null) {
        const videos = window.PREMIUM_VIDEOS_POOL || [];
        return count ? videos.slice(0, count) : videos;
    }
    
    getBanners() {
        if (window.BannerTeaserManager) {
            return window.BannerTeaserManager.getBanners();
        }
        
        // Fallback: usar imágenes que contengan "banner" o "bik"
        return window.FULL_IMAGES_POOL.filter(img => 
            img.includes('banner') || img.includes('bik')
        ).slice(0, 6);
    }
    
    getTeasers() {
        if (window.BannerTeaserManager) {
            return window.BannerTeaserManager.getTeasers();
        }
        
        // Fallback: usar imágenes aleatorias
        return window.FULL_IMAGES_POOL.filter(img => 
            img.includes('Sin nombre') || img.includes('bikini')
        ).slice(0, 10);
    }
    
    getDailyContent() {
        if (GlobalState.dailyContent) {
            return GlobalState.dailyContent;
        }
        
        // Generar contenido diario si no existe
        const seed = new Date().getDate();
        return {
            photos: this.shuffleArray(this.getPublicPhotos(), seed).slice(0, 50),
            premium: this.shuffleArray(this.getPremiumPhotos(), seed + 1).slice(0, 50),
            videos: this.shuffleArray(this.getVideos(), seed + 2).slice(0, 20),
            newIndices: new Set([0, 1, 2, 5, 8, 10, 15, 20])
        };
    }
    
    shuffleArray(array, seed = Math.random()) {
        const arr = [...array];
        let currentIndex = arr.length;
        
        // Usar seed para generar números pseudoaleatorios
        const random = () => {
            seed = (seed * 9301 + 49297) % 233280;
            return seed / 233280;
        };
        
        while (currentIndex !== 0) {
            const randomIndex = Math.floor(random() * currentIndex);
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        
        return arr;
    }
}

// ============================
// GESTOR DE UI MEJORADO
// ============================

class UISystemManager {
    constructor(contentManager) {
        this.contentManager = contentManager;
        this.currentGalleryData = null;
    }
    
    async initialize() {
        // Inicializar banner carousel
        this.initBannerCarousel();
        
        // Cargar galería inicial
        await this.loadGallery('free');
        
        // Cargar videos
        this.loadVideoGallery();
        
        // Inicializar event listeners
        this.setupEventListeners();
        
        console.log('✅ UISystemManager inicializado');
    }
    
    initBannerCarousel() {
        const banners = this.contentManager.getBanners();
        const carousel = document.querySelector('.banner-carousel');
        
        if (!carousel || banners.length === 0) return;
        
        // Limpiar carousel existente
        carousel.innerHTML = '';
        
        // Crear slides
        banners.forEach((banner, index) => {
            const slide = document.createElement('div');
            slide.className = `banner-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `<img src="/full/${banner}" alt="Banner ${index + 1}" onerror="this.src='/full/bikini.webp'">`;
            carousel.appendChild(slide);
        });
        
        // Iniciar rotación automática
        this.startBannerRotation();
    }
    
    startBannerRotation() {
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length === 0) return;
        
        setInterval(() => {
            slides[GlobalState.bannerIndex].classList.remove('active');
            GlobalState.bannerIndex = (GlobalState.bannerIndex + 1) % slides.length;
            slides[GlobalState.bannerIndex].classList.add('active');
        }, 5000);
    }
    
    async loadGallery(type = 'free', page = 1) {
        GlobalState.currentGalleryType = type;
        GlobalState.currentPage = page;
        
        const gallery = document.getElementById('photo-gallery');
        if (!gallery) return;
        
        // Mostrar loading
        gallery.innerHTML = '<div class="loading-spinner">Cargando...</div>';
        
        let photos = [];
        let basePath = '';
        
        switch(type) {
            case 'free':
                photos = this.contentManager.getPublicPhotos();
                basePath = '/full/';
                break;
                
            case 'premium':
                photos = this.contentManager.getPremiumPhotos();
                basePath = '/uncensored/';
                break;
                
            case 'daily':
                const daily = this.contentManager.getDailyContent();
                photos = [...daily.photos.slice(0, 12), ...daily.premium.slice(0, 12)];
                basePath = ''; // Se determinará por foto
                break;
        }
        
        // Paginar resultados
        const perPage = ExtendedConfig.display.photosPerPage;
        const start = (page - 1) * perPage;
        const paginatedPhotos = photos.slice(start, start + perPage);
        
        // Limpiar galería
        gallery.innerHTML = '';
        
        // Renderizar fotos
        paginatedPhotos.forEach((photo, index) => {
            const item = this.createGalleryItem(photo, type, index + start);
            gallery.appendChild(item);
        });
        
        // Añadir paginación
        this.renderPagination(gallery, page, Math.ceil(photos.length / perPage), type);
        
        // Actualizar tabs activos
        this.updateActiveTabs(type);
        
        // Actualizar estadísticas
        this.updateStats();
    }
    
    createGalleryItem(filename, type, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // Determinar si es premium
        const isPremium = type === 'premium' || filename.includes('uncensored');
        
        // Determinar si es nuevo (contenido diario)
        const isNew = type === 'daily' && GlobalState.dailyContent?.newIndices?.has(index);
        
        // Determinar ruta base
        let basePath = '/full/';
        if (isPremium || filename.startsWith('uncensored/')) {
            basePath = '/uncensored/';
            filename = filename.replace('uncensored/', '');
        }
        
        // Añadir clases
        if (isPremium && !GlobalState.isVIP) {
            item.classList.add('premium');
        }
        if (isNew) {
            item.classList.add('new');
        }
        
        // Crear contenido
        item.innerHTML = `
            <img src="${basePath}${filename}" 
                 alt="Photo ${index + 1}" 
                 loading="lazy"
                 onerror="this.src='/full/bikini.webp'">
            ${isPremium && !GlobalState.isVIP ? '<div class="lock-overlay">🔒 PREMIUM</div>' : ''}
            ${isNew ? '<div class="new-badge">✨ NEW</div>' : ''}
        `;
        
        // Añadir event listener
        item.addEventListener('click', () => {
            this.handlePhotoClick(filename, isPremium, basePath);
        });
        
        return item;
    }
    
    loadVideoGallery() {
        const gallery = document.getElementById('video-gallery');
        if (!gallery) return;
        
        const videos = this.contentManager.getVideos(ExtendedConfig.display.videosPerPage);
        
        gallery.innerHTML = '';
        
        videos.forEach((video, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item video-item premium';
            
            // Usar una imagen de preview o thumbnail
            const thumbnail = `/full/bikini${(index % 5) + 1}.webp`;
            
            item.innerHTML = `
                <img src="${thumbnail}" alt="Video ${index + 1}" loading="lazy">
                <div class="play-overlay">▶️</div>
                ${!GlobalState.isVIP ? '<div class="lock-overlay">🔒 €0.30</div>' : ''}
            `;
            
            item.addEventListener('click', () => {
                this.handleVideoClick(video);
            });
            
            gallery.appendChild(item);
        });
    }
    
    handlePhotoClick(filename, isPremium, basePath) {
        if (isPremium && !GlobalState.isVIP) {
            // Abrir modal de pago
            PaymentSystemManager.openPaymentModal('photo', filename);
        } else {
            // Ver imagen completa
            this.openImageViewer(basePath + filename);
        }
    }
    
    handleVideoClick(filename) {
        if (!GlobalState.isVIP) {
            // Abrir modal de pago
            PaymentSystemManager.openPaymentModal('video', filename);
        } else {
            // Reproducir video
            this.openVideoPlayer('/uncensored-videos/' + filename);
        }
    }
    
    openImageViewer(src) {
        const modal = document.createElement('div');
        modal.className = 'modal image-modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <img src="${src}" alt="Full size image" style="max-width: 90vw; max-height: 90vh;">
                <div class="modal-footer">
                    <button onclick="window.open('${src}', '_blank')">⬇️ Descargar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        GlobalState.modalOpen = true;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                GlobalState.modalOpen = false;
            }
        });
    }
    
    openVideoPlayer(src) {
        const modal = document.createElement('div');
        modal.className = 'modal video-modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <video controls autoplay style="max-width: 90vw; max-height: 80vh;">
                    <source src="${src}" type="video/mp4">
                    Tu navegador no soporta videos HTML5.
                </video>
            </div>
        `;
        
        document.body.appendChild(modal);
        GlobalState.modalOpen = true;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                const video = modal.querySelector('video');
                video.pause();
                modal.remove();
                GlobalState.modalOpen = false;
            }
        });
    }
    
    renderPagination(container, currentPage, totalPages, type) {
        if (totalPages <= 1) return;
        
        const pagination = document.createElement('div');
        pagination.className = 'pagination';
        pagination.style.cssText = 'text-align: center; margin-top: 30px;';
        
        // Botón anterior
        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← Anterior';
            prevBtn.style.cssText = 'margin: 0 5px; padding: 10px 20px; cursor: pointer;';
            prevBtn.onclick = () => this.loadGallery(type, currentPage - 1);
            pagination.appendChild(prevBtn);
        }
        
        // Números de página
        const maxButtons = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(totalPages, startPage + maxButtons - 1);
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.style.cssText = `margin: 0 5px; padding: 10px 15px; cursor: pointer; ${i === currentPage ? 'background: #ff69b4; color: white;' : ''}`;
            pageBtn.onclick = () => this.loadGallery(type, i);
            pagination.appendChild(pageBtn);
        }
        
        // Botón siguiente
        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Siguiente →';
            nextBtn.style.cssText = 'margin: 0 5px; padding: 10px 20px; cursor: pointer;';
            nextBtn.onclick = () => this.loadGallery(type, currentPage + 1);
            pagination.appendChild(nextBtn);
        }
        
        container.appendChild(pagination);
    }
    
    updateActiveTabs(activeType) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-type') === activeType) {
                btn.classList.add('active');
            }
        });
    }
    
    updateStats() {
        const stats = this.contentManager.getStats();
        
        // Actualizar contadores en la UI
        const photoCounter = document.querySelector('.stat-number[data-stat="photos"]');
        if (photoCounter) {
            photoCounter.textContent = (stats.publicPhotos + stats.premiumPhotos) + '+';
        }
        
        const videoCounter = document.querySelector('.stat-number[data-stat="videos"]');
        if (videoCounter) {
            videoCounter.textContent = stats.videos + '+';
        }
    }
    
    setupEventListeners() {
        // Tabs de galería
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-type') || btn.textContent.toLowerCase();
                this.loadGallery(type === 'gratis' ? 'free' : type);
            });
        });
        
        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && GlobalState.modalOpen) {
                document.querySelectorAll('.modal').forEach(modal => modal.remove());
                GlobalState.modalOpen = false;
            }
        });
    }
}

// ============================
// GESTOR DE PAGOS
// ============================

class PaymentSystemManager {
    static openPaymentModal(type, item) {
        const modal = document.getElementById('paymentModal') || this.createPaymentModal();
        const title = modal.querySelector('#modal-title');
        const description = modal.querySelector('#modal-description');
        
        let price, itemDescription;
        
        switch(type) {
            case 'photo':
                price = ExtendedConfig.pricing.photo;
                itemDescription = 'Foto Premium HD';
                title.textContent = 'Comprar Foto Premium';
                description.textContent = `Precio: €${price} - Descarga inmediata en alta resolución`;
                break;
                
            case 'video':
                price = ExtendedConfig.pricing.video;
                itemDescription = 'Video Premium HD';
                title.textContent = 'Comprar Video Premium';
                description.textContent = `Precio: €${price} - Video completo sin restricciones`;
                break;
                
            case 'monthly':
                price = ExtendedConfig.pricing.monthly;
                itemDescription = 'Suscripción Mensual VIP';
                title.textContent = 'Suscripción VIP';
                description.textContent = `Precio: €${price}/mes - Acceso ilimitado a todo el contenido`;
                break;
                
            case 'lifetime':
                price = ExtendedConfig.pricing.lifetime;
                itemDescription = 'Acceso Lifetime';
                title.textContent = 'Acceso de Por Vida';
                description.textContent = `Precio: €${price} - Pago único, acceso permanente`;
                break;
        }
        
        modal.style.display = 'flex';
        GlobalState.modalOpen = true;
        
        // Inicializar PayPal
        this.initPayPalButton(price, itemDescription, item);
    }
    
    static createPaymentModal() {
        const modal = document.createElement('div');
        modal.id = 'paymentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="PaymentSystemManager.closePaymentModal()">&times;</span>
                <h2 id="modal-title">Completar Pago</h2>
                <p id="modal-description">Selecciona tu método de pago</p>
                <div id="paypal-container" style="margin-top: 20px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }
    
    static closePaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
            GlobalState.modalOpen = false;
            // Limpiar botones de PayPal
            document.getElementById('paypal-container').innerHTML = '';
        }
    }
    
    static initPayPalButton(amount, description, item) {
        const container = document.getElementById('paypal-container');
        container.innerHTML = ''; // Limpiar botones anteriores
        
        if (typeof paypal === 'undefined') {
            container.innerHTML = '<p style="color: red;">Error: PayPal no está cargado. Por favor, recarga la página.</p>';
            return;
        }
        
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: amount.toFixed(2),
                            currency_code: 'EUR'
                        },
                        description: description
                    }]
                });
            },
            
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    // Pago exitoso
                    console.log('Pago completado:', details);
                    
                    // Guardar compra
                    PaymentSystemManager.savePurchase(description, amount, item, details.id);
                    
                    // Si es suscripción, activar VIP
                    if (description.includes('VIP') || description.includes('Lifetime')) {
                        PaymentSystemManager.activateVIP();
                    }
                    
                    // Mostrar confirmación
                    alert(`¡Pago completado con éxito! Gracias por tu compra.`);
                    
                    // Cerrar modal
                    PaymentSystemManager.closePaymentModal();
                    
                    // Si es contenido individual, mostrarlo
                    if (item && !description.includes('VIP')) {
                        PaymentSystemManager.unlockSingleItem(item);
                    }
                });
            },
            
            onError: function(err) {
                console.error('Error de PayPal:', err);
                alert('Error al procesar el pago. Por favor, intenta de nuevo.');
            },
            
            onCancel: function(data) {
                console.log('Pago cancelado por el usuario');
            }
        }).render('#paypal-container');
    }
    
    static savePurchase(description, amount, item, transactionId) {
        const purchase = {
            description,
            amount,
            item,
            transactionId,
            date: new Date().toISOString()
        };
        
        GlobalState.purchases.push(purchase);
        
        // Guardar en localStorage
        const savedPurchases = JSON.parse(localStorage.getItem('ibizagirl_purchases') || '[]');
        savedPurchases.push(purchase);
        localStorage.setItem('ibizagirl_purchases', JSON.stringify(savedPurchases));
    }
    
    static activateVIP() {
        GlobalState.isVIP = true;
        
        // Guardar estado VIP
        localStorage.setItem('ibizagirl_vip', 'true');
        localStorage.setItem('ibizagirl_vip_date', new Date().toISOString());
        
        // Actualizar UI
        document.querySelectorAll('.gallery-item.premium').forEach(item => {
            item.classList.remove('premium');
            const lockOverlay = item.querySelector('.lock-overlay');
            if (lockOverlay) lockOverlay.remove();
        });
        
        // Actualizar botón VIP
        const vipBtn = document.querySelector('.vip-btn');
        if (vipBtn) {
            vipBtn.textContent = '👑 VIP Member';
            vipBtn.style.background = 'linear-gradient(45deg, #ff1493, #ff69b4)';
        }
        
        // Mostrar mensaje de éxito
        this.showSuccessMessage('¡Felicidades! Ahora eres miembro VIP con acceso ilimitado.');
    }
    
    static unlockSingleItem(item) {
        // Lógica para desbloquear un elemento individual
        console.log('Desbloqueando elemento:', item);
        
        // Si es una foto, mostrarla
        if (item.endsWith('.webp') || item.endsWith('.jpg')) {
            const basePath = item.includes('uncensored') ? '/uncensored/' : '/full/';
            window.uiManager.openImageViewer(basePath + item.replace('uncensored/', ''));
        }
        
        // Si es un video, reproducirlo
        if (item.endsWith('.mp4')) {
            window.uiManager.openVideoPlayer('/uncensored-videos/' + item);
        }
    }
    
    static showSuccessMessage(message) {
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #00c851, #00ff00);
            color: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 200, 81, 0.4);
            z-index: 10000;
            animation: slideIn 0.5s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }
}

// ============================
// INICIALIZACIÓN DEL SISTEMA
// ============================

let contentManager;
let uiManager;

async function initializeSystem() {
    console.log('🚀 Iniciando IbizaGirl.pics System v4.1.0...');
    
    try {
        // Verificar estado VIP guardado
        const savedVIP = localStorage.getItem('ibizagirl_vip');
        if (savedVIP === 'true') {
            GlobalState.isVIP = true;
        }
        
        // Cargar compras guardadas
        const savedPurchases = localStorage.getItem('ibizagirl_purchases');
        if (savedPurchases) {
            GlobalState.purchases = JSON.parse(savedPurchases);
        }
        
        // Inicializar gestores
        contentManager = new ContentSystemManager();
        await contentManager.initialize();
        
        uiManager = new UISystemManager(contentManager);
        await uiManager.initialize();
        
        // Hacer disponibles globalmente
        window.contentManager = contentManager;
        window.uiManager = uiManager;
        window.PaymentSystemManager = PaymentSystemManager;
        window.GlobalState = GlobalState;
        
        console.log('✅ Sistema inicializado correctamente');
        console.log('📊 Estado actual:', GlobalState);
        
        // Ocultar pantalla de carga si existe
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 500);
        }
        
    } catch (error) {
        console.error('❌ Error al inicializar el sistema:', error);
        alert('Error al cargar el contenido. Por favor, recarga la página.');
    }
}

// ============================
// FUNCIONES PÚBLICAS PARA HTML
// ============================

function showGallery(type) {
    if (uiManager) {
        uiManager.loadGallery(type);
    }
}

function purchaseSubscription(type) {
    PaymentSystemManager.openPaymentModal(type);
}

function purchaseItem(type) {
    PaymentSystemManager.openPaymentModal(type);
}

function closeModal() {
    PaymentSystemManager.closePaymentModal();
}

// ============================
// ARRANQUE DEL SISTEMA
// ============================

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSystem);
} else {
    // DOM ya está listo
    initializeSystem();
}

// Exportar funciones globales
window.showGallery = showGallery;
window.purchaseSubscription = purchaseSubscription;
window.purchaseItem = purchaseItem;
window.closeModal = closeModal;

console.log('📜 Sistema de integración cargado. Esperando módulos content-data...');

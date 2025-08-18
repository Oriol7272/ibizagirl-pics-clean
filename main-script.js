// ============================
// IBIZAGIRL.PICS - MAIN SCRIPT v4.1.0
// Sistema Principal con Integración Modular
// ============================

'use strict';

// ============================
// CONFIGURATION & CONSTANTS
// ============================

const CONFIG = {
    version: '4.1.0',
    debug: false,
    api: {
        baseUrl: 'https://ibizagirl.pics',
        timeout: 10000,
        retryAttempts: 3
    },
    media: {
        lazyLoadOffset: 50,
        imageQuality: 'high',
        videoPreload: 'metadata'
    },
    cache: {
        duration: 3600000, // 1 hora
        maxSize: 50 // MB
    },
    analytics: {
        enabled: true,
        trackingId: 'G-DBXYNPBSPY'
    },
    ads: {
        enabled: true,
        refreshInterval: 60000, // 1 minuto
        maxRetries: 3
    }
};

const ENVIRONMENT = {
    isDevelopment: window.location.hostname === 'localhost',
    isProduction: window.location.hostname === 'ibizagirl.pics',
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

// ============================
// TRANSLATIONS
// ============================

const TRANSLATIONS = {
    es: {
        welcome: "Bienvenido",
        photos: "Fotos",
        videos: "Videos",
        vip: "VIP",
        packages: "Paquetes",
        daily: "Diarias",
        premium: "Premium",
        exclusive: "Exclusivo",
        subscribe: "Suscribirse",
        buyNow: "Comprar Ahora",
        loading: "Cargando...",
        error: "Error al cargar",
        retry: "Reintentar"
    },
    en: {
        welcome: "Welcome",
        photos: "Photos",
        videos: "Videos",
        vip: "VIP",
        packages: "Packages",
        daily: "Daily",
        premium: "Premium",
        exclusive: "Exclusive",
        subscribe: "Subscribe",
        buyNow: "Buy Now",
        loading: "Loading...",
        error: "Loading error",
        retry: "Retry"
    },
    fr: {
        welcome: "Bienvenue",
        photos: "Photos",
        videos: "Vidéos",
        vip: "VIP",
        packages: "Forfaits",
        daily: "Quotidien",
        premium: "Premium",
        exclusive: "Exclusif",
        subscribe: "S'abonner",
        buyNow: "Acheter",
        loading: "Chargement...",
        error: "Erreur de chargement",
        retry: "Réessayer"
    },
    de: {
        welcome: "Willkommen",
        photos: "Fotos",
        videos: "Videos",
        vip: "VIP",
        packages: "Pakete",
        daily: "Täglich",
        premium: "Premium",
        exclusive: "Exklusiv",
        subscribe: "Abonnieren",
        buyNow: "Jetzt kaufen",
        loading: "Laden...",
        error: "Ladefehler",
        retry: "Wiederholen"
    },
    it: {
        welcome: "Benvenuto",
        photos: "Foto",
        videos: "Video",
        vip: "VIP",
        packages: "Pacchetti",
        daily: "Giornaliero",
        premium: "Premium",
        exclusive: "Esclusivo",
        subscribe: "Iscriviti",
        buyNow: "Acquista ora",
        loading: "Caricamento...",
        error: "Errore di caricamento",
        retry: "Riprova"
    },
    pt: {
        welcome: "Bem-vindo",
        photos: "Fotos",
        videos: "Vídeos",
        vip: "VIP",
        packages: "Pacotes",
        daily: "Diário",
        premium: "Premium",
        exclusive: "Exclusivo",
        subscribe: "Inscrever-se",
        buyNow: "Comprar agora",
        loading: "Carregando...",
        error: "Erro ao carregar",
        retry: "Tentar novamente"
    }
};

// ============================
// STATE MANAGEMENT
// ============================

const state = {
    currentLanguage: 'es',
    isLoading: false,
    currentSlide: 0,
    dailyContent: null,
    userData: {
        isVIP: false,
        purchases: [],
        preferences: {}
    },
    ui: {
        modalOpen: false,
        sidebarOpen: false,
        currentView: 'gallery'
    },
    cache: new Map(),
    errors: []
};

// ============================
// ERROR HANDLER
// ============================

const ErrorHandler = {
    errors: [],
    maxErrors: 50,
    
    logError(error, context = '') {
        const errorInfo = {
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errors.push(errorInfo);
        
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }
        
        if (CONFIG.debug) {
            console.error(`[${context}]`, error);
        }
        
        // Enviar errores críticos al servidor
        if (this.isCriticalError(error)) {
            this.reportToServer(errorInfo);
        }
    },
    
    isCriticalError(error) {
        const criticalPatterns = [
            'PayPal',
            'payment',
            'undefined is not',
            'Cannot read property',
            'Network request failed'
        ];
        
        return criticalPatterns.some(pattern => 
            error?.message?.includes(pattern)
        );
    },
    
    reportToServer(errorInfo) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: false
            });
        }
    },
    
    clearErrors() {
        this.errors = [];
    }
};

// ============================
// UTILITY FUNCTIONS
// ============================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days = 30) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict;Secure`;
}

// ============================
// LANGUAGE FUNCTIONS
// ============================

function detectUserLanguage() {
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang && TRANSLATIONS[savedLang]) {
        return savedLang;
    }
    
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    if (TRANSLATIONS[browserLang]) {
        return browserLang;
    }
    
    return 'es';
}

function changeLanguage(lang) {
    if (!TRANSLATIONS[lang]) {
        console.warn(`Language ${lang} not supported`);
        return;
    }
    
    state.currentLanguage = lang;
    localStorage.setItem('userLanguage', lang);
    updateUILanguage();
    
    // Track language change
    trackEvent('language_change', { language: lang });
}

function updateUILanguage() {
    const elements = document.querySelectorAll('[data-translate]');
    const currentTranslations = TRANSLATIONS[state.currentLanguage];
    
    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (currentTranslations[key]) {
            element.textContent = currentTranslations[key];
        }
    });
}

// ============================
// MEDIA HANDLERS
// ============================

function handleImageError(img) {
    console.warn('Image failed to load:', img.src);
    
    if (!img.dataset.retryCount) {
        img.dataset.retryCount = '0';
    }
    
    const retryCount = parseInt(img.dataset.retryCount);
    
    if (retryCount < CONFIG.api.retryAttempts) {
        img.dataset.retryCount = String(retryCount + 1);
        
        setTimeout(() => {
            const originalSrc = img.src;
            img.src = '';
            img.src = originalSrc;
        }, 1000 * Math.pow(2, retryCount));
    } else {
        img.src = '/assets/placeholder.webp';
        img.classList.add('error');
        
        const parent = img.closest('.media-item');
        if (parent) {
            parent.classList.add('load-error');
        }
    }
}

function handleVideoError(video) {
    console.warn('Video failed to load:', video.src);
    
    const parent = video.closest('.media-item');
    if (parent) {
        parent.classList.add('load-error');
        parent.innerHTML = `
            <div class="video-error">
                <p>Error al cargar el video</p>
                <button onclick="retryVideo('${video.src}', this)">Reintentar</button>
            </div>
        `;
    }
}

function retryVideo(src, button) {
    const parent = button.closest('.media-item');
    parent.classList.remove('load-error');
    parent.innerHTML = `
        <video controls preload="${CONFIG.media.videoPreload}" 
               onerror="handleVideoError(this)">
            <source src="${src}" type="video/mp4">
        </video>
    `;
}

// ============================
// LAZY LOADING
// ============================

function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: `${CONFIG.media.lazyLoadOffset}px`
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback para navegadores antiguos
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ============================
// MODAL FUNCTIONS
// ============================

function showVIPModal() {
    const modal = document.getElementById('vipModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        state.ui.modalOpen = true;
        trackEvent('modal_open', { type: 'vip' });
    }
}

function showPackModal() {
    const modal = document.getElementById('packModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        state.ui.modalOpen = true;
        trackEvent('modal_open', { type: 'pack' });
    }
}

function showPPVModal() {
    const modal = document.getElementById('ppvModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        state.ui.modalOpen = true;
        trackEvent('modal_open', { type: 'ppv' });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        state.ui.modalOpen = false;
        trackEvent('modal_close', { type: modalId });
    }
}

// ============================
// PAYMENT FUNCTIONS
// ============================

function selectPlan(planType) {
    trackEvent('plan_selected', { plan: planType });
    
    const prices = {
        monthly: 29.99,
        quarterly: 79.99,
        annual: 299.99
    };
    
    const price = prices[planType];
    if (!price) return;
    
    // Inicializar PayPal
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: price.toFixed(2),
                            currency_code: 'EUR'
                        },
                        description: `VIP ${planType} - IbizaGirl.pics`
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    handlePaymentSuccess('vip', planType, details);
                });
            },
            onError: function(err) {
                handlePaymentError(err);
            }
        }).render('#paypal-button-container');
    }
}

function selectPack(packType) {
    trackEvent('pack_selected', { pack: packType });
    
    const prices = {
        pack10: 14.99,
        pack25: 29.99,
        pack50: 49.99,
        packAll: 99.99
    };
    
    const price = prices[packType];
    if (!price) return;
    
    // Procesar pago
    initializePayment('pack', packType, price);
}

function initializePayment(type, item, price) {
    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: price.toFixed(2),
                            currency_code: 'EUR'
                        },
                        description: `${type} - ${item} - IbizaGirl.pics`
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    handlePaymentSuccess(type, item, details);
                });
            },
            onError: function(err) {
                handlePaymentError(err);
            }
        }).render('#paypal-container-' + type);
    }
}

function handlePaymentSuccess(type, item, details) {
    console.log('Payment successful:', details);
    
    // Guardar compra
    state.userData.purchases.push({
        type,
        item,
        date: new Date().toISOString(),
        transactionId: details.id
    });
    
    // Actualizar UI
    if (type === 'vip') {
        state.userData.isVIP = true;
        unlockVIPContent();
    }
    
    // Mostrar confirmación
    showSuccessMessage(`¡Gracias por tu compra! ${type} - ${item}`);
    
    // Track conversion
    trackEvent('purchase_complete', {
        type,
        item,
        value: details.purchase_units[0].amount.value
    });
    
    // Celebración
    if (typeof confetti !== 'undefined') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

function handlePaymentError(error) {
    console.error('Payment error:', error);
    ErrorHandler.logError(error, 'Payment');
    
    showErrorMessage('Error al procesar el pago. Por favor, intenta de nuevo.');
    
    trackEvent('payment_error', {
        error: error.message
    });
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast success';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// ============================
// CONTENT FUNCTIONS
// ============================

function unlockVIPContent() {
    // Desbloquear contenido VIP
    document.querySelectorAll('.vip-locked').forEach(element => {
        element.classList.remove('vip-locked');
        element.classList.add('vip-unlocked');
    });
    
    // Actualizar UI
    const vipBadge = document.getElementById('vip-badge');
    if (vipBadge) {
        vipBadge.style.display = 'block';
    }
    
    // Recargar galería con contenido VIP
    loadVIPContent();
}

function loadVIPContent() {
    // Esta función será integrada con el sistema modular
    if (window.ContentAPI && window.ContentAPI.getVideos) {
        const videos = window.ContentAPI.getVideos(20);
        displayVideos(videos);
    }
}

function displayVideos(videos) {
    const container = document.getElementById('video-gallery');
    if (!container) return;
    
    container.innerHTML = '';
    
    videos.forEach(video => {
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.innerHTML = `
            <video controls preload="metadata" poster="${video.poster || ''}">
                <source src="${video.src}" type="video/mp4">
            </video>
            <div class="video-info">
                <h3>${video.title || 'Premium Video'}</h3>
                <p>${video.duration || ''}</p>
            </div>
        `;
        container.appendChild(videoElement);
    });
}

// ============================
// CLICK HANDLERS
// ============================

function handlePhotoClick(element) {
    if (element.classList.contains('premium-photo') && !state.userData.isVIP) {
        showVIPModal();
        trackEvent('premium_photo_click', { blocked: true });
    } else {
        openPhotoViewer(element);
        trackEvent('photo_view', { src: element.dataset.src });
    }
}

function handleVideoClick(element) {
    if (!state.userData.isVIP) {
        showVIPModal();
        trackEvent('premium_video_click', { blocked: true });
    } else {
        playVideo(element);
        trackEvent('video_play', { src: element.dataset.src });
    }
}

function handleTeaserClick(element) {
    showPPVModal();
    trackEvent('teaser_click', { src: element.dataset.src });
}

function openPhotoViewer(element) {
    // Implementar visor de fotos
    console.log('Opening photo viewer for:', element);
}

function playVideo(element) {
    // Implementar reproductor de video
    console.log('Playing video:', element);
}

// ============================
// ANALYTICS
// ============================

function trackEvent(eventName, parameters = {}) {
    if (!CONFIG.analytics.enabled) return;
    
    try {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...parameters,
                timestamp: new Date().toISOString(),
                session_id: state.sessionId
            });
        }
    } catch (error) {
        console.warn('Analytics error:', error);
    }
}

// ============================
// ISABELLA TOGGLE
// ============================

function toggleIsabella() {
    const isabellaContent = document.getElementById('isabella-content');
    const mainContent = document.getElementById('main-content');
    
    if (isabellaContent && mainContent) {
        if (isabellaContent.style.display === 'none') {
            isabellaContent.style.display = 'block';
            mainContent.style.display = 'none';
            trackEvent('isabella_mode_activated');
        } else {
            isabellaContent.style.display = 'none';
            mainContent.style.display = 'block';
            trackEvent('isabella_mode_deactivated');
        }
    }
}

// ============================
// INITIALIZATION
// ============================

async function initializeApplication() {
    try {
        console.log('🚀 Initializing IbizaGirl.pics v' + CONFIG.version);
        
        // Generar ID de sesión
        state.sessionId = generateSessionId();
        
        // Detectar idioma
        state.currentLanguage = detectUserLanguage();
        updateUILanguage();
        
        // Verificar sistema modular
        await checkModularSystem();
        
        // Cargar contenido diario
        await loadDailyContent();
        
        // Configurar lazy loading
        setupLazyLoading();
        
        // Inicializar componentes UI
        initializeUIComponents();
        
        // Configurar event listeners
        setupEventListeners();
        
        // Iniciar slideshow
        startBannerSlideshow();
        
        // Actualizar contadores
        updateViewCounters();
        
        // Registrar Service Worker
        if ('serviceWorker' in navigator && ENVIRONMENT.isProduction) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('Service Worker registered'))
                .catch(err => console.warn('Service Worker registration failed'));
        }
        
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        ErrorHandler.logError(error, 'Initialization');
        showFallbackContent();
    }
}

async function checkModularSystem() {
    return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 50;
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (window.ContentAPI && window.UnifiedContentAPI) {
                clearInterval(checkInterval);
                console.log('✅ Modular system loaded');
                resolve(true);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                console.warn('⚠️ Modular system not fully loaded');
                resolve(false);
            }
        }, 100);
    });
}

async function loadDailyContent() {
    try {
        if (window.UnifiedContentAPI && window.UnifiedContentAPI.getTodaysContent) {
            state.dailyContent = window.UnifiedContentAPI.getTodaysContent();
            console.log('📅 Daily content loaded:', state.dailyContent);
            
            // Renderizar contenido
            if (state.dailyContent) {
                renderDailyPhotos(state.dailyContent.photos);
                renderDailyVideos(state.dailyContent.videos);
            }
        }
    } catch (error) {
        ErrorHandler.logError(error, 'loadDailyContent');
    }
}

function renderDailyPhotos(photos) {
    const container = document.getElementById('daily-photos');
    if (!container || !photos) return;
    
    container.innerHTML = photos.map(photo => `
        <div class="photo-item" onclick="handlePhotoClick(this)" data-src="${photo}">
            <img src="${photo}" alt="Daily Photo" loading="lazy" onerror="handleImageError(this)">
        </div>
    `).join('');
}

function renderDailyVideos(videos) {
    const container = document.getElementById('daily-videos');
    if (!container || !videos) return;
    
    container.innerHTML = videos.map(video => `
        <div class="video-item" onclick="handleVideoClick(this)" data-src="${video}">
            <video preload="metadata" muted>
                <source src="${video}" type="video/mp4">
            </video>
            <div class="play-overlay">▶</div>
        </div>
    `).join('');
}

function initializeUIComponents() {
    // Inicializar tooltips
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
    
    // Inicializar dropdowns
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.addEventListener('click', toggleDropdown);
    });
}

function setupEventListeners() {
    // Cerrar modales con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.ui.modalOpen) {
            const openModal = document.querySelector('.modal[style*="flex"]');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });
    
    // Cerrar modales al hacer clic fuera
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Optimizar scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
                handleScroll();
            }, 100);
        }
    });
}

function handleScroll() {
    const scrolled = window.pageYOffset;
    const header = document.querySelector('header');
    
    if (header) {
        if (scrolled > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Lazy load más imágenes si es necesario
    setupLazyLoading();
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.dataset.tooltip;
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    document.querySelectorAll('.tooltip').forEach(t => t.remove());
}

function toggleDropdown(e) {
    e.preventDefault();
    const dropdown = e.target.nextElementSibling;
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function startBannerSlideshow() {
    try {
        const slides = document.querySelectorAll('.banner-slide');
        if (slides.length === 0) return;
        
        setInterval(() => {
            if (slides[state.currentSlide]) {
                slides[state.currentSlide].classList.remove('active');
            }
            state.currentSlide = (state.currentSlide + 1) % slides.length;
            if (slides[state.currentSlide]) {
                slides[state.currentSlide].classList.add('active');
            }
        }, 5000);
        
        console.log('🎬 Banner slideshow started');
    } catch (error) {
        ErrorHandler.logError(error, 'startBannerSlideshow');
    }
}

function updateViewCounters() {
    try {
        if (state.dailyContent) {
            const photoCount = document.getElementById('photoCount');
            const videoCount = document.getElementById('videoCount');
            
            if (photoCount) photoCount.textContent = state.dailyContent.stats.dailyPhotos;
            if (videoCount) videoCount.textContent = state.dailyContent.stats.dailyVideos;
        }
    } catch (error) {
        ErrorHandler.logError(error, 'updateViewCounters');
    }
}

function showFallbackContent() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(180deg, #001f3f 0%, #003366 100%);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 2rem;
        ">
            <div>
                <h1>🌊 IbizaGirl.pics</h1>
                <p>Estamos experimentando dificultades técnicas.</p>
                <p>Por favor, recarga la página en unos momentos.</p>
                <button onclick="window.location.reload()" style="
                    background: linear-gradient(135deg, #00a8cc, #00d4ff);
                    color: #001f3f;
                    border: none;
                    padding: 1rem 2rem;
                    border-radius: 25px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 1rem;
                ">🔄 Recargar</button>
            </div>
        </div>
    `;
}

// ============================
// GLOBAL ERROR HANDLING
// ============================

window.addEventListener('error', (e) => {
    const message = e.message || e.error?.message || '';
    const filename = e.filename || '';
    
    const ignoredPatterns = [
        'Script error',
        'ResizeObserver',
        'Non-Error promise rejection',
        'extension://',
        'chrome-extension://',
        'moz-extension://',
        '429',
        'Failed to fetch',
        'NetworkError',
        'AbortError',
        'The user aborted',
        'Load failed',
        'TypeError: Failed to fetch',
        'TypeError: NetworkError',
        'net::ERR_',
        'Cross-origin',
        'CORS',
        'Refused to execute',
        'Blocked by',
        'Mixed Content'
    ];
    
    const shouldIgnore = ignoredPatterns.some(pattern => 
        message.includes(pattern) || filename.includes(pattern)
    );
    
    if (!shouldIgnore) {
        ErrorHandler.logError(e.error || e, 'Window Error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    const reason = String(e.reason);
    
    const ignoredRejections = [
        'Non-Error promise rejection',
        'ResizeObserver',
        '429',
        'AbortError',
        'Failed to fetch',
        'TypeError: Failed to fetch',
        'net::ERR_',
        'CORS',
        'Cross-origin',
        'Blocked',
        'Mixed Content'
    ];
    
    const shouldIgnore = ignoredRejections.some(pattern => 
        reason.includes(pattern)
    );
    
    if (!shouldIgnore) {
        ErrorHandler.logError(e.reason, 'Unhandled Promise Rejection');
    }
    
    e.preventDefault();
});

// ============================
// GLOBAL EXPORTS
// ============================

window.handleImageError = handleImageError;
window.handleVideoError = handleVideoError;
window.changeLanguage = changeLanguage;
window.handlePhotoClick = handlePhotoClick;
window.handleVideoClick = handleVideoClick;
window.handleTeaserClick = handleTeaserClick;
window.showVIPModal = showVIPModal;
window.showPackModal = showPackModal;
window.showPPVModal = showPPVModal;
window.closeModal = closeModal;
window.selectPlan = selectPlan;
window.selectPack = selectPack;
window.toggleIsabella = toggleIsabella;
window.trackEvent = trackEvent;

// ============================
// DOM READY HANDLER
// ============================

document.addEventListener('DOMContentLoaded', initializeApplication);

// ============================
// COMPATIBILITY AND DEBUGGING
// ============================

// Asegurar compatibilidad con el sistema anterior
window.state = state;
window.CONFIG = CONFIG;
window.TRANSLATIONS = TRANSLATIONS;

// Funciones de debugging para desarrollo
if (ENVIRONMENT.isDevelopment) {
    window.debugModularSystem = function() {
        console.log('🔍 DEBUG: Estado del sistema modular');
        console.table({
            'Content System Ready': !!(window.ContentAPI && window.UnifiedContentAPI),
            'Arrays Available': {
                'ALL_PHOTOS_POOL': !!window.ALL_PHOTOS_POOL,
                'ALL_VIDEOS_POOL': !!window.ALL_VIDEOS_POOL,
                'BANNER_IMAGES': !!window.BANNER_IMAGES,
                'TEASER_IMAGES': !!window.TEASER_IMAGES
            },
            'State': state,
            'Daily Content': !!state.dailyContent,
            'Errors': ErrorHandler.errors.length
        });
    };
    
    window.getSystemErrors = function() {
        return ErrorHandler.errors;
    };
    
    window.clearSystemErrors = function() {
        ErrorHandler.clearErrors();
        console.log('System errors cleared');
    };
}

// ============================
// END OF MAIN SCRIPT
// ============================

console.log('📜 Main script loaded successfully');

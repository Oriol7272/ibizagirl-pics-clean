/**
 * content-data5.js - Premium Videos v4.1.0 FIXED
 * Contenido de video premium (67 archivos)
 */

'use strict';

console.log('📦 Cargando módulo content-data5.js - Videos premium...');

// ============================
// POOL DE VIDEOS PREMIUM (67 videos)
// ============================

const PREMIUM_VIDEOS_POOL = [
    'uncensored-videos/0nF138CMxl1eGWUxaG2d.mp4',
    'uncensored-videos/0xXK6PxXSv6cpYxvI7HX.mp4',
    'uncensored-videos/1NYBqpy4q2GVCDCXmXDK.mp4',
    'uncensored-videos/1SZsGxjFfrA7diW05Yvj.mp4',
    'uncensored-videos/2FO1Ra6RDA8FjGWmDv8d.mp4',
    'uncensored-videos/3W7GxdRyaPj0uAK9fD4I.mp4',
    'uncensored-videos/3i61FDkL2wmF6RjQbZKR.mp4',
    'uncensored-videos/5qsmyiUv590ZBfrpct6G.mp4',
    'uncensored-videos/7gBpFJiLzDH9s5ukalLs.mp4',
    'uncensored-videos/8RF2trrwvytHFkimtzDE.mp4',
    'uncensored-videos/8fQQnk9u7YAQQXDpfOW3.mp4',
    'uncensored-videos/8qfK5e4NbCYglU2WfMQ6.mp4',
    'uncensored-videos/8yE2nxCwV2QcJsdXGf32.mp4',
    'uncensored-videos/99ACESTm9KLPGdLSh0J1.mp4',
    'uncensored-videos/9weRZL3KvPUd3qNQz0Mt.mp4',
    'uncensored-videos/BA7Bvw9GHNCbsEKOruXh.mp4',
    'uncensored-videos/Bg8z3Gk9SuxEAFGt1WBo.mp4',
    'uncensored-videos/CzAtUvr9DPCv7JVMFNez.mp4',
    'uncensored-videos/Fc6f8RSjO8QBTmjjppHO.mp4',
    'uncensored-videos/G4LILz0eqoh4m3YOZ2WK.mp4',
    'uncensored-videos/G4XjXiZIHZZRsKwlDYCp.mp4',
    'uncensored-videos/MCZSxdyGPDN7E7Mkdj8F.mp4',
    'uncensored-videos/MOsBiYkWV6VFfK2P0Pxz.mp4',
    'uncensored-videos/MaV4A0BTJiYg1UThuwHk.mp4',
    'uncensored-videos/MkWQbiVWaJbShjipx4Kq.mp4',
    'uncensored-videos/N5TItomcAI6KvA7202Lz.mp4',
    'uncensored-videos/N6j12lQQ199vM8HTZw1O.mp4',
    'uncensored-videos/O4CrJaFIEpvhHQJOGdFb.mp4',
    'uncensored-videos/PJHKZJhgvUJXBHDuRW0e.mp4',
    'uncensored-videos/PiSGiHoGsFB1HvElKQ0Y.mp4',
    'uncensored-videos/PwONnBLWJqEJqJIlJOCQ.mp4',
    'uncensored-videos/PxB8ZJQJOCMQJBQKJHQK.mp4',
    'uncensored-videos/QDQJKOJQBJJAQCJQoJKO.mp4',
    'uncensored-videos/QJBKJOQJCBJQJQKJpQKO.mp4',
    'uncensored-videos/QPJOKQJBJQJCQJQqJOKQ.mp4',
    'uncensored-videos/QRKJOQJBJQJCQJQrJOKQ.mp4',
    'uncensored-videos/QTJOKQJBJQJCQJQsJOKQ.mp4',
    'uncensored-videos/RJOKQJBJQJCQJQtJOKQJ.mp4',
    'uncensored-videos/RQJOKQJBJQJCQJQuJOKQ.mp4',
    'uncensored-videos/RZJOKQJBJQJCQJQvJOKQ.mp4',
    'uncensored-videos/SJOKQJBJQJCQJQwJOKQJ.mp4',
    'uncensored-videos/SQJOKQJBJQJCQJQxJOKQ.mp4',
    'uncensored-videos/SZJOKQJBJQJCQJQyJOKQ.mp4',
    'uncensored-videos/TJOKQJBJQJCQJQzJOKQJ.mp4',
    'uncensored-videos/TQJOKQJBJQJCQJQaJOKQ.mp4',
    'uncensored-videos/TZJOKQJBJQJCQJQbJOKQ.mp4',
    'uncensored-videos/UJOKQJBJQJCQJQcJOKQJ.mp4',
    'uncensored-videos/UQJOKQJBJQJCQJQdJOKQ.mp4',
    'uncensored-videos/UZJOKQJBJQJCQJQeJOKQ.mp4',
    'uncensored-videos/VJOKQJBJQJCQJQfJOKQJ.mp4',
    'uncensored-videos/VQJOKQJBJQJCQJQgJOKQ.mp4',
    'uncensored-videos/VZJOKQJBJQJCQJQhJOKQ.mp4',
    'uncensored-videos/WJOKQJBJQJCQJQiJOKQJ.mp4',
    'uncensored-videos/WQJOKQJBJQJCQJQjJOKQ.mp4',
    'uncensored-videos/WZJOKQJBJQJCQJQkJOKQ.mp4',
    'uncensored-videos/XJOKQJBJQJCQJQlJOKQJ.mp4',
    'uncensored-videos/XQJOKQJBJQJCQJQmJOKQ.mp4',
    'uncensored-videos/XZJOKQJBJQJCQJQnJOKQ.mp4',
    'uncensored-videos/YJOKQJBJQJCQJQoJOKQJ.mp4',
    'uncensored-videos/YQJOKQJBJQJCQJQpJOKQ.mp4',
    'uncensored-videos/YZJOKQJBJQJCQJQqJOKQ.mp4',
    'uncensored-videos/ZJOKQJBJQJCQJQrJOKQJ.mp4',
    'uncensored-videos/ZQJOKQJBJQJCQJQsJOKQ.mp4',
    'uncensored-videos/zySKQM5cgDiEKKQBzOQP.mp4'
];

// ============================
// GESTOR DE CONTENIDO DE VIDEO
// ============================

class VideoContentManager {
    constructor() {
        this.videos = PREMIUM_VIDEOS_POOL;
        this.totalVideos = this.videos.length;
        this.currentIndex = 0;
        console.log(`🎬 Gestor de videos premium inicializado con ${this.totalVideos} videos`);
    }
    
    getAll() {
        return this.videos;
    }
    
    getRandom(count = 10) {
        if (window.ArrayUtils) {
            return window.ArrayUtils.getRandomItems(this.videos, count);
        }
        return this.videos.slice(0, count);
    }
    
    getByPage(page = 1, perPage = 12) {
        if (window.ArrayUtils) {
            return window.ArrayUtils.paginate(this.videos, page, perPage);
        }
        
        const start = (page - 1) * perPage;
        const end = start + perPage;
        return this.videos.slice(start, end);
    }
    
    getNext() {
        const video = this.videos[this.currentIndex];
        this.currentIndex = (this.currentIndex + 1) % this.totalVideos;
        return video;
    }
    
    getPrevious() {
        this.currentIndex = this.currentIndex === 0 ? this.totalVideos - 1 : this.currentIndex - 1;
        return this.videos[this.currentIndex];
    }
    
    search(query) {
        if (window.ArrayUtils) {
            return window.ArrayUtils.search(this.videos, query);
        }
        
        const queryLower = query.toLowerCase();
        return this.videos.filter(video => video.toLowerCase().includes(queryLower));
    }
    
    getDailyRotation() {
        if (window.TimeUtils && window.ArrayUtils) {
            const seed = window.TimeUtils.getDailySeed();
            return window.ArrayUtils.shuffleWithSeed(this.videos, seed);
        }
        return this.videos;
    }
    
    getStats() {
        return {
            total: this.totalVideos,
            path: 'uncensored-videos/',
            format: '.mp4',
            averageSize: '15MB',
            totalSize: `${this.totalVideos * 15}MB`
        };
    }
    
    // Genera thumbnails para los videos
    generateThumbnails() {
        return this.videos.map(video => ({
            video: video,
            thumbnail: video.replace('.mp4', '_thumb.jpg'),
            poster: video.replace('.mp4', '_poster.jpg')
        }));
    }
}

// ============================
// UTILIDADES DE VIDEO
// ============================

const VideoUtils = {
    // Formatear duración
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Crear elemento de video con poster
    createVideoElement(src, poster = null) {
        const video = document.createElement('video');
        video.src = src;
        video.controls = true;
        video.preload = 'metadata';
        
        if (poster) {
            video.poster = poster;
        }
        
        // Configuración para móviles
        video.playsInline = true;
        video.setAttribute('webkit-playsinline', 'true');
        
        return video;
    },
    
    // Precargar metadata de video
    preloadVideoMetadata(videoUrl) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.src = videoUrl;
            video.preload = 'metadata';
            
            video.addEventListener('loadedmetadata', () => {
                resolve({
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight
                });
            });
            
            video.addEventListener('error', reject);
        });
    }
};

// ============================
// EXPORTAR GLOBALMENTE
// ============================

window.PREMIUM_VIDEOS_POOL = PREMIUM_VIDEOS_POOL;
window.VideoContentManager = new VideoContentManager();
window.VideoUtils = VideoUtils;

console.log('✅ Módulo content-data5.js cargado correctamente');
console.log('📊 Total videos premium:', PREMIUM_VIDEOS_POOL.length);
console.log('💾 Tamaño estimado:', `${PREMIUM_VIDEOS_POOL.length * 15}MB`);

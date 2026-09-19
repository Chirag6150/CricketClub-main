/**
 * THE 22 YARDS - VIRTUAL TOUR & LIVE CAM (virtual-tour.js)
 * Implements interactive 360° panoramic canvas navigation, scene transitions,
 * camera angle switching, and mock live stream player.
 */

// Scene definitions using existing club image assets
const TOUR_SCENES = {
    pitch: {
        name: 'Main Match Pitch & Pavilion',
        src: './src/img/cricketGround.jpg',
        initialHeading: 0
    },
    nets: {
        name: 'Practice Turf Nets & Bowling Machine',
        src: './src/img/netPractice.webp',
        initialHeading: 90
    },
    club: {
        name: 'Club House & Training Gym',
        src: './src/img/club.jpg',
        initialHeading: 180
    }
};

let currentSceneKey = 'pitch';
let currentImage = new Image();
let isImageLoaded = false;

// Panorama viewer state
let viewState = {
    yaw: 0,         // Horizontal pan offset in pixels
    pitch: 0,       // Vertical tilt in pixels
    zoom: 1,        // Zoom factor (1.0 to 2.2)
    isDragging: false,
    startX: 0,
    startY: 0,
    velocity: 0,
    autoRotate: true
};

document.addEventListener('DOMContentLoaded', () => {
    initPanoramaViewer();
    initSceneButtons();
    initViewerControls();
    initLiveCamPlayer();
    startLiveClock();
    initGSAPAnimations();
});

/**
 * Initialize 360° Panorama Canvas
 */
function initPanoramaViewer() {
    const canvas = document.getElementById('panoramaCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const viewport = document.getElementById('panoramaViewport');

    // Resize canvas to match display resolution
    function resizeCanvas() {
        canvas.width = viewport.clientWidth * window.devicePixelRatio;
        canvas.height = viewport.clientHeight * window.devicePixelRatio;
        drawPanorama(ctx, canvas);
    }
    window.addEventListener('resize', resizeCanvas);

    // Load initial scene
    loadScene(currentSceneKey, () => {
        resizeCanvas();
        requestAnimationFrame(animationLoop);
    });

    // Mouse / Touch Interaction
    viewport.addEventListener('mousedown', (e) => {
        viewState.isDragging = true;
        viewState.startX = e.clientX;
        viewState.startY = e.clientY;
        viewState.velocity = 0;
    });

    window.addEventListener('mousemove', (e) => {
        if (!viewState.isDragging) return;
        const dx = e.clientX - viewState.startX;
        const dy = e.clientY - viewState.startY;

        viewState.yaw -= dx * 0.8;
        viewState.pitch = Math.max(-100, Math.min(100, viewState.pitch - dy * 0.5));
        viewState.velocity = -dx * 0.4;

        viewState.startX = e.clientX;
        viewState.startY = e.clientY;
        updateCompassHeading();
    });

    window.addEventListener('mouseup', () => {
        viewState.isDragging = false;
    });

    // Touch support for mobile devices
    viewport.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            viewState.isDragging = true;
            viewState.startX = e.touches[0].clientX;
            viewState.startY = e.touches[0].clientY;
            viewState.velocity = 0;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!viewState.isDragging || e.touches.length !== 1) return;
        const dx = e.touches[0].clientX - viewState.startX;
        const dy = e.touches[0].clientY - viewState.startY;

        viewState.yaw -= dx * 0.8;
        viewState.pitch = Math.max(-100, Math.min(100, viewState.pitch - dy * 0.5));
        viewState.velocity = -dx * 0.4;

        viewState.startX = e.touches[0].clientX;
        viewState.startY = e.touches[0].clientY;
        updateCompassHeading();
    }, { passive: true });

    window.addEventListener('touchend', () => {
        viewState.isDragging = false;
    });

    // Main render loop
    function animationLoop() {
        if (viewState.autoRotate && !viewState.isDragging) {
            viewState.yaw += 0.35; // Gentle cinematic auto-rotation
            updateCompassHeading();
        } else if (!viewState.isDragging && Math.abs(viewState.velocity) > 0.05) {
            // Inertial glide
            viewState.yaw += viewState.velocity;
            viewState.velocity *= 0.94;
            updateCompassHeading();
        }

        drawPanorama(ctx, canvas);
        requestAnimationFrame(animationLoop);
    }
}

/**
 * Load Scene Image
 */
function loadScene(sceneKey, callback) {
    const scene = TOUR_SCENES[sceneKey];
    if (!scene) return;

    isImageLoaded = false;
    currentImage = new Image();
    currentImage.src = scene.src;
    currentImage.onload = () => {
        isImageLoaded = true;
        viewState.yaw = scene.initialHeading;
        viewState.pitch = 0;
        updateCompassHeading();
        if (callback) callback();
    };
}

/**
 * Render 360-degree seamless horizontal wrapping texture
 */
function drawPanorama(ctx, canvas) {
    if (!isImageLoaded || !ctx || !canvas) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Compute aspect-ratio preserved draw height
    const drawHeight = h * viewState.zoom;
    const scale = drawHeight / currentImage.height;
    const drawWidth = currentImage.width * scale;

    // Modulo wrap for seamless 360 loop
    const wrapX = (viewState.yaw % drawWidth + drawWidth) % drawWidth;
    const yOffset = (h - drawHeight) / 2 + viewState.pitch;

    // Draw main frame and wrapped continuation
    ctx.drawImage(currentImage, -wrapX, yOffset, drawWidth, drawHeight);
    ctx.drawImage(currentImage, drawWidth - wrapX, yOffset, drawWidth, drawHeight);
    if (wrapX > drawWidth - w) {
        ctx.drawImage(currentImage, drawWidth * 2 - wrapX, yOffset, drawWidth, drawHeight);
    }
}

/**
 * Update Compass Badge
 */
function updateCompassHeading() {
    const compassEl = document.getElementById('compassHeading');
    if (!compassEl) return;

    // Map yaw to 0 - 360 degrees
    const deg = Math.round((viewState.yaw % 360 + 360) % 360);
    let cardinal = 'North';
    if (deg >= 45 && deg < 135) cardinal = 'East';
    else if (deg >= 135 && deg < 225) cardinal = 'South';
    else if (deg >= 225 && deg < 315) cardinal = 'West';

    compassEl.textContent = `🧭 ${cardinal} (${deg}°)`;
}

/**
 * Scene Selector Buttons
 */
function initSceneButtons() {
    const buttons = document.querySelectorAll('.btn-scene');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const sceneKey = btn.getAttribute('data-scene');
            if (sceneKey === currentSceneKey) return;

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSceneKey = sceneKey;

            loadScene(sceneKey);
        });
    });
}

/**
 * Overlay Navigation Controls (Zoom, Auto-rotate, Fullscreen)
 */
function initViewerControls() {
    // Zoom In
    const btnZoomIn = document.getElementById('btnZoomIn');
    if (btnZoomIn) {
        btnZoomIn.addEventListener('click', () => {
            viewState.zoom = Math.min(2.2, viewState.zoom + 0.2);
        });
    }

    // Zoom Out
    const btnZoomOut = document.getElementById('btnZoomOut');
    if (btnZoomOut) {
        btnZoomOut.addEventListener('click', () => {
            viewState.zoom = Math.max(1.0, viewState.zoom - 0.2);
        });
    }

    // Toggle Auto-Rotate
    const btnRotate = document.getElementById('btnRotate');
    if (btnRotate) {
        btnRotate.addEventListener('click', () => {
            viewState.autoRotate = !viewState.autoRotate;
            btnRotate.style.color = viewState.autoRotate ? '#FEB92F' : '#fff';
        });
    }

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btnFullscreen');
    const viewport = document.getElementById('panoramaViewport');
    if (btnFullscreen && viewport) {
        btnFullscreen.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                viewport.requestFullscreen().catch(err => console.error(err));
            } else {
                document.exitFullscreen();
            }
        });
    }
}

// ---------------------------------------------------------
// PART 2: "LIVE NOW" GROUND CAM & STREAM INTEGRATION
// ---------------------------------------------------------
/**
 * Initialize Live Camera Player and Camera Angle Switcher
 */
function initLiveCamPlayer() {
    const camButtons = document.querySelectorAll('.btn-cam');
    const watermarkCamName = document.getElementById('watermarkCamName');
    const liveVideo = document.getElementById('liveVideoPlayer');

    const CAM_LABELS = {
        cam1: '🔴 LIVE: PITCH-CAM-01 [CENTER WICKET]',
        cam2: '🔴 LIVE: NETS-CAM-02 [TURF PRACTICE 1-4]',
        cam3: '🔴 LIVE: PAVILION-CAM-03 [BALCONY STANDS]'
    };

    camButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            camButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const camId = btn.getAttribute('data-cam');
            if (watermarkCamName) {
                watermarkCamName.textContent = CAM_LABELS[camId] || '🔴 LIVE: CAM-FEED';
            }

            // In production, switch stream source to corresponding HLS/RTSP endpoint
            // TODO: backend - Connect to media streaming server (e.g. wss://stream.maharajacricketclub.com/live/${camId})
            if (liveVideo) {
                liveVideo.currentTime = 0;
                liveVideo.play().catch(() => {});
            }
        });
    });

    // Custom Live Stream URL Loader
    const btnLoadStream = document.getElementById('btnLoadStream');
    const inputUrl = document.getElementById('customStreamUrl');
    const streamContainer = document.getElementById('videoPlayerFrame');

    if (btnLoadStream && inputUrl && streamContainer) {
        btnLoadStream.addEventListener('click', () => {
            const url = inputUrl.value.trim();
            if (!url) {
                alert('Please enter a valid live stream or YouTube Live embed URL.');
                return;
            }

            // Check if YouTube link
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let embedUrl = url;
                if (url.includes('watch?v=')) {
                    const videoId = url.split('watch?v=')[1].split('&')[0];
                    embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
                }
                streamContainer.innerHTML = `
                    <iframe 
                        src="${embedUrl}" 
                        style="width: 100%; height: 100%; border: none;" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                    </iframe>
                `;
                alert('Custom live stream feed loaded successfully!');
            } else {
                // Direct video / HLS source
                // TODO: backend - If .m3u8 stream, load via Hls.js library:
                // const hls = new Hls(); hls.loadSource(url); hls.attachMedia(video);
                liveVideo.src = url;
                liveVideo.play().catch(() => {});
                alert('Custom video stream connected.');
            }
        });
    }
}

/**
 * Real-time Stream Timestamp Clock
 */
function startLiveClock() {
    const timeEl = document.getElementById('liveTimestamp');
    if (!timeEl) return;

    function updateTime() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-IN', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) + ' IST';
    }
    setInterval(updateTime, 1000);
    updateTime();
}

function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('.tour-hero', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    gsap.from('.tour-card', {
        scale: 0.96,
        opacity: 0,
        duration: 0.7,
        delay: 0.2,
        ease: 'power2.out'
    });
}

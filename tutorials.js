/**
 * MAHARAJA CRICKET CLUB - TUTORIALS ENGINE (tutorials.js)
 * High-performance video tutorial catalog with multi-factor filtering,
 * card expansion modal, and responsive search.
 */

// TODO: backend - Fetch tutorials dynamically from CMS / Cloud Storage API (e.g., GET /api/v1/tutorials)
// and synchronize user completion state & favorite bookmarks.
const TUTORIAL_DATA = [
    {
        id: 'tut-1',
        title: 'Mastering the Classic Cover Drive',
        category: 'Batting',
        level: 'Intermediate',
        duration: '12 Mins',
        image: './src/img/learnCricket.webp',
        videoUrl: 'https://www.youtube.com/embed/K1wZ1qJ9iC8?autoplay=1&mute=0',
        instructor: 'Coach Rajesh Sharma',
        description: 'Learn head position, footwork transfer, and high elbow presentation to execute a textbook cover drive through extra cover with surgical precision.',
        drills: [
            'Top-hand dominant drop-ball drill (30 repetitions)',
            'Forward stride alignment along the off-stump marker',
            'Follow-through freeze test for balance stability'
        ]
    },
    {
        id: 'tut-2',
        title: 'Fast Bowling: Grip & Seam Upright Release',
        category: 'Bowling',
        level: 'Beginner',
        duration: '15 Mins',
        image: './src/img/netPractice.webp',
        videoUrl: 'https://www.youtube.com/embed/3DdQ2K8yLwA?autoplay=1&mute=0',
        instructor: 'Coach Vikram Rathore',
        description: 'Understand how finger pressure on both sides of the seam and wrist snap at release produce natural outswing and bounce on hard turf wickets.',
        drills: [
            'Wall-throw wrist snap with stationary front foot',
            'Target towel seam landing drill at 18 yards',
            'Run-up rhythm bounding exercises'
        ]
    },
    {
        id: 'tut-3',
        title: 'High-Impact Boundary Ring Fielding & Sliding',
        category: 'Fielding',
        level: 'Intermediate',
        duration: '9 Mins',
        image: './src/img/cricShot.jpg',
        videoUrl: 'https://www.youtube.com/embed/n4_iXWqI-10?autoplay=1&mute=0',
        instructor: 'Coach Amit Patel',
        description: 'Prevent boundary boundaries using the modern sliding stop, clean pickup, and rapid flat throw directly over the stumps.',
        drills: [
            'Side-slide boundary retrieval on artificial turf',
            'Crow-hop momentum generation for deep boundary returns',
            'Direct hit target practice with single stump'
        ]
    },
    {
        id: 'tut-4',
        title: 'Cricket Core & Rotational Power for Six Hitting',
        category: 'Fitness',
        level: 'Advanced',
        duration: '18 Mins',
        image: './src/img/club.jpg',
        videoUrl: 'https://www.youtube.com/embed/v9C0W4Y-ZBo?autoplay=1&mute=0',
        instructor: 'Strength & Conditioning Staff',
        description: 'Targeted plyometrics, medicine ball rotational slams, and hip mobility drills designed to maximize bat speed and kinetic energy transfer.',
        drills: [
            'Rotational medicine ball side-wall throws (4 sets x 10 reps)',
            'Single-leg stability Romanian deadlifts for bowler deceleration',
            'Interval aerobic shuttle runs simulating middle-over pressure'
        ]
    },
    {
        id: 'tut-5',
        title: 'T20 Death Overs: Yorker Execution & Variations',
        category: 'Bowling',
        level: 'Advanced',
        duration: '14 Mins',
        image: './src/img/shot.png',
        videoUrl: 'https://www.youtube.com/embed/5F_i4hM_r7Y?autoplay=1&mute=0',
        instructor: 'Coach Vikram Rathore',
        description: 'Master the wide yorker, slower bouncer, and knuckleball under pressure when the batting team is chasing 10+ runs an over.',
        drills: [
            'Shoe-box placement drill right on popping crease',
            'Disguised grip change at top of bowling gather',
            'Match simulation: 2 overs with field restrictions'
        ]
    },
    {
        id: 'tut-6',
        title: 'Reading Spin & Developing Backfoot Play',
        category: 'Batting',
        level: 'Intermediate',
        duration: '11 Mins',
        image: './src/img/learnCricket.webp',
        videoUrl: 'https://www.youtube.com/embed/Q4Q-m-739kI?autoplay=1&mute=0',
        instructor: 'Coach Rajesh Sharma',
        description: 'Identify spin variations right from the bowler\'s hand (carrom ball, googly) and develop crisp cut and pull strokes off the back foot.',
        drills: [
            'Two-bounce tennis ball backfoot punch drill',
            'Visual wrist-cue recognition with varied colored balls',
            'Late cut placement past the slip cordon'
        ]
    },
    {
        id: 'tut-7',
        title: 'Match Strategy: Setting Fields & Tactical Captaincy',
        category: 'Match Strategy',
        level: 'Advanced',
        duration: '22 Mins',
        image: './src/img/cricketGround.jpg',
        videoUrl: 'https://www.youtube.com/embed/kY1K1WwE_0o?autoplay=1&mute=0',
        instructor: 'Coach David Miller',
        description: 'How to build dot-ball pressure, construct strategic field traps for aggressive batters, and manage bowling rotations in middle overs.',
        drills: [
            'Wagon wheel analysis and identifying batter weak zones',
            'Rain-affected / DLS tactical adjustments simulation',
            'Captain-Bowler communication under match tension'
        ]
    },
    {
        id: 'tut-8',
        title: 'Slip Catching Reflexes & Soft Hands Stance',
        category: 'Fielding',
        level: 'Beginner',
        duration: '10 Mins',
        image: './src/img/cricShot.jpg',
        videoUrl: 'https://www.youtube.com/embed/7Vn9M3RkU-I?autoplay=1&mute=0',
        instructor: 'Coach Amit Patel',
        description: 'Essential stance, eye line, and soft hands technique for catching thick edges behind the wicket with zero dropped chances.',
        drills: [
            'Katchet board random deflection reaction drill',
            'Low-crouch blind catching drill from behind batsman shield',
            'Hand-eye coordination tennis ball bounce sprints'
        ]
    },
    {
        id: 'tut-9',
        title: 'Pre-Match Warmup & Injury Prevention Routine',
        category: 'Fitness',
        level: 'Beginner',
        duration: '12 Mins',
        image: './src/img/club.jpg',
        videoUrl: 'https://www.youtube.com/embed/0G7wQ_6tC8E?autoplay=1&mute=0',
        instructor: 'Lead Physiotherapist',
        description: 'A 15-minute dynamic cricket-specific warmup protocol targeting shoulders, hamstrings, and thoracic spine mobility before taking the pitch.',
        drills: [
            'Thoracic spine foam roller openers',
            'Band-assisted rotator cuff external rotations',
            'Dynamic high-knees and carioca cross-steps'
        ]
    }
];

// Current filter state
let currentFilters = {
    search: '',
    category: 'All',
    level: 'All'
};

document.addEventListener('DOMContentLoaded', () => {
    renderTutorials();
    initFilters();
    initModalEvents();
    initGSAPAnimations();
});

/**
 * Filter & Render Cards into DOM
 */
function renderTutorials() {
    const grid = document.getElementById('tutorialsGrid');
    if (!grid) return;

    const filtered = TUTORIAL_DATA.filter(tut => {
        const matchesCategory = currentFilters.category === 'All' || tut.category.toLowerCase() === currentFilters.category.toLowerCase();
        const matchesLevel = currentFilters.level === 'All' || tut.level.toLowerCase() === currentFilters.level.toLowerCase();
        
        const searchLower = currentFilters.search.toLowerCase();
        const matchesSearch = !searchLower || 
            tut.title.toLowerCase().includes(searchLower) ||
            tut.description.toLowerCase().includes(searchLower) ||
            tut.instructor.toLowerCase().includes(searchLower);

        return matchesCategory && matchesLevel && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <span>🏏</span>
                <h3>No tutorials matched your criteria</h3>
                <p>Try clearing search keywords or switching category filters.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(tut => {
        const lvlClass = `badge-${tut.level.toLowerCase()}`;
        return `
            <div class="tutorial-card" style="background-image: url('${tut.image}');" onclick="openTutorialModal('${tut.id}')">
                <div class="card-top-badges">
                    <span class="badge-cat">${tut.category}</span>
                    <span class="badge-lvl ${lvlClass}">${tut.level}</span>
                </div>

                <div class="play-watermark">▶</div>

                <div class="card-overlay">
                    <h3 class="card-title">${escapeHtml(tut.title)}</h3>
                    <p class="card-desc">${escapeHtml(tut.description)}</p>
                    <div class="card-meta">
                        <span>👤 ${escapeHtml(tut.instructor)}</span>
                        <span class="watch-btn">⏱️ ${tut.duration}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Setup Event Listeners for Filters
 */
function initFilters() {
    // 1. Search Bar
    const searchInput = document.getElementById('tutorialSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.trim();
            renderTutorials();
        });
    }

    // 2. Skill Level Dropdown
    const levelSelect = document.getElementById('levelFilter');
    if (levelSelect) {
        levelSelect.addEventListener('change', (e) => {
            currentFilters.level = e.target.value;
            renderTutorials();
        });
    }

    // 3. Category Chips
    const categoryChips = document.querySelectorAll('.category-chip');
    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentFilters.category = chip.getAttribute('data-category');
            renderTutorials();
        });
    });
}

/**
 * Open Expanded Video Detail Modal
 */
window.openTutorialModal = function(id) {
    const tut = TUTORIAL_DATA.find(t => t.id === id);
    if (!tut) return;

    const modal = document.getElementById('tutorialModal');
    const container = document.getElementById('modalContentContainer');
    if (!modal || !container) return;

    // Use fallback local video if iframe isn't desired
    const videoMarkup = `
        <iframe 
            src="${tut.videoUrl}" 
            title="${tut.title}" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    container.innerHTML = `
        <div class="modal-video-frame">
            ${videoMarkup}
        </div>
        <div class="modal-body">
            <div class="modal-header-row">
                <h2 class="modal-title-text">${escapeHtml(tut.title)}</h2>
                <button class="modal-close-icon" onclick="closeTutorialModal()">✕</button>
            </div>
            <div class="modal-tags">
                <span class="badge-cat">${tut.category}</span>
                <span class="badge-lvl badge-${tut.level.toLowerCase()}">${tut.level}</span>
                <span class="badge-lvl">⏱️ ${tut.duration}</span>
                <span class="badge-lvl">Instructor: ${escapeHtml(tut.instructor)}</span>
            </div>
            <p class="modal-desc-full">${escapeHtml(tut.description)}</p>
            
            <div class="key-drills-box">
                <h4><span>🏏</span> Key Training Drills & Practice Focus:</h4>
                <ul>
                    ${tut.drills.map(d => `<li>${escapeHtml(d)}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

/**
 * Close Video Modal & Stop Video playback
 */
window.closeTutorialModal = function() {
    const modal = document.getElementById('tutorialModal');
    const container = document.getElementById('modalContentContainer');
    if (modal) {
        modal.classList.remove('active');
        if (container) container.innerHTML = ''; // Stops iframe audio/video
    }
    document.body.style.overflow = '';
};

/**
 * Close modal on Escape or Backdrop Click
 */
function initModalEvents() {
    const modal = document.getElementById('tutorialModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeTutorialModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeTutorialModal();
        }
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('.tutorials-hero', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    gsap.from('.filter-wrapper', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
    });
}

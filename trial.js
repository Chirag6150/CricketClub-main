/**
 * MAHARAJA CRICKET CLUB - 3-DAY FREE TRIAL SYSTEM (trial.js)
 * Manages trial registration, duplicate email prevention, countdown tracking,
 * and dynamic banner notification across pages.
 */

const TRIAL_STORAGE_KEYS = {
    ACTIVE_TRIAL: 'mcc_active_trial',
    REGISTERED_EMAILS: 'mcc_trial_registered_emails'
};

document.addEventListener('DOMContentLoaded', () => {
    injectTrialModalHTML();
    bindTrialCTAButtons();
    checkAndRenderTrialBanner();
});

/**
 * Check active trial status and render banner if applicable
 */
function checkAndRenderTrialBanner() {
    const bannerContainer = document.getElementById('mccTrialBanner');
    if (bannerContainer) bannerContainer.remove(); // Clean previous instance

    const trialData = getActiveTrial();
    if (!trialData) return;

    const now = new Date().getTime();
    const end = new Date(trialData.trialEndDate).getTime();
    const diffMs = end - now;

    const banner = document.createElement('div');
    banner.id = 'mccTrialBanner';
    banner.className = 'trial-banner';

    if (diffMs > 0) {
        // Active Trial
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const dayWord = daysLeft === 1 ? 'day' : 'days';
        banner.classList.add('active');
        banner.innerHTML = `
            <span class="trial-banner-badge">Free Trial Active</span>
            <span>🏏 Welcome, <strong>${escapeHtml(trialData.name)}</strong>! You have <strong>${daysLeft} ${dayWord} left</strong> in your 3-day trial.</span>
            <a href="booking.html" class="trial-banner-btn">Book Practice Net</a>
            <button class="trial-banner-close" title="Dismiss" onclick="dismissTrialBanner()">✕</button>
        `;
    } else {
        // Expired Trial
        banner.classList.add('expired');
        banner.innerHTML = `
            <span class="trial-banner-badge">Trial Concluded</span>
            <span>⚠️ Your 3-day trial has ended. Elevate your journey and unlock full club perks!</span>
            <a href="join.html" class="trial-banner-btn">Join Now</a>
            <button class="trial-banner-close" title="Dismiss" onclick="dismissTrialBanner()">✕</button>
        `;
    }

    document.body.prepend(banner);

    // Adjust sticky/fixed nav padding if banner is visible
    const nav = document.getElementById('nav');
    if (nav) {
        nav.style.top = '36px';
    }
}

/**
 * Dismiss banner for current browsing session
 */
window.dismissTrialBanner = function() {
    const banner = document.getElementById('mccTrialBanner');
    if (banner) banner.remove();
    const nav = document.getElementById('nav');
    if (nav) nav.style.top = '0';
};

/**
 * Bind all Free Trial buttons on the current page
 */
function bindTrialCTAButtons() {
    const trialButtons = document.querySelectorAll('.btn-start-trial, .btn-trial-cta');
    trialButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openTrialModal();
        });
    });
}

/**
 * Open Free Trial Registration Modal
 */
window.openTrialModal = function() {
    const activeTrial = getActiveTrial();
    if (activeTrial) {
        const now = new Date().getTime();
        const end = new Date(activeTrial.trialEndDate).getTime();
        if (end > now) {
            const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
            alert(`You already have an active free trial with ${daysLeft} day(s) remaining!`);
            return;
        }
    }

    const modal = document.getElementById('trialModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

/**
 * Close Trial Registration Modal
 */
window.closeTrialModal = function() {
    const modal = document.getElementById('trialModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

/**
 * Handle Trial Registration Form Submission
 */
function handleTrialSubmission(event) {
    event.preventDefault();

    const name = document.getElementById('trialName').value.trim();
    const email = document.getElementById('trialEmail').value.trim().toLowerCase();
    const phone = document.getElementById('trialPhone').value.trim();

    // -------------------------------------------------------------
    // PREVENT DUPLICATE EMAIL FROM STARTING MULTIPLE TRIALS
    // -------------------------------------------------------------
    // TODO: backend - In production, enforce unique trial eligibility in PostgreSQL
    // via UNIQUE(email) and phone SMS OTP verification to prevent abuse.
    const registeredEmails = getRegisteredTrialEmails();
    if (registeredEmails.includes(email)) {
        alert('⚠️ This email address has already activated a 3-Day Free Trial. Only 1 trial is permitted per cricketer.');
        return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // Exactly 3 days

    const trialRecord = {
        name,
        email,
        phone,
        trialStartDate: startDate.toISOString(),
        trialEndDate: endDate.toISOString(),
        active: true
    };

    // Save active trial and update registered email list
    localStorage.setItem(TRIAL_STORAGE_KEYS.ACTIVE_TRIAL, JSON.stringify(trialRecord));
    registeredEmails.push(email);
    localStorage.setItem(TRIAL_STORAGE_KEYS.REGISTERED_EMAILS, JSON.stringify(registeredEmails));

    // Award welcome bonus points (+15 points)
    if (typeof awardLoyaltyPoints === 'function') {
        awardLoyaltyPoints('Activated 3-Day Free Trial', 15);
    } else {
        // Fallback if booking.js isn't on the same page
        let currentPoints = parseInt(localStorage.getItem('mcc_bonus_points') || '50', 10);
        currentPoints += 15;
        localStorage.setItem('mcc_bonus_points', currentPoints.toString());
    }

    closeTrialModal();

    alert(`🎉 Congratulations ${name}! Your 3-Day Free Trial is now active until ${endDate.toLocaleDateString()}! Enjoy practice net access and club benefits.`);

    checkAndRenderTrialBanner();
}

/**
 * Inject Trial Modal dynamically into the DOM
 */
function injectTrialModalHTML() {
    if (document.getElementById('trialModal')) return;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.id = 'trialModal';
    modalBackdrop.className = 'trial-modal-backdrop';
    modalBackdrop.innerHTML = `
        <div class="trial-modal-card">
            <button class="trial-modal-close" onclick="closeTrialModal()">✕</button>
            <div class="trial-modal-header">
                <span class="trial-badge-icon">🏏</span>
                <h2>Start Your 3-Day Free Trial</h2>
                <p>Experience premier turf facilities, practice nets, and academy drills with zero upfront cost.</p>
            </div>

            <form id="trialSignupForm" onsubmit="handleTrialSubmission(event)">
                <div class="trial-form-group">
                    <label for="trialName">Full Name</label>
                    <input type="text" id="trialName" placeholder="Rahul Dravid" required>
                </div>

                <div class="trial-form-group">
                    <label for="trialEmail">Email Address</label>
                    <input type="email" id="trialEmail" placeholder="rahul@example.com" required>
                </div>

                <div class="trial-form-group">
                    <label for="trialPhone">Mobile Number</label>
                    <input type="tel" id="trialPhone" placeholder="+91 98765 43210" required>
                </div>

                <button type="submit" class="trial-submit-btn">Activate 3-Day Pass</button>

                <div class="trial-perks">
                    <strong>Included in your pass:</strong>
                    <ul>
                        <li>Access to practice bowling nets (Lane 3 & 4)</li>
                        <li>Complimentary equipment orientation session</li>
                        <li>15 Welcome Loyalty Bonus Points credited instantly</li>
                    </ul>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modalBackdrop);

    // Close on backdrop click
    modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
            closeTrialModal();
        }
    });
}

function getActiveTrial() {
    try {
        const raw = localStorage.getItem(TRIAL_STORAGE_KEYS.ACTIVE_TRIAL);
        return raw ? JSON.parse(raw) : null;
    } catch(e) {
        return null;
    }
}

function getRegisteredTrialEmails() {
    try {
        const raw = localStorage.getItem(TRIAL_STORAGE_KEYS.REGISTERED_EMAILS);
        return raw ? JSON.parse(raw) : [];
    } catch(e) {
        return [];
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// -----------------------------------------------------------------
// DEVELOPER / REVIEW TEST HELPERS
// -----------------------------------------------------------------
/**
 * Test helper: Fast-forward trial into expired state
 */
window.simulateTrialExpiry = function() {
    const trial = getActiveTrial();
    if (!trial) {
        alert('No active trial found to expire. Start a trial first!');
        return;
    }
    trial.trialEndDate = new Date(Date.now() - 1000).toISOString(); // Expired 1 second ago
    localStorage.setItem(TRIAL_STORAGE_KEYS.ACTIVE_TRIAL, JSON.stringify(trial));
    checkAndRenderTrialBanner();
    alert('Simulated: Trial has now expired!');
};

/**
 * Test helper: Reset trial data
 */
window.resetTrial = function() {
    localStorage.removeItem(TRIAL_STORAGE_KEYS.ACTIVE_TRIAL);
    localStorage.removeItem(TRIAL_STORAGE_KEYS.REGISTERED_EMAILS);
    const banner = document.getElementById('mccTrialBanner');
    if (banner) banner.remove();
    const nav = document.getElementById('nav');
    if (nav) nav.style.top = '0';
    alert('Trial data cleared from localStorage.');
};

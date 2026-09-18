/**
 * MAHARAJA CRICKET CLUB - BOOKING LOGIC (booking.js)
 * Handles playground & coach reservation, double-booking validation,
 * localStorage persistence, bonus points integration, and My Bookings.
 */

// Key constants for localStorage
const STORAGE_KEYS = {
    BOOKINGS: 'mcc_bookings',
    BONUS_POINTS: 'mcc_bonus_points',
    POINTS_HISTORY: 'mcc_points_history'
};

// Available 1-hour slots from 6:00 AM to 9:00 PM
const TIME_SLOTS = [
    "06:00 AM - 07:00 AM",
    "07:00 AM - 08:00 AM",
    "08:00 AM - 09:00 AM",
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "01:00 PM - 02:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM",
    "06:00 PM - 07:00 PM",
    "07:00 PM - 08:00 PM",
    "08:00 PM - 09:00 PM"
];

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initDatePickers();
    populateTimeSlots();
    initTabSwitching();
    initBookingForms();
    renderMyBookings();
    initGSAPAnimations();
});

/**
 * Configure minimum date as today for both date pickers
 */
function initDatePickers() {
    const today = new Date().toISOString().split('T')[0];
    const groundDateInput = document.getElementById('groundDate');
    const coachDateInput = document.getElementById('coachDate');

    if (groundDateInput) {
        groundDateInput.min = today;
        groundDateInput.value = today;
    }
    if (coachDateInput) {
        coachDateInput.min = today;
        coachDateInput.value = today;
    }
}

/**
 * Populate time slot dropdowns
 */
function populateTimeSlots() {
    const groundSlotSelect = document.getElementById('groundTimeSlot');
    const coachSlotSelect = document.getElementById('coachTimeSlot');

    TIME_SLOTS.forEach(slot => {
        if (groundSlotSelect) {
            const opt = document.createElement('option');
            opt.value = slot;
            opt.textContent = slot;
            groundSlotSelect.appendChild(opt);
        }
        if (coachSlotSelect) {
            const opt = document.createElement('option');
            opt.value = slot;
            opt.textContent = slot;
            coachSlotSelect.appendChild(opt);
        }
    });
}

/**
 * Handle switching between Ground and Coach tabs
 */
function initTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const activeContent = document.getElementById(targetTab);
            if (activeContent) activeContent.classList.add('active');
        });
    });
}

/**
 * Attach submission handlers to Ground & Coach booking forms
 */
function initBookingForms() {
    // 1. Playground Slot Form
    const groundForm = document.getElementById('groundBookingForm');
    if (groundForm) {
        groundForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const resourceType = 'ground';
            const resourceName = document.getElementById('groundArea').value;
            const date = document.getElementById('groundDate').value;
            const timeSlot = document.getElementById('groundTimeSlot').value;
            const players = document.getElementById('groundPlayers').value;
            const userName = document.getElementById('groundName').value.trim();
            const userEmail = document.getElementById('groundEmail').value.trim();
            const userPhone = document.getElementById('groundPhone').value.trim();

            handleNewBooking({
                type: resourceType,
                resourceName,
                date,
                timeSlot,
                players: `${players} Players`,
                userName,
                userEmail,
                userPhone
            });
        });
    }

    // 2. Coach Booking Form
    const coachForm = document.getElementById('coachBookingForm');
    if (coachForm) {
        coachForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const resourceType = 'coach';
            const coachSelect = document.getElementById('coachSelect');
            const resourceName = coachSelect.options[coachSelect.selectedIndex].text;
            const date = document.getElementById('coachDate').value;
            const timeSlot = document.getElementById('coachTimeSlot').value;
            const skillLevel = document.getElementById('coachSkillLevel').value;
            const userName = document.getElementById('coachName').value.trim();
            const userEmail = document.getElementById('coachEmail').value.trim();
            const userPhone = document.getElementById('coachPhone').value.trim();

            handleNewBooking({
                type: resourceType,
                resourceName,
                date,
                timeSlot,
                players: `1-on-1 (${skillLevel})`,
                userName,
                userEmail,
                userPhone
            });
        });
    }
}

/**
 * Core booking validation and execution
 * Checks for double-booking conflicts, saves to localStorage, and awards bonus points.
 */
function handleNewBooking(bookingData) {
    const existingBookings = getStoredBookings();

    // -------------------------------------------------------------
    // CONFLICT DETECTION (Prevent double-booking same resource + date + slot)
    // -------------------------------------------------------------
    // TODO: backend - In production, replace this front-end localStorage check
    // with an atomic database transaction (e.g., PostgreSQL SELECT FOR UPDATE or Redis Distributed Lock)
    // to prevent race conditions when two users book the same slot simultaneously.
    const hasConflict = existingBookings.some(item => 
        item.resourceName.toLowerCase() === bookingData.resourceName.toLowerCase() &&
        item.date === bookingData.date &&
        item.timeSlot === bookingData.timeSlot
    );

    if (hasConflict) {
        showConflictModal(bookingData);
        return;
    }

    // Construct confirmed booking object
    const newBooking = {
        id: 'MCC-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        ...bookingData,
        status: 'Confirmed',
        createdAt: new Date().toISOString()
    };

    // Save to localStorage
    // TODO: backend - Send POST /api/v1/bookings request with JWT auth token and capture booking in DB
    existingBookings.unshift(newBooking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(existingBookings));

    // Trigger Feature 4 Bonus Points (+10 points)
    const pointsAwarded = 10;
    const newTotalPoints = awardLoyaltyPoints(
        `Booked ${bookingData.type === 'ground' ? 'Ground' : 'Coach'}: ${bookingData.resourceName}`,
        pointsAwarded
    );

    // Show Confirmation Modal
    showSuccessModal(newBooking, pointsAwarded, newTotalPoints);

    // Refresh My Bookings list
    renderMyBookings();
}

/**
 * Loyalty Points Engine (Feature 4 connection)
 * Awards fixed points per completed booking and logs history in localStorage.
 */
function awardLoyaltyPoints(actionName, points = 10) {
    // TODO: backend - Persist points in a secure server-side ledger table (e.g. user_loyalty_ledger)
    let currentPoints = parseInt(localStorage.getItem(STORAGE_KEYS.BONUS_POINTS) || '50', 10);
    currentPoints += points;
    localStorage.setItem(STORAGE_KEYS.BONUS_POINTS, currentPoints.toString());

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(STORAGE_KEYS.POINTS_HISTORY) || '[]');
    } catch (e) {
        history = [];
    }

    history.unshift({
        id: 'pts_' + Date.now(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        action: actionName,
        points: points,
        type: 'earned'
    });

    localStorage.setItem(STORAGE_KEYS.POINTS_HISTORY, JSON.stringify(history));
    return currentPoints;
}

/**
 * Retrieve bookings from localStorage
 */
function getStoredBookings() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error parsing bookings from localStorage', e);
        return [];
    }
}

/**
 * Render the "My Bookings" list on the page
 */
function renderMyBookings() {
    const container = document.getElementById('bookingsGrid');
    const countBadge = document.getElementById('bookingsCount');
    const bookings = getStoredBookings();

    if (countBadge) {
        countBadge.textContent = `${bookings.length} Active`;
    }

    if (!container) return;

    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🏏</span>
                <h3>No upcoming bookings found</h3>
                <p>Reserve a pitch slot or book a coaching session above to see your schedule here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = bookings.map(b => `
        <div class="booking-ticket" data-id="${b.id}">
            <div class="ticket-header">
                <span class="ticket-type ${b.type === 'ground' ? 'type-ground' : 'type-coach'}">
                    ${b.type === 'ground' ? '🏟️ Arena Slot' : '🧢 Coach Session'}
                </span>
                <span class="ticket-ref">#${b.id}</span>
            </div>
            <div class="ticket-body">
                <h4 class="ticket-resource">${escapeHtml(b.resourceName)}</h4>
                <div class="ticket-detail-item">
                    <span>📅 Date:</span>
                    <strong>${formatDate(b.date)}</strong>
                </div>
                <div class="ticket-detail-item">
                    <span>⏰ Slot:</span>
                    <strong>${b.timeSlot}</strong>
                </div>
                <div class="ticket-detail-item">
                    <span>👤 Trainee/Team:</span>
                    <strong>${escapeHtml(b.userName)} (${b.players})</strong>
                </div>
            </div>
            <div class="ticket-footer">
                <span class="badge-confirmed">● ${b.status}</span>
                <button class="cancel-btn" onclick="cancelBooking('${b.id}')">Cancel</button>
            </div>
        </div>
    `).join('');
}

/**
 * Cancel a booking from localStorage
 */
window.cancelBooking = function(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking slot?')) {
        return;
    }

    // TODO: backend - Send DELETE /api/v1/bookings/:id request to release slot in database
    let bookings = getStoredBookings();
    bookings = bookings.filter(b => b.id !== bookingId);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    renderMyBookings();
};

/**
 * Display Confirmed Booking Modal
 */
function showSuccessModal(booking, pointsAwarded, totalPoints) {
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('modalContentContainer');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-icon">🎉</div>
        <h2 class="modal-title">Booking Confirmed!</h2>
        <p class="modal-message">Your reservation has been secured at Maharaja Cricket Club.</p>
        
        <div class="modal-summary">
            <div class="summary-row">
                <span class="summary-label">Booking Reference:</span>
                <span class="summary-val">#${booking.id}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Resource:</span>
                <span class="summary-val">${escapeHtml(booking.resourceName)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Date:</span>
                <span class="summary-val">${formatDate(booking.date)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Time Slot:</span>
                <span class="summary-val">${booking.timeSlot}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Reserved For:</span>
                <span class="summary-val">${escapeHtml(booking.userName)}</span>
            </div>
        </div>

        <div class="points-awarded-banner">
            <span>⭐</span>
            <span>+${pointsAwarded} Loyalty Points Awarded! (Total: ${totalPoints} pts)</span>
        </div>

        <button class="modal-close-btn" onclick="closeBookingModal()">Done & View Schedule</button>
    `;

    modal.classList.add('active');
}

/**
 * Display Double-Booking Conflict Modal
 */
function showConflictModal(booking) {
    const modal = document.getElementById('bookingModal');
    const modalBody = document.getElementById('modalContentContainer');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
        <div class="modal-icon">⚠️</div>
        <h2 class="modal-title" style="color: #f87171;">Slot Already Booked!</h2>
        <p class="modal-message">We're sorry, this resource is already reserved for the selected date and time window.</p>
        
        <div class="modal-summary" style="border-color: rgba(239, 68, 68, 0.3);">
            <div class="summary-row">
                <span class="summary-label">Resource:</span>
                <span class="summary-val">${escapeHtml(booking.resourceName)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Requested Date:</span>
                <span class="summary-val">${formatDate(booking.date)}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Requested Slot:</span>
                <span class="summary-val">${booking.timeSlot}</span>
            </div>
        </div>

        <p style="font-size: 0.85rem; color: #a0a5b5; margin-bottom: 1.5rem;">
            Please select a different time slot or another coach/ground area to proceed.
        </p>

        <button class="modal-close-btn" style="background: #e2e8f0; color: #111;" onclick="closeBookingModal()">Choose Another Slot</button>
    `;

    modal.classList.add('active');
}

/**
 * Close booking modal
 */
window.closeBookingModal = function() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
};

/**
 * Utility: Format Date string
 */
function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    } catch(e) {
        return dateStr;
    }
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * GSAP Animations for page entrance
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('.booking-hero', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    gsap.from('.booking-tabs', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out'
    });

    gsap.from('.booking-card', {
        scale: 0.96,
        opacity: 0,
        duration: 0.7,
        delay: 0.3,
        ease: 'power2.out'
    });
}

/**
 * THE 22 YARDS - REWARDS & LOYALTY SYSTEM (rewards.js)
 * Manages points balance, tier classification, threshold progress,
 * reward redemption, and transaction history.
 */

const REWARD_KEYS = {
    BONUS_POINTS: 'mcc_bonus_points',
    POINTS_HISTORY: 'mcc_points_history',
    ACTIVE_DISCOUNT: 'mcc_active_discount'
};

const REWARDS_CATALOG = [
    {
        id: 'rew-1',
        title: '₹200 Membership Plan Discount',
        cost: 100,
        icon: '🎟️',
        desc: 'Apply a flat ₹200 discount credit toward any Junior, Adult, or Supporter annual or monthly membership plan.',
        type: 'membership_discount',
        value: 200,
        code: 'MCC-MEM-200'
    },
    {
        id: 'rew-2',
        title: 'Free 1-Hour Practice Net Session',
        cost: 100,
        icon: '🏟️',
        desc: 'Enjoy a complimentary 1-hour solo or team practice session at our premier turf nets with bowling machine access.',
        type: 'ground_voucher',
        value: '1-Hour Turf Net',
        code: 'MCC-NET-FREE'
    },
    {
        id: 'rew-3',
        title: 'Official MCC Cap & Wristband',
        cost: 150,
        icon: '🧢',
        desc: 'Claim official club merchandise featuring embroidered Maharaja gold crest and moisture-wicking fabric.',
        type: 'merchandise',
        value: 'Club Kit',
        code: 'MCC-MERCH-KIT'
    },
    {
        id: 'rew-4',
        title: '1-on-1 Masterclass with Head Coach',
        cost: 300,
        icon: '👑',
        desc: 'Private 60-minute video analysis and customized technical consultation with Coach Rajesh Sharma.',
        type: 'coaching_voucher',
        value: 'Pro Masterclass',
        code: 'MCC-COACH-PRO'
    }
];

document.addEventListener('DOMContentLoaded', () => {
    ensureInitialSeedData();
    renderRewardsDashboard();
    initGSAPAnimations();
});

/**
 * Ensure default points and friendly welcome history exist for first-time visitors
 */
function ensureInitialSeedData() {
    if (localStorage.getItem(REWARD_KEYS.BONUS_POINTS) === null) {
        // Welcome bonus: 50 points
        localStorage.setItem(REWARD_KEYS.BONUS_POINTS, '50');
    }

    if (localStorage.getItem(REWARD_KEYS.POINTS_HISTORY) === null) {
        const welcomeHistory = [
            {
                id: 'pts_welcome',
                date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                action: 'Welcome Cricketer Joining Bonus',
                points: 50,
                type: 'earned'
            }
        ];
        localStorage.setItem(REWARD_KEYS.POINTS_HISTORY, JSON.stringify(welcomeHistory));
    }
}

/**
 * Render Points, Tier, Progress, Catalog, and History
 */
function renderRewardsDashboard() {
    const currentPoints = parseInt(localStorage.getItem(REWARD_KEYS.BONUS_POINTS) || '0', 10);
    
    // 1. Balance Number & Tier
    const ptsNumberEl = document.getElementById('pointsNumber');
    if (ptsNumberEl) ptsNumberEl.textContent = currentPoints;

    const tier = calculateTier(currentPoints);
    const tierIconEl = document.getElementById('tierIcon');
    const tierNameEl = document.getElementById('tierName');
    const tierSubEl = document.getElementById('tierSub');

    if (tierIconEl) tierIconEl.textContent = tier.icon;
    if (tierNameEl) tierNameEl.textContent = tier.name;
    if (tierSubEl) tierSubEl.textContent = tier.subtitle;

    // 2. Progress Bar toward next 100-pt threshold
    const nextMilestone = Math.max(100, Math.ceil((currentPoints + 1) / 100) * 100);
    const pointsNeeded = Math.max(0, nextMilestone - currentPoints);
    const progressPercent = Math.min(100, Math.round(((100 - (nextMilestone - currentPoints)) / 100) * 100));

    const progressFill = document.getElementById('progressFill');
    const progressStatus = document.getElementById('progressStatus');
    const pointsNeededEl = document.getElementById('pointsNeeded');

    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (progressStatus) progressStatus.textContent = `${currentPoints} / ${nextMilestone} Points`;
    if (pointsNeededEl) {
        pointsNeededEl.textContent = pointsNeeded === 0 
            ? 'Milestone Reached! Redeem your rewards below.' 
            : `${pointsNeeded} more points until next reward unlock`;
    }

    // 3. Render Catalog Cards
    renderRewardsCatalog(currentPoints);

    // 4. Render Transaction History
    renderPointsHistory();
}

/**
 * Determine loyalty tier
 */
function calculateTier(points) {
    if (points >= 500) return { name: 'Royal MVP', icon: '👑', subtitle: 'VIP Access & Priority Bookings' };
    if (points >= 250) return { name: 'Gold All-Rounder', icon: '🥇', subtitle: '15% Equipment Discount' };
    if (points >= 100) return { name: 'Silver Striker', icon: '🥈', subtitle: 'Eligible for Reward Redemptions' };
    if (points >= 50) return { name: 'Club Member', icon: '🥉', subtitle: 'Standard Practice Access' };
    return { name: 'Rookie Cricketer', icon: '🏏', subtitle: 'Earn points by booking sessions' };
}

/**
 * Render reward redemption cards with dynamic button states
 */
function renderRewardsCatalog(currentPoints) {
    const grid = document.getElementById('rewardsGrid');
    if (!grid) return;

    grid.innerHTML = REWARDS_CATALOG.map(item => {
        const canAfford = currentPoints >= item.cost;
        return `
            <div class="reward-card">
                <div>
                    <div class="reward-header">
                        <span class="reward-icon">${item.icon}</span>
                        <span class="reward-cost-badge">🪙 ${item.cost} Points</span>
                    </div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.desc)}</p>
                </div>
                <button 
                    class="btn-redeem" 
                    ${canAfford ? '' : 'disabled'}
                    onclick="redeemReward('${item.id}')"
                >
                    ${canAfford ? 'Redeem Voucher' : `Needs ${item.cost - currentPoints} More Pts`}
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Execute Reward Redemption
 */
window.redeemReward = function(rewardId) {
    const reward = REWARDS_CATALOG.find(r => r.id === rewardId);
    if (!reward) return;

    let currentPoints = parseInt(localStorage.getItem(REWARD_KEYS.BONUS_POINTS) || '0', 10);
    if (currentPoints < reward.cost) {
        alert('Insufficient bonus points balance.');
        return;
    }

    if (!confirm(`Redeem "${reward.title}" for ${reward.cost} bonus points?`)) {
        return;
    }

    // Deduct points
    // TODO: backend - In production, send POST /api/v1/loyalty/redeem with user token.
    // The server must atomically verify point balance, apply row-level locking, and generate a secure HMAC-signed voucher.
    currentPoints -= reward.cost;
    localStorage.setItem(REWARD_KEYS.BONUS_POINTS, currentPoints.toString());

    // Generate voucher code
    const uniqueVoucherCode = `${reward.code}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // If it's a membership discount, save active discount to apply on join.html
    if (reward.type === 'membership_discount') {
        const discountRecord = {
            type: 'membership',
            amount: reward.value,
            code: uniqueVoucherCode,
            active: true,
            redeemedAt: new Date().toISOString()
        };
        localStorage.setItem(REWARD_KEYS.ACTIVE_DISCOUNT, JSON.stringify(discountRecord));
    }

    // Log in points history
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(REWARD_KEYS.POINTS_HISTORY) || '[]');
    } catch(e) { history = []; }

    history.unshift({
        id: 'pts_' + Date.now(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        action: `Redeemed: ${reward.title}`,
        points: -reward.cost,
        type: 'spent'
    });
    localStorage.setItem(REWARD_KEYS.POINTS_HISTORY, JSON.stringify(history));

    // Refresh UI
    renderRewardsDashboard();

    // Show Confirmation Modal
    showRedeemSuccessModal(reward, uniqueVoucherCode);
};

/**
 * Render Transaction History Table
 */
function renderPointsHistory() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(REWARD_KEYS.POINTS_HISTORY) || '[]');
    } catch (e) {
        history = [];
    }

    if (history.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #a0a5b5; padding: 2rem;">No points transactions yet.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = history.map(item => `
        <tr>
            <td>${escapeHtml(item.date)}</td>
            <td><strong>${escapeHtml(item.action)}</strong></td>
            <td>
                <span class="${item.points > 0 ? 'pts-earned' : 'pts-spent'}">
                    ${item.points > 0 ? `+${item.points}` : item.points} Pts
                </span>
            </td>
            <td><span style="color: #4ade80;">● Completed</span></td>
        </tr>
    `).join('');
}

/**
 * Display Reward Redemption Modal
 */
function showRedeemSuccessModal(reward, voucherCode) {
    const modal = document.getElementById('redeemModal');
    const container = document.getElementById('redeemModalContainer');
    if (!modal || !container) return;

    const isMembership = reward.type === 'membership_discount';

    container.innerHTML = `
        <div style="font-size: 3.5rem; margin-bottom: 0.8rem;">🎉</div>
        <h2 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.5rem; color: #fff;">Reward Unlocked!</h2>
        <p style="color: #cbd5e1; font-size: 0.95rem;">You have successfully redeemed <strong>${escapeHtml(reward.title)}</strong>.</p>
        
        <div class="voucher-box">
            <div style="font-size: 0.8rem; color: #a0a5b5; margin-bottom: 0.4rem; text-transform: uppercase;">Your Redemption Voucher Code</div>
            <div class="voucher-code">${voucherCode}</div>
        </div>

        ${isMembership ? `
            <p style="font-size: 0.88rem; color: #4ade80; margin-bottom: 1rem;">
                ✨ Your ₹200 discount has been automatically linked to your account! You can now visit the Membership page to see adjusted plan pricing.
            </p>
            <a href="join.html" class="btn-use-voucher">Go to Membership Plans ➔</a>
        ` : `
            <p style="font-size: 0.88rem; color: #cbd5e1; margin-bottom: 1rem;">
                Present this voucher code at the MCC Reception Desk or during session check-in.
            </p>
            <button class="btn-use-voucher" onclick="closeRedeemModal()">Close & Continue</button>
        `}
    `;

    modal.classList.add('active');
}

window.closeRedeemModal = function() {
    const modal = document.getElementById('redeemModal');
    if (modal) modal.classList.remove('active');
};

/**
 * Developer / Demo helper: Add 50 Demo Points
 */
window.addDemoPoints = function() {
    let current = parseInt(localStorage.getItem(REWARD_KEYS.BONUS_POINTS) || '0', 10);
    current += 50;
    localStorage.setItem(REWARD_KEYS.BONUS_POINTS, current.toString());

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem(REWARD_KEYS.POINTS_HISTORY) || '[]');
    } catch(e) { history = []; }

    history.unshift({
        id: 'pts_' + Date.now(),
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        action: 'Demo Testing Grant (+50 Points)',
        points: 50,
        type: 'earned'
    });
    localStorage.setItem(REWARD_KEYS.POINTS_HISTORY, JSON.stringify(history));

    renderRewardsDashboard();
    alert('Added 50 Demo Points! You can now test the 100-point threshold redemption.');
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.from('.rewards-hero', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
    });

    gsap.from('.balance-card', {
        scale: 0.96,
        opacity: 0,
        duration: 0.7,
        delay: 0.2,
        ease: 'power2.out'
    });
}

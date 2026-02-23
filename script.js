// ============================================
// ESPADA CLAN WEBSITE - script.js
// Firebase Firestore + Admin Dashboard
// ============================================

// ===== FIREBASE CONFIG =====
// REPLACE with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyCZVVGF_SHr1xYxPf1UqT6TO7Z7Bfj8tks",
    authDomain: "espada-database.firebaseapp.com",
    databaseURL: "https://espada-database-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "espada-database",
    storageBucket: "espada-database.firebasestorage.app",
    messagingSenderId: "88750219737",
    appId: "1:88750219737:web:b17dfede79fa07746fb9c8",
    measurementId: "G-K8N469WDLF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== GLOBAL STATE =====
let ranksData = [];
let servicesData = [];
let adminToken = sessionStorage.getItem('espada_admin_token') || null;

// ===== LOADING SCREEN =====
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => loadingScreen.remove(), 800);
    }, 1000);
});

// ===== MOBILE MENU =====
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');

mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const spans = mobileToggle.querySelectorAll('span');
    if (navMenu.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(10px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-10px)';
    } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    }
});

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===== SMOOTH SCROLLING =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    });
});

// ===== PREMIUM SCROLL ANIMATIONS =====
const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// High-performance observer for the Neo-Bento fadeUpScale effect
const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
};

const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Unobserve after revealing to save performance
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function initScrollAnimations() {
    // Select all bento cards, titles, and structural elements
    const elementsToReveal = document.querySelectorAll(
        '.glass-card, .section-title, .leader-card, .rank-card, .contact-card, .join-content'
    );

    elementsToReveal.forEach((el, index) => {
        // Add base class if not present
        if (!el.classList.contains('scroll-reveal')) {
            el.classList.add('scroll-reveal');
        }

        // Add staggering logic for grids
        if (el.parentElement.classList.contains('about-content') ||
            el.parentElement.classList.contains('leaders-grid') ||
            el.parentElement.classList.contains('rankings-container') ||
            el.parentElement.classList.contains('contact-grid')) {
            el.parentElement.classList.add('grid-stagger');
        }

        scrollObserver.observe(el);
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initScrollAnimations);

// ===== NAVBAR SCROLL EFFECT =====
document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        const isLight = document.documentElement.getAttribute('data-theme') === 'light';
        if (isLight) {
            navbar.style.background = window.scrollY > 100
                ? 'rgba(255, 255, 255, 0.98)'
                : 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.background = window.scrollY > 100
                ? 'rgba(15, 15, 35, 0.95)'
                : 'rgba(15, 15, 35, 0.8)';
        }
    });

    // Load dynamic data from Firestore
    loadServices();
    loadRanks();

    // Track this visitor
    trackVisitor();

    // Init new features
    loadAnnouncement();
    loadSpotlight();
    initThemeToggle();
    initSoundSystem();
});

// ===== LEADER AVATAR HOVER =====
document.querySelectorAll('.leader-avatar').forEach(avatar => {
    avatar.addEventListener('mouseenter', function () { this.style.transform = 'scale(1.15) rotate(5deg)'; });
    avatar.addEventListener('mouseleave', function () { this.style.transform = 'scale(1) rotate(0deg)'; });
});

// ===== CTA BUTTON RIPPLE =====
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

// ===== HERO TYPING EFFECT =====
const heroSubtitle = document.querySelector('.hero-subtitle');
if (heroSubtitle) {
    const originalText = heroSubtitle.textContent;
    heroSubtitle.textContent = '';
    let charIndex = 0;
    function typeText() {
        if (charIndex < originalText.length) {
            heroSubtitle.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeText, 50);
        }
    }
    setTimeout(typeText, 1000);
}

// ===== CONSOLE EASTER EGG =====
console.log('%c🔥 ESPADA CLAN 🔥', 'color: #DC143C; font-size: 28px; font-weight: bold;');
console.log('%cElite Warriors United', 'color: #FF0000; font-size: 18px; font-weight: bold;');

// ===== MODAL FUNCTIONS =====
function closeModal() {
    document.getElementById('successModal').classList.add('hidden');
}

// ============================================
// FIRESTORE DATA LOADING
// ============================================

async function loadServices() {
    try {
        const doc = await db.collection('siteData').doc('services').get();
        if (doc.exists) {
            servicesData = doc.data().items || [];
        } else {
            // Fallback: load from static JSON
            const res = await fetch('services.json');
            servicesData = await res.json();
        }
        renderServices();
    } catch (e) {
        console.error('Failed to load services from Firestore, trying local:', e);
        try {
            const res = await fetch('services.json');
            servicesData = await res.json();
            renderServices();
        } catch (e2) {
            console.error('Failed to load services:', e2);
        }
    }
}

function renderServices() {
    const container = document.getElementById('servicesContainer');
    if (!container) return;
    container.innerHTML = servicesData.map(s => `
        <div class="glass-card service-card scroll-reveal">
            <div class="service-icon">${s.icon}</div>
            <h3>${s.title}</h3>
            <p>${s.description}</p>
        </div>
    `).join('');
    observeNewElements();
}

async function loadRanks() {
    try {
        const doc = await db.collection('siteData').doc('ranks').get();
        if (doc.exists) {
            ranksData = doc.data().items || [];
        } else {
            // Fallback: load from static JSON
            const res = await fetch('ranks.json');
            ranksData = await res.json();
        }
        renderRanks();
    } catch (e) {
        console.error('Failed to load ranks from Firestore, trying local:', e);
        try {
            const res = await fetch('ranks.json');
            ranksData = await res.json();
            renderRanks();
        } catch (e2) {
            console.error('Failed to load ranks:', e2);
        }
    }
}

function renderRanks() {
    const container = document.getElementById('rankingsContainer');
    if (!container) return;
    container.innerHTML = ranksData.map((tier, i) => `
        <div class="glass-card rank-card scroll-reveal" data-rank="${i + 1}">
            <div class="rank-number">${tier.rankNumber}</div>
            <div class="rank-info">
                <h3 class="rank-title">${tier.title}</h3>
                <p class="rank-description">${tier.description}</p>
            </div>
            <span class="rank-badge">${tier.badge}</span>
            <span class="expand-icon">▼</span>
            <div class="rank-members">
                <div class="member-list">
                    ${tier.members.map(m => `
                        <div class="member-item">${m.name} <span style="opacity: 0.6;">• ${m.rank}</span></div>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

    // Re-attach click-to-expand
    document.querySelectorAll('.rank-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.classList.contains('member-item')) return;
            document.querySelectorAll('.rank-card').forEach(c => {
                if (c !== this && c.classList.contains('expanded')) c.classList.remove('expanded');
            });
            this.classList.toggle('expanded');
        });
    });

    observeNewElements();
}

// ============================================
// APPLICATION FORM SUBMISSION (Firebase)
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('recruitmentForm');
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            const originalBtnText = submitButton.innerText;
            submitButton.disabled = true;
            submitButton.innerHTML = 'Transmitting... <span style="animation: buttonPulse 1s infinite;">⚡';

            const formData = {
                name: document.getElementById('name').value,
                age: document.getElementById('age').value,
                discord: document.getElementById('discord').value,
                experience: document.getElementById('experience').value,
                reason: document.getElementById('reason').value,
                timestamp: new Date().toISOString(),
                status: 'pending'
            };

            try {
                await db.collection('applications').add(formData);
                document.getElementById('successModal').classList.remove('hidden');
                form.reset();
            } catch (error) {
                console.error('Error submitting application:', error);
                alert('There was an error submitting. Please try again or contact us on Discord.');
            } finally {
                submitButton.disabled = false;
                submitButton.innerText = originalBtnText;
            }
        });
    }
});

// ============================================
// ADMIN SYSTEM (Firebase)
// ============================================

// --- Admin Login ---
const adminLoginTrigger = document.getElementById('adminLoginTrigger');
const adminLoginOverlay = document.getElementById('adminLoginOverlay');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginCancel = document.getElementById('adminLoginCancel');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const adminLoginError = document.getElementById('adminLoginError');

adminLoginTrigger.addEventListener('click', () => {
    if (adminToken) {
        openDashboard();
    } else {
        adminLoginOverlay.classList.remove('hidden');
        adminPasswordInput.focus();
    }
});

adminLoginCancel.addEventListener('click', () => {
    adminLoginOverlay.classList.add('hidden');
    adminPasswordInput.value = '';
    adminLoginError.textContent = '';
});

adminLoginOverlay.addEventListener('click', (e) => {
    if (e.target === adminLoginOverlay) {
        adminLoginOverlay.classList.add('hidden');
        adminPasswordInput.value = '';
        adminLoginError.textContent = '';
    }
});

adminPasswordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') adminLoginBtn.click();
});

adminLoginBtn.addEventListener('click', async () => {
    const password = adminPasswordInput.value.trim();
    if (!password) {
        adminLoginError.textContent = 'Enter a password';
        return;
    }

    adminLoginBtn.disabled = true;
    adminLoginBtn.textContent = 'Authenticating...';
    adminLoginError.textContent = '';

    try {
        const doc = await db.collection('siteData').doc('admin').get();
        if (doc.exists && doc.data().password === password) {
            adminToken = 'firebase-admin-' + Date.now();
            sessionStorage.setItem('espada_admin_token', adminToken);
            adminLoginOverlay.classList.add('hidden');
            adminPasswordInput.value = '';
            adminLoginError.textContent = '';
            openDashboard();
        } else {
            adminLoginError.textContent = '⛔ Access denied. Wrong password.';
            adminPasswordInput.value = '';
            adminPasswordInput.focus();
        }
    } catch (e) {
        console.error('Login error:', e);
        adminLoginError.textContent = 'Connection error. Try again.';
    } finally {
        adminLoginBtn.disabled = false;
        adminLoginBtn.textContent = 'Authenticate';
    }
});

// --- Admin Dashboard ---
const adminDashOverlay = document.getElementById('adminDashOverlay');
const adminDashClose = document.getElementById('adminDashClose');
const adminSaveBtn = document.getElementById('adminSaveBtn');
const adminSaveMsg = document.getElementById('adminSaveMsg');

// Local copies for editing
let editRanks = [];
let editServices = [];

function openDashboard() {
    editRanks = JSON.parse(JSON.stringify(ranksData));
    editServices = JSON.parse(JSON.stringify(servicesData));

    adminDashOverlay.classList.remove('hidden');
    renderAdminRanks();
    renderAdminServices();
    loadApplications();
    loadVisitors();
    loadSiteSettings();
    adminSaveMsg.textContent = 'Changes are auto-tracked';
    adminSaveMsg.className = 'admin-save-msg';
}

adminDashClose.addEventListener('click', () => {
    adminDashOverlay.classList.add('hidden');
});

adminDashOverlay.addEventListener('click', (e) => {
    if (e.target === adminDashOverlay) adminDashOverlay.classList.add('hidden');
});

// Dashboard Tabs
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
        const tabName = this.dataset.tab;
        const panelMap = { ranks: 'adminRanksPanel', services: 'adminServicesPanel', applications: 'adminApplicationsPanel', visitors: 'adminVisitorsPanel', site: 'adminSitePanel' };
        document.getElementById(panelMap[tabName]).classList.add('active');
    });
});

// --- Render Admin Ranks ---
function renderAdminRanks() {
    const list = document.getElementById('adminRanksList');
    list.innerHTML = editRanks.map((tier, ti) => `
        <div class="admin-rank-tier">
            <div class="admin-rank-header">
                <div class="tier-label">
                    <span class="tier-rank-num">${tier.rankNumber}</span>
                    <span class="tier-title">${tier.title}</span>
                </div>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span class="tier-badge">${tier.badge}</span>
                    <button class="admin-delete-tier-btn" data-tier="${ti}">Delete</button>
                </div>
            </div>
            <div class="admin-rank-body">
                <div class="admin-member-list">
                    ${tier.members.map((m, mi) => `
                        <div class="admin-member-chip">
                            <span>${m.name}</span>
                            <span class="chip-rank">${m.rank}</span>
                            <button class="chip-remove" data-tier="${ti}" data-member="${mi}">✕</button>
                        </div>
                    `).join('')}
                    ${tier.members.length === 0 ? '<span style="color:rgba(255,255,255,0.3);font-size:0.85rem;">No members</span>' : ''}
                </div>
                <div class="admin-add-row">
                    <input type="text" placeholder="Member name" id="addMemberName_${ti}">
                    <input type="text" placeholder="Rank" value="${tier.rankNumber}" id="addMemberRank_${ti}" style="max-width:80px;">
                    <button class="admin-add-btn" data-tier="${ti}">+ Add</button>
                </div>
            </div>
        </div>
    `).join('');

    // Attach events
    list.querySelectorAll('.chip-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const ti = parseInt(btn.dataset.tier);
            const mi = parseInt(btn.dataset.member);
            editRanks[ti].members.splice(mi, 1);
            renderAdminRanks();
        });
    });

    list.querySelectorAll('.admin-add-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ti = parseInt(btn.dataset.tier);
            const nameInput = document.getElementById(`addMemberName_${ti}`);
            const rankInput = document.getElementById(`addMemberRank_${ti}`);
            const name = nameInput.value.trim();
            const rank = rankInput.value.trim();
            if (name && rank) {
                editRanks[ti].members.push({ name, rank });
                renderAdminRanks();
            }
        });
    });

    list.querySelectorAll('.admin-delete-tier-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ti = parseInt(btn.dataset.tier);
            if (confirm(`Delete tier "${editRanks[ti].title}"?`)) {
                editRanks.splice(ti, 1);
                renderAdminRanks();
            }
        });
    });
}

// --- Add New Tier ---
const showAddTierBtn = document.getElementById('showAddTierForm');
const newTierForm = document.getElementById('newTierForm');
const confirmAddTier = document.getElementById('confirmAddTier');
const cancelAddTier = document.getElementById('cancelAddTier');

showAddTierBtn.addEventListener('click', () => {
    newTierForm.classList.toggle('visible');
});

cancelAddTier.addEventListener('click', () => {
    newTierForm.classList.remove('visible');
});

confirmAddTier.addEventListener('click', () => {
    const rank = document.getElementById('newTierRank').value.trim();
    const title = document.getElementById('newTierTitle').value.trim();
    const badge = document.getElementById('newTierBadge').value.trim();
    const desc = document.getElementById('newTierDesc').value.trim();

    if (!rank || !title) {
        alert('Rank and Title are required');
        return;
    }

    editRanks.push({
        id: rank.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        rankNumber: rank,
        title: title,
        description: desc || 'No description.',
        badge: badge || rank,
        members: []
    });

    document.getElementById('newTierRank').value = '';
    document.getElementById('newTierTitle').value = '';
    document.getElementById('newTierBadge').value = '';
    document.getElementById('newTierDesc').value = '';
    newTierForm.classList.remove('visible');
    renderAdminRanks();
});

// --- Render Admin Services ---
function renderAdminServices() {
    const list = document.getElementById('adminServicesList');
    list.innerHTML = editServices.map((s, si) => `
        <div class="admin-service-card">
            <div class="admin-service-icon">${s.icon}</div>
            <div class="admin-service-info">
                <h4>${s.title}</h4>
                <p>${s.description}</p>
            </div>
            <button class="admin-service-delete" data-idx="${si}">Delete</button>
        </div>
    `).join('');

    list.querySelectorAll('.admin-service-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const si = parseInt(btn.dataset.idx);
            if (confirm(`Delete service "${editServices[si].title}"?`)) {
                editServices.splice(si, 1);
                renderAdminServices();
            }
        });
    });
}

// --- Add New Service ---
document.getElementById('confirmAddService').addEventListener('click', () => {
    const icon = document.getElementById('newServiceIcon').value.trim();
    const title = document.getElementById('newServiceTitle').value.trim();
    const desc = document.getElementById('newServiceDesc').value.trim();

    if (!title) {
        alert('Service title is required');
        return;
    }

    editServices.push({
        id: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        icon: icon || '🔧',
        title: title,
        description: desc || 'No description.'
    });

    document.getElementById('newServiceIcon').value = '';
    document.getElementById('newServiceTitle').value = '';
    document.getElementById('newServiceDesc').value = '';
    renderAdminServices();
});

// ============================================
// APPLICATIONS MANAGEMENT (Firebase)
// ============================================

async function loadApplications() {
    const list = document.getElementById('adminAppsList');
    const countEl = document.getElementById('appsCount');
    list.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);">Loading applications...</p>';

    try {
        const snapshot = await db.collection('applications')
            .orderBy('timestamp', 'desc')
            .get();

        const apps = [];
        snapshot.forEach(doc => apps.push({ id: doc.id, ...doc.data() }));

        countEl.textContent = `${apps.length} application${apps.length !== 1 ? 's' : ''}`;

        if (apps.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:2rem;">No applications yet.</p>';
            return;
        }

        list.innerHTML = apps.map(app => `
            <div class="admin-app-card" data-id="${app.id}">
                <div class="app-card-header">
                    <div class="app-card-name">${app.name || 'Unknown'}</div>
                    <div class="app-card-meta">
                        <span class="app-card-age">Age: ${app.age || '?'}</span>
                        <span class="app-card-time">${formatTime(app.timestamp)}</span>
                    </div>
                </div>
                <div class="app-card-field">
                    <span class="app-field-label">Discord:</span>
                    <span class="app-field-value">${app.discord || 'N/A'}</span>
                </div>
                <div class="app-card-field">
                    <span class="app-field-label">Experience:</span>
                    <span class="app-field-value">${app.experience || 'N/A'}</span>
                </div>
                <div class="app-card-field">
                    <span class="app-field-label">Why Espada:</span>
                    <span class="app-field-value">${app.reason || 'N/A'}</span>
                </div>
                <div class="app-card-actions">
                    <button class="app-delete-btn" data-id="${app.id}">🗑️ Delete</button>
                </div>
            </div>
        `).join('');

        // Attach delete handlers
        list.querySelectorAll('.app-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this application?')) {
                    try {
                        await db.collection('applications').doc(btn.dataset.id).delete();
                        loadApplications();
                    } catch (e) {
                        alert('Failed to delete. Try again.');
                    }
                }
            });
        });
    } catch (e) {
        console.error('Failed to load applications:', e);
        list.innerHTML = '<p style="text-align:center;color:#ff4444;">Failed to load applications. Check Firebase config.</p>';
    }
}

// Clear all applications
document.getElementById('clearAllApps').addEventListener('click', async () => {
    if (!confirm('Delete ALL applications? This cannot be undone.')) return;

    try {
        const snapshot = await db.collection('applications').get();
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        loadApplications();
    } catch (e) {
        alert('Failed to clear applications.');
    }
});

function formatTime(timestamp) {
    if (!timestamp) return '';
    try {
        const d = new Date(timestamp);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return timestamp;
    }
}

// --- SAVE ALL (Firebase) ---
adminSaveBtn.addEventListener('click', async () => {
    adminSaveBtn.disabled = true;
    adminSaveBtn.textContent = 'Saving...';
    adminSaveMsg.textContent = 'Saving changes...';
    adminSaveMsg.className = 'admin-save-msg';

    try {
        // Save ranks to Firestore
        await db.collection('siteData').doc('ranks').set({ items: editRanks });

        // Save services to Firestore
        await db.collection('siteData').doc('services').set({ items: editServices });

        // Update live data
        ranksData = JSON.parse(JSON.stringify(editRanks));
        servicesData = JSON.parse(JSON.stringify(editServices));
        renderServices();
        renderRanks();

        adminSaveMsg.textContent = '✓ All changes saved successfully!';
        adminSaveMsg.className = 'admin-save-msg success';
    } catch (e) {
        console.error('Save error:', e);
        adminSaveMsg.textContent = '✕ Failed to save. Check Firebase config.';
        adminSaveMsg.className = 'admin-save-msg error';
    } finally {
        adminSaveBtn.disabled = false;
        adminSaveBtn.textContent = '💾 SAVE ALL';
    }
});

// ============================================
// VISITOR TRACKING & ANALYTICS
// ============================================

function parseUserAgent(ua) {
    let browser = 'Unknown';
    let os = 'Unknown';
    let device = 'Desktop';

    // Detect browser
    if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('OPR/') || ua.includes('Opera')) browser = 'Opera';
    else if (ua.includes('Chrome/') && !ua.includes('Edg/')) browser = 'Chrome';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('MSIE') || ua.includes('Trident/')) browser = 'IE';

    // Detect OS
    if (ua.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (ua.includes('Windows NT')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('CrOS')) os = 'Chrome OS';

    // Detect device type
    if (/Mobi|Android.*Mobile|iPhone/i.test(ua)) device = 'Mobile';
    else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) device = 'Tablet';

    return { browser, os, device };
}

async function trackVisitor() {
    try {
        const { browser, os, device } = parseUserAgent(navigator.userAgent);

        const visitorData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            browser,
            os,
            device,
            screenResolution: `${screen.width}x${screen.height}`,
            referrer: document.referrer || 'Direct',
            pageUrl: window.location.href,
            language: navigator.language || 'Unknown',
            ip: 'Fetching...'
        };

        // Try to get IP
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipRes.json();
            visitorData.ip = ipData.ip;
        } catch {
            visitorData.ip = 'Unavailable';
        }

        await db.collection('visitors').add(visitorData);
    } catch (e) {
        console.error('Visitor tracking error:', e);
    }
}

async function loadVisitors() {
    const list = document.getElementById('adminVisitorsList');
    const countEl = document.getElementById('visitorsCount');
    const totalEl = document.getElementById('totalVisitors');
    const todayEl = document.getElementById('todayVisitors');
    const uniqueEl = document.getElementById('uniqueIPs');

    list.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);">Loading visitors...</p>';

    try {
        const snapshot = await db.collection('visitors')
            .orderBy('timestamp', 'desc')
            .limit(200)
            .get();

        const visitors = [];
        snapshot.forEach(doc => visitors.push({ id: doc.id, ...doc.data() }));

        // Stats
        const today = new Date().toISOString().slice(0, 10);
        const todayCount = visitors.filter(v => v.timestamp && v.timestamp.startsWith(today)).length;
        const uniqueIPSet = new Set(visitors.map(v => v.ip).filter(ip => ip && ip !== 'Unavailable' && ip !== 'Fetching...'));

        totalEl.textContent = visitors.length;
        todayEl.textContent = todayCount;
        uniqueEl.textContent = uniqueIPSet.size;
        countEl.textContent = `${visitors.length} visitor${visitors.length !== 1 ? 's' : ''}`;

        if (visitors.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:2rem;">No visitors recorded yet.</p>';
            return;
        }

        list.innerHTML = visitors.map(v => {
            const deviceIcon = v.device === 'Mobile' ? '📱' : v.device === 'Tablet' ? '📟' : '🖥️';
            const browserIcon = {
                'Chrome': '🌐', 'Firefox': '🦊', 'Safari': '🧭',
                'Edge': '🔷', 'Opera': '🔴', 'IE': '📘'
            }[v.browser] || '🌍';

            return `
            <div class="admin-app-card visitor-card">
                <div class="app-card-header">
                    <div class="visitor-ip-badge">${v.ip || 'Unknown'}</div>
                    <div class="app-card-meta">
                        <span class="visitor-device-badge ${(v.device || '').toLowerCase()}">${deviceIcon} ${v.device || '?'}</span>
                        <span class="app-card-time">${formatTime(v.timestamp)}</span>
                    </div>
                </div>
                <div class="visitor-details-grid">
                    <div class="app-card-field">
                        <span class="app-field-label">${browserIcon} Browser:</span>
                        <span class="app-field-value">${v.browser || 'Unknown'}</span>
                    </div>
                    <div class="app-card-field">
                        <span class="app-field-label">💻 OS:</span>
                        <span class="app-field-value">${v.os || 'Unknown'}</span>
                    </div>
                    <div class="app-card-field">
                        <span class="app-field-label">📐 Screen:</span>
                        <span class="app-field-value">${v.screenResolution || 'Unknown'}</span>
                    </div>
                    <div class="app-card-field">
                        <span class="app-field-label">🌐 Language:</span>
                        <span class="app-field-value">${v.language || 'Unknown'}</span>
                    </div>
                    <div class="app-card-field">
                        <span class="app-field-label">🔗 Referrer:</span>
                        <span class="app-field-value">${v.referrer || 'Direct'}</span>
                    </div>
                    <div class="app-card-field">
                        <span class="app-field-label">📄 Page:</span>
                        <span class="app-field-value">${v.pageUrl || 'Unknown'}</span>
                    </div>
                </div>
                <div class="app-card-actions">
                    <button class="app-delete-btn visitor-delete-btn" data-id="${v.id}">🗑️ Delete</button>
                </div>
            </div>
        `;
        }).join('');

        // Attach delete handlers
        list.querySelectorAll('.visitor-delete-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this visitor record?')) {
                    try {
                        await db.collection('visitors').doc(btn.dataset.id).delete();
                        loadVisitors();
                    } catch (e) {
                        alert('Failed to delete. Try again.');
                    }
                }
            });
        });
    } catch (e) {
        console.error('Failed to load visitors:', e);
        list.innerHTML = '<p style="text-align:center;color:#ff4444;">Failed to load visitors. Check Firebase config.</p>';
    }
}

// Clear all visitors
document.getElementById('clearAllVisitors').addEventListener('click', async () => {
    if (!confirm('Delete ALL visitor records? This cannot be undone.')) return;

    try {
        const snapshot = await db.collection('visitors').get();
        const batch = db.batch();
        snapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        loadVisitors();
    } catch (e) {
        alert('Failed to clear visitors.');
    }
});

// ============================================
// ANNOUNCEMENT BANNER
// ============================================

async function loadAnnouncement() {
    try {
        const doc = await db.collection('siteData').doc('announcement').get();
        if (doc.exists) {
            const data = doc.data();
            if (data.enabled && data.text && data.text.trim()) {
                const banner = document.getElementById('announcementBanner');
                const textEl = document.getElementById('announcementText');
                textEl.textContent = data.text;
                banner.classList.remove('hidden');
            }
        }
    } catch (e) {
        console.error('Failed to load announcement:', e);
    }
}

// Close announcement banner
document.getElementById('announcementClose').addEventListener('click', () => {
    document.getElementById('announcementBanner').classList.add('hidden');
});

// Admin: Load site settings into admin form
async function loadSiteSettings() {
    try {
        // Load announcement
        const annDoc = await db.collection('siteData').doc('announcement').get();
        if (annDoc.exists) {
            const data = annDoc.data();
            document.getElementById('announcementInput').value = data.text || '';
            document.getElementById('announcementEnabled').checked = data.enabled || false;
        }
        // Load spotlight
        const spotDoc = await db.collection('siteData').doc('spotlight').get();
        if (spotDoc.exists) {
            const data = spotDoc.data();
            document.getElementById('spotlightName').value = data.name || '';
            document.getElementById('spotlightRole').value = data.role || '';
            document.getElementById('spotlightBio').value = data.bio || '';
        }
    } catch (e) {
        console.error('Failed to load site settings:', e);
    }
}

// Admin: Save announcement
document.getElementById('saveAnnouncement').addEventListener('click', async () => {
    const text = document.getElementById('announcementInput').value.trim();
    const enabled = document.getElementById('announcementEnabled').checked;
    try {
        await db.collection('siteData').doc('announcement').set({ text, enabled });
        alert('Announcement saved!');
        // Update live banner
        const banner = document.getElementById('announcementBanner');
        const textEl = document.getElementById('announcementText');
        if (enabled && text) {
            textEl.textContent = text;
            banner.classList.remove('hidden');
        } else {
            banner.classList.add('hidden');
        }
    } catch (e) {
        alert('Failed to save announcement.');
    }
});

// ============================================
// MEMBER SPOTLIGHT
// ============================================

async function loadSpotlight() {
    try {
        const doc = await db.collection('siteData').doc('spotlight').get();
        const container = document.getElementById('spotlightContainer');
        if (doc.exists && doc.data().name) {
            const data = doc.data();
            container.innerHTML = `
                <div class="spotlight-card glass-card scroll-reveal">
                    <div class="spotlight-avatar">
                        <div class="spotlight-avatar-inner">${data.name.charAt(0).toUpperCase()}</div>
                    </div>
                    <div class="spotlight-info">
                        <h3 class="spotlight-name">${data.name}</h3>
                        <p class="spotlight-role">${data.role || 'Member'}</p>
                        <p class="spotlight-bio">${data.bio || 'A valued member of the Espada clan.'}</p>
                    </div>
                    <div class="spotlight-glow"></div>
                </div>
            `;
            observeNewElements();
        } else {
            container.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.3);font-size:0.9rem;">No spotlight member set yet.</p>';
        }
    } catch (e) {
        console.error('Failed to load spotlight:', e);
    }
}

// Admin: Save spotlight
document.getElementById('saveSpotlight').addEventListener('click', async () => {
    const name = document.getElementById('spotlightName').value.trim();
    const role = document.getElementById('spotlightRole').value.trim();
    const bio = document.getElementById('spotlightBio').value.trim();
    try {
        await db.collection('siteData').doc('spotlight').set({ name, role, bio });
        alert('Spotlight saved!');
        loadSpotlight();
    } catch (e) {
        alert('Failed to save spotlight.');
    }
});

// Admin: Spotlight Live Search Auto-complete
const spotlightNameInput = document.getElementById('spotlightName');
const spotlightRoleInput = document.getElementById('spotlightRole');
const spotlightSearchResults = document.getElementById('spotlightSearchResults');

spotlightNameInput.addEventListener('input', () => {
    const query = spotlightNameInput.value.toLowerCase().trim();
    spotlightSearchResults.innerHTML = '';

    if (!query) {
        spotlightSearchResults.classList.remove('active');
        return;
    }

    // Flatten all members from all ranks
    let allMembers = [];
    if (ranksData && ranksData.length) {
        ranksData.forEach(tier => {
            if (tier.members && tier.members.length) {
                tier.members.forEach(m => {
                    allMembers.push({
                        name: m.name,
                        role: tier.title // Auto-guess the role from tier title
                    });
                });
            }
        });
    }

    // Filter based on query
    const matches = allMembers.filter(m => m.name.toLowerCase().includes(query));

    if (matches.length > 0) {
        matches.forEach(m => {
            const item = document.createElement('div');
            item.className = 'admin-search-result-item';
            item.innerHTML = `<span class="result-item-name">${m.name}</span><span class="result-item-rank">${m.role}</span>`;
            item.addEventListener('click', () => {
                spotlightNameInput.value = m.name;
                // Only autofill role if it's currently empty
                if (!spotlightRoleInput.value.trim()) {
                    spotlightRoleInput.value = `${m.role} Member`;
                }
                spotlightSearchResults.classList.remove('active');
            });
            spotlightSearchResults.appendChild(item);
        });
        spotlightSearchResults.classList.add('active');
    } else {
        spotlightSearchResults.classList.remove('active');
    }
});

// Close dropdown if clicked outside
document.addEventListener('click', (e) => {
    if (!spotlightNameInput.contains(e.target) && !spotlightSearchResults.contains(e.target)) {
        spotlightSearchResults.classList.remove('active');
    }
});

// ============================================
// THEME (Locked to Dark Mode)
// ============================================

function initThemeToggle() {
    // Theme toggle has been permanently removed by request. 
    // The site is now locked into the Premium Dark Neo-Bento aesthetic.
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('espada_theme', 'dark');
}

// ============================================
// SOUND EFFECTS (Web Audio API)
// ============================================

let audioCtx = null;
let soundMuted = localStorage.getItem('espada_sound_muted') === 'true';

function getAudioContext() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playHoverSound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
    } catch (e) { /* silent fail */ }
}

function playClickSound() {
    if (soundMuted) return;
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { /* silent fail */ }
}

function initSoundSystem() {
    const toggle = document.getElementById('soundToggle');
    const onIcon = toggle.querySelector('.sound-on');
    const offIcon = toggle.querySelector('.sound-off');

    // Restore muted state
    if (soundMuted) {
        onIcon.style.display = 'none';
        offIcon.style.display = 'block';
    }

    toggle.addEventListener('click', () => {
        soundMuted = !soundMuted;
        localStorage.setItem('espada_sound_muted', soundMuted);
        if (soundMuted) {
            onIcon.style.display = 'none';
            offIcon.style.display = 'block';
        } else {
            onIcon.style.display = 'block';
            offIcon.style.display = 'none';
            playClickSound();
        }
    });

    // Attach hover sounds to interactive elements
    const hoverTargets = '.nav-link, .cta-button, .glass-card, .admin-tab, .admin-add-btn, .admin-save-btn';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', playHoverSound);
    });

    // Attach click sounds to buttons and links
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a, button, .cta-button, .nav-link, .rank-card');
        if (target) playClickSound();
    });
}

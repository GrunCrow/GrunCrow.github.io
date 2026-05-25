// Social Media Page Script
function setupSocialNavigation() {
    const { initScrollSpy } = window.SiteUtils;

    const navLinks = document.querySelectorAll('.social-nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    initScrollSpy({
        linkSelector: '.social-nav-link',
        sectionSelector: '.social-section[id]',
        offset: 200,
        match: 'contains'
    });
}

const { escapeHtml, safeUrl } = window.SiteUtils;

// Fetch GitHub user information
const GITHUB_PROFILE_CACHE_KEY = 'gruncrow:github-profile';
const GITHUB_PROFILE_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function readCachedJson(cacheKey, ttlMs) {
    try {
        const raw = localStorage.getItem(cacheKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed.timestamp || !parsed.value) return null;
        if (Date.now() - parsed.timestamp > ttlMs) return null;
        return parsed.value;
    } catch {
        return null;
    }
}

function writeCachedJson(cacheKey, value) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            value
        }));
    } catch {
        // Ignore cache write errors (private mode/quota)
    }
}

function renderGitHubUser(user) {
    const container = document.getElementById('github-repos');
    if (!container) return;

    const avatarUrl = safeUrl(user.avatar_url);
    const safeName = escapeHtml(user.name || user.login || 'GitHub User');
    const safeBio = escapeHtml(user.bio || 'Developer & Open Source Enthusiast');
    const safePublicRepos = Number.isFinite(Number(user.public_repos)) ? Number(user.public_repos) : 0;
    const safeFollowers = Number.isFinite(Number(user.followers)) ? Number(user.followers) : 0;
    const safeFollowing = Number.isFinite(Number(user.following)) ? Number(user.following) : 0;
    const parsedDate = user.created_at ? new Date(user.created_at) : null;
    const memberSince = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate.toLocaleDateString() : 'N/A';
    const avatarHtml = avatarUrl ? `<img src="${avatarUrl}" alt="${safeName}" class="github-avatar">` : '';

    container.innerHTML = `
        <div class="github-info-card github-info-center">
        <div class="github-info-header github-info-header-vertical">
            ${avatarHtml}
            <div class="github-info-details github-info-center">
                <h4>${safeName}</h4>
                <p class="github-bio">${safeBio}</p>
                <div class="github-stats-inline github-stats-centered">
                    <div class="stat-item">
                    <span class="stat-num">${safePublicRepos}</span>
                    <span class="stat-label">Repositories</span>
                    </div>
                    <div class="stat-item">
                    <span class="stat-num">${safeFollowers}</span>
                    <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat-item">
                    <span class="stat-num">${safeFollowing}</span>
                    <span class="stat-label">Following</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="github-info-body github-info-center">
            <p><strong>Member Since:</strong> ${escapeHtml(memberSince)}</p>
        </div>
        </div>
    `;
}

function renderGitHubFallback() {
    const container = document.getElementById('github-repos');
    if (!container) return;

    container.innerHTML = `
        <div class="github-info-card">
            <h4>GitHub Profile</h4>
            <p class="meta-note github-fallback-note">
                Explore my open source projects, contributions, and collaborative work.
            </p>
            <div class="github-info-body">
                <ul class="github-fallback-list">
                    <li><strong>Languages:</strong> Python, C++, Java, SQL</li>
                    <li><strong>Focus Areas:</strong> AI, Computer vision, Data science</li>
                    <li><strong>Interests:</strong> Open Source, Ecology Tech, Deep Learning</li>
                </ul>
            </div>
            <a href="https://github.com/GrunCrow" target="_blank" rel="noopener noreferrer" class="github-profile-btn">
                <i class="fab fa-github"></i> Visit GitHub Profile
            </a>
        </div>
    `;
}

async function loadGitHubInfo() {
    const cachedUser = readCachedJson(GITHUB_PROFILE_CACHE_KEY, GITHUB_PROFILE_CACHE_TTL_MS);
    if (cachedUser && typeof cachedUser === 'object') {
        renderGitHubUser(cachedUser);
        return;
    }

    try {
        const res = await fetch('https://api.github.com/users/GrunCrow');
        if (!res.ok) {
            throw new Error(`GitHub API request failed (${res.status})`);
        }
        const user = await res.json();
        if (!user || typeof user !== 'object' || !user.login) {
            throw new Error('GitHub API returned an invalid profile payload');
        }
        writeCachedJson(GITHUB_PROFILE_CACHE_KEY, user);
        renderGitHubUser(user);
    } catch (err) {
        console.error('Error loading GitHub info:', err);
        renderGitHubFallback();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupSocialNavigation();
    loadGitHubInfo();
});
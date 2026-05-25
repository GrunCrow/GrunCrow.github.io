async function injectFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    try {
        const res = await fetch('footer.html');
        const html = await res.text();
        placeholder.innerHTML = html;

        initObfuscatedEmail();
        
        // Defer non-critical metadata fetch so content stays interactive sooner.
        runWhenIdle(fetchLastUpdated);
    } catch (e) {
        console.error('Footer load failed', e);
    }
}

function runWhenIdle(task) {
    if (typeof window.requestIdleCallback === 'function') {
        window.requestIdleCallback(() => task(), { timeout: 1500 });
        return;
    }
    window.setTimeout(task, 250);
}

const LAST_UPDATED_CACHE_KEY = 'gruncrow:last-updated';
const LAST_UPDATED_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

function initObfuscatedEmail() {
    const emailLink = document.getElementById('email-link');
    const emailText = document.getElementById('email-text');
    if (!emailLink || !emailText) return;

    // Build the email address at runtime to reduce trivial scraping from static HTML.
    const localPartCodes = [97, 108, 98, 97, 46, 109, 97, 114, 113, 117, 101, 122];
    const domainCodes = [117, 99, 97, 46, 101, 115];
    const localPart = String.fromCharCode(...localPartCodes);
    const domain = String.fromCharCode(...domainCodes);
    const email = `${localPart}@${domain}`;

    emailLink.href = `mailto:${email}`;
    emailText.textContent = email;
}

function readCachedValue(cacheKey, ttlMs) {
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

function writeCachedValue(cacheKey, value) {
    try {
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            value
        }));
    } catch {
        // Ignore cache write errors (private mode/quota)
    }
}

function updateLastUpdatedText(formattedDate) {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement && formattedDate) {
        lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
    }
}

async function fetchLastUpdated() {
    const cachedDate = readCachedValue(LAST_UPDATED_CACHE_KEY, LAST_UPDATED_CACHE_TTL_MS);
    if (cachedDate) {
        updateLastUpdatedText(cachedDate);
        return;
    }

    try {
        const fetchJson = window.SiteUtils && typeof window.SiteUtils.fetchJson === 'function'
            ? window.SiteUtils.fetchJson
            : null;
        const data = fetchJson
            ? await fetchJson('https://api.github.com/repos/GrunCrow/GrunCrow.github.io/commits?per_page=1', 'repository commits')
            : await (await fetch('https://api.github.com/repos/GrunCrow/GrunCrow.github.io/commits?per_page=1')).json();
        
        if (data && data.length > 0) {
            const lastCommitDate = new Date(data[0].commit.author.date);
            const formattedDate = lastCommitDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            writeCachedValue(LAST_UPDATED_CACHE_KEY, formattedDate);
            updateLastUpdatedText(formattedDate);
        }
    } catch (e) {
        console.error('Failed to fetch last update date', e);
    }
}

if (window.SiteUtils && typeof window.SiteUtils.onReady === 'function') {
    window.SiteUtils.onReady(injectFooter);
} else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFooter, { once: true });
} else {
    injectFooter();
}
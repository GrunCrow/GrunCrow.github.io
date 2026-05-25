(function () {
    const scrollSubscribers = new Set();
    let scrollListenerAttached = false;
    let scrollTicking = false;

    function notifyScrollSubscribers() {
        scrollTicking = false;
        scrollSubscribers.forEach((subscriber) => {
            try {
                subscriber();
            } catch (error) {
                console.error('Scroll subscriber failed', error);
            }
        });
    }

    function ensureSharedScrollListener() {
        if (scrollListenerAttached) return;
        scrollListenerAttached = true;

        window.addEventListener('scroll', () => {
            if (scrollTicking) return;
            scrollTicking = true;
            window.requestAnimationFrame(notifyScrollSubscribers);
        }, { passive: true });
    }

    function onReady(task) {
        if (typeof task !== 'function') return;

        if (window.SiteBootstrap && typeof window.SiteBootstrap.register === 'function') {
            window.SiteBootstrap.register(task);
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', task, { once: true });
            return;
        }

        task();
    }

    function onScrollFrame(callback, options) {
        if (typeof callback !== 'function') return function cleanup() {};

        const { runOnInit = true } = options || {};
        ensureSharedScrollListener();
        scrollSubscribers.add(callback);

        if (runOnInit) {
            callback();
        }

        return function cleanup() {
            scrollSubscribers.delete(callback);
        };
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function safeId(value) {
        return String(value ?? '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'item';
    }

    function safeUrl(value) {
        if (!value) return '';
        try {
            const raw = String(value).trim();
            // If the input has an explicit protocol, only allow web protocols.
            if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(raw)) {
                const absolute = new URL(raw);
                if (!['http:', 'https:'].includes(absolute.protocol)) return '';
                return escapeHtml(absolute.toString());
            }

            // Relative URLs are allowed for local assets (images/data files).
            const url = new URL(raw, window.location.href);
            if (!['http:', 'https:', 'file:'].includes(url.protocol)) return '';
            return escapeHtml(url.toString());
        } catch {
            return '';
        }
    }

    function normalizeImageAsset(asset, fallbackAlt = 'Image') {
        const defaultAlt = String(fallbackAlt ?? 'Image');

        if (typeof asset === 'string') {
            const url = safeUrl(asset);
            return url ? { url, alt: defaultAlt } : null;
        }

        if (!asset || typeof asset !== 'object') {
            return null;
        }

        const source = asset.src || asset.url || asset.path || '';
        const url = safeUrl(source);
        if (!url) return null;

        const alt = String(asset.alt || defaultAlt);
        return { url, alt };
    }

    function truncate(text, max = 52) {
        const raw = String(text ?? '');
        return raw.length > max ? raw.slice(0, max) + '…' : raw;
    }

    async function fetchJson(url, context = 'JSON resource') {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${context}: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    function initScrollSpy(options) {
        const {
            linkSelector,
            sectionSelector,
            offset = 120,
            match = 'exact',
            activeClass = 'active',
            runOnInit = true
        } = options || {};

        const links = Array.from(document.querySelectorAll(linkSelector || ''));
        const sections = Array.from(document.querySelectorAll(sectionSelector || ''));

        if (links.length === 0 || sections.length === 0) {
            return function cleanup() {};
        }

        function updateActive(currentId) {
            links.forEach((link) => {
                const href = link.getAttribute('href') || '';
                const isActive = match === 'contains'
                    ? (currentId && href.includes(currentId))
                    : href === `#${currentId}`;
                link.classList.toggle(activeClass, Boolean(isActive));
            });
        }

        function getCurrentSectionId() {
            let current = '';
            for (const section of sections) {
                const top = section.getBoundingClientRect().top + window.scrollY;
                if (window.scrollY >= top - offset) {
                    current = section.id;
                }
            }
            return current;
        }

        const onScroll = function () {
            updateActive(getCurrentSectionId());
        };

        const cleanupScroll = onScrollFrame(onScroll, { runOnInit: runOnInit });

        return function cleanup() {
            cleanupScroll();
        };
    }

    window.SiteUtils = {
        escapeHtml,
        safeId,
        safeUrl,
        normalizeImageAsset,
        truncate,
        fetchJson,
        onReady,
        onScrollFrame,
        initScrollSpy
    };
})();

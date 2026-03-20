(function () {
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
            const url = new URL(String(value), window.location.origin);
            if (!['http:', 'https:'].includes(url.protocol)) return '';
            return escapeHtml(url.toString());
        } catch {
            return '';
        }
    }

    function truncate(text, max = 52) {
        const raw = String(text ?? '');
        return raw.length > max ? raw.slice(0, max) + '…' : raw;
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

        let ticking = false;
        const onScroll = function () {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                updateActive(getCurrentSectionId());
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        if (runOnInit) {
            updateActive(getCurrentSectionId());
        }

        return function cleanup() {
            window.removeEventListener('scroll', onScroll);
        };
    }

    window.SiteUtils = {
        escapeHtml,
        safeId,
        safeUrl,
        truncate,
        initScrollSpy
    };
})();

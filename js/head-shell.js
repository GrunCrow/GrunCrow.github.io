(function initHeadShell() {
    function ensureHeadLink(selector, attributes) {
        if (document.head.querySelector(selector)) return;

        const link = document.createElement('link');
        Object.entries(attributes).forEach(([key, value]) => {
            if (value === true) {
                link.setAttribute(key, '');
                return;
            }
            link.setAttribute(key, String(value));
        });

        document.head.appendChild(link);
    }

    ensureHeadLink('link[rel="preconnect"][href="https://cdnjs.cloudflare.com"]', {
        rel: 'preconnect',
        href: 'https://cdnjs.cloudflare.com',
        crossorigin: true
    });

    ensureHeadLink('link[rel="preconnect"][href="https://www.googletagmanager.com"]', {
        rel: 'preconnect',
        href: 'https://www.googletagmanager.com'
    });

    ensureHeadLink('link[rel="stylesheet"][href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"]', {
        rel: 'stylesheet',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
    });
})();

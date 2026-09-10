(function renderSharedHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <header>
            <div class="header-brand">
                <h1>Alba M&aacute;rquez-Rodr&iacute;guez</h1>
                <h2>Computer scientist specialized in Artificial Intelligence</h2>
                <p>Passionate about AI, Deep Learning, and Data Analysis</p>
                <p>for ecology and conservation.</p>
            </div>
            <button class="nav-toggle" type="button" aria-label="Toggle navigation" aria-expanded="false">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav class="site-nav" aria-label="Main navigation">
                <ul>
                    <li><a href="index.html">Home</a></li>
                    <li><a href="projects.html">Projects</a></li>
                    <li><a href="publications.html">Publications</a></li>
                    <li><a href="congresses.html">Congresses</a></li>
                    <li><a href="events.html">Talks & Events</a></li>
                    <li><a href="cv.html">CV</a></li>
                    <li><a href="social.html">Social Media</a></li>
                </ul>
            </nav>
        </header>
    `;

    const navToggle = document.querySelector('.nav-toggle');
    const siteNav = document.querySelector('.site-nav');
    if (!navToggle || !siteNav) return;

    const closeNav = () => {
        navToggle.setAttribute('aria-expanded', 'false');
        siteNav.classList.remove('is-open');
    };

    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', String(!isExpanded));
        siteNav.classList.toggle('is-open', !isExpanded);
    });

    siteNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeNav);
    });
})();

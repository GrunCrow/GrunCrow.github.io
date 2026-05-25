(function renderSharedHeader() {
    const placeholder = document.getElementById('header-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
        <header>
            <div>
                <h1>Alba M&aacute;rquez-Rodr&iacute;guez</h1>
                <h2>Computer scientist specialized in Artificial Intelligence</h2>
                <p>Passionate about AI, Deep Learning, and Data Analysis</p>
                <p>for ecology and conservation.</p>
            </div>
            <nav>
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
})();

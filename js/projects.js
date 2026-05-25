const { escapeHtml, safeId, safeUrl, normalizeImageAsset, truncate, fetchJson, initScrollSpy, onReady } = window.SiteUtils;

async function loadProjects() {
    const container = document.getElementById('projects-container');
    const nav = document.getElementById('projects-nav');
    if (!container) return;

    try {
        const items = await fetchJson('data/projects.json', 'projects data');

        const research = items.filter(p => p.type === 'research');
        const personal = items.filter(p => p.type === 'personal');

        // Build navigation
        if (nav) {
            nav.innerHTML = `
                <a class="section-link" href="#research-projects"><i class="fas fa-university"></i> Research Projects</a>
                ${research.map(p => `<a class="project-link" href="#${safeId(p.id)}-project">${escapeHtml(truncate(p.title))}</a>`).join('')}
                <a class="section-link section-link-spaced" href="#personal-projects"><i class="fas fa-code"></i> Personal Projects</a>
                ${personal.map(p => `<a class="project-link" href="#${safeId(p.id)}-project">${escapeHtml(truncate(p.title))}</a>`).join('')}
            `;
        }

        // Build content
        container.innerHTML = `
            <section id="intro" class="card">
                <h2>Projects</h2>
                <p class="meta-note">Research collaborations, field-facing tools, and applied machine learning work for biodiversity monitoring and ecological data analysis.</p>
            </section>
            <section id="research-projects">
                <h2><i class="fas fa-university section-title-icon"></i> Research Projects</h2>
                <p class="meta-note section-intro-note">Collaborative research initiatives with academic institutions and conservation organizations.</p>
                ${research.map(renderProject).join('')}
            </section>
            <section id="personal-projects">
                <h2><i class="fas fa-code section-title-icon"></i> Personal Projects & Theses</h2>
                <p class="meta-note section-intro-note">Academic work and open-source tools developed for ecological monitoring.</p>
                ${personal.map(renderProject).join('')}
            </section>
        `;

        setupProjectInteractions(container);

        initScrollSpy({
            linkSelector: '.projects-sidebar a',
            sectionSelector: 'section[id], .project-box[id]',
            offset: 120
        });
    } catch (err) {
        if (container) container.innerHTML = '<p>Could not load projects.</p>';
        console.error(err);
    }
}

function renderProject(proj) {
    const projectId = safeId(proj.id);
    const statusBadge = proj.status === 'ongoing'
        ? '<span class="pill pill--success"><i class="fas fa-spinner"></i> Ongoing</span>'
        : '<span class="pill pill--info"><i class="fas fa-check"></i> Completed</span>';

    const typeBadge = proj.type === 'research'
        ? '<span class="pill pill--info"><i class="fas fa-university"></i> Research</span>'
        : '<span class="pill pill--warning"><i class="fas fa-code"></i> Personal</span>';

    const logoUrl = safeUrl(proj.logo);
    const logo = logoUrl ? `<img src="${logoUrl}" alt="${escapeHtml(proj.title)} Logo" class="project-title-logo">` : '';

    const images = proj.images && proj.images.length
        ? `<div class="project-images project-images-rectangles">
                ${proj.images.map(img => {
                    const imageAsset = normalizeImageAsset(img, proj.title);
                    return imageAsset ? `<img src="${imageAsset.url}" alt="${escapeHtml(imageAsset.alt)}" loading="lazy" decoding="async">` : '';
                }).join('')}
           </div>` : '';

    // Description with "read more" functionality
    const isLongDescription = proj.description && proj.description.length > 300;
    const shortDescription = isLongDescription ? proj.description.substring(0, 300) + '...' : proj.description;
    const descriptionId = `desc-${projectId}`;
    
    const description = isLongDescription
        ? `<div>
                <p id="${descriptionId}-short" class="project-description">${escapeHtml(shortDescription)}
                    <a href="#" class="project-toggle-link" data-hide-target="${descriptionId}-short" data-show-target="${descriptionId}-full"> Read more</a>
                </p>
                <p id="${descriptionId}-full" class="project-description project-hidden">${escapeHtml(proj.description)}
                    <a href="#" class="project-toggle-link" data-hide-target="${descriptionId}-full" data-show-target="${descriptionId}-short"> Read less</a>
                </p>
           </div>`
        : `<p class="project-description">${escapeHtml(proj.description || '')}</p>`;

    // Objectives with "read more"
    const objectives = proj.objectives && proj.objectives.length
        ? `<div class="project-collapsible-section">
                <h4 class="project-collapsible-title">
                    <button type="button" class="project-collapsible-trigger" data-toggle-target="obj-${projectId}" aria-expanded="false" aria-controls="obj-${projectId}">
                        <i class="fas fa-chevron-down" aria-hidden="true"></i>Objectives
                    </button>
                </h4>
                <ol id="obj-${projectId}" class="project-collapsible-list project-hidden" hidden>${proj.objectives.map(o => `<li class="project-collapsible-item">${escapeHtml(o)}</li>`).join('')}</ol>
           </div>` : '';

    // Tasks with "read more"
    const tasks = proj.tasks && proj.tasks.length
        ? `<div class="project-collapsible-section">
                <h4 class="project-collapsible-title">
                    <button type="button" class="project-collapsible-trigger" data-toggle-target="task-${projectId}" aria-expanded="false" aria-controls="task-${projectId}">
                        <i class="fas fa-chevron-down" aria-hidden="true"></i>Contributions
                    </button>
                </h4>
                <ul id="task-${projectId}" class="project-collapsible-list project-hidden" hidden>${proj.tasks.map(t => `<li class="project-collapsible-item">${escapeHtml(t)}</li>`).join('')}</ul>
           </div>` : '';

    const tags = proj.tags && proj.tags.length
        ? `<div class="project-tags">
                ${proj.tags.map(tag => `<span class="pill">${escapeHtml(tag)}</span>`).join('')}
           </div>` : '';

    const links = proj.links && proj.links.length
        ? `<div class="project-links">
                ${proj.links.map(link => {
                    const linkUrl = safeUrl(link.url);
                    const icon = link.type === 'github' ? 'fab fa-github'
                               : link.type === 'pdf' ? 'far fa-file-pdf'
                               : 'fas fa-external-link-alt';
                    if (!linkUrl) return '';
                    return `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="button secondary-button small-button"><i class="${icon}"></i> ${escapeHtml(link.label || 'Link')}</a>`;
                }).join('')}
           </div>` : '';

    return `
        <div id="${projectId}-project" class="project-box ${proj.featured ? 'featured-card' : ''}">
            <div class="project-head">
                <div class="project-head-main">
                    <div class="project-title-row">
                        ${logo}
                        <h3 class="project-title">${escapeHtml(proj.title)}</h3>
                    </div>
                    <h4 class="project-org">${escapeHtml(proj.organization || '')}</h4>
                    ${proj.authors ? `<h5 class="project-authors">Authors: ${escapeHtml(proj.authors)}</h5>` : ''}
                    <h6 class="project-period">${escapeHtml(proj.period || '')}</h6>
                </div>
                <div class="project-head-badges">
                    ${statusBadge}
                    ${typeBadge}
                </div>
            </div>

            ${description}
            
            ${tags}
            ${objectives}
            ${tasks}
            ${images}
            ${links}
        </div>
    `;
}

function setupProjectInteractions(container) {
    container.addEventListener('click', (event) => {
        const toggleLink = event.target.closest('[data-hide-target][data-show-target]');
        if (toggleLink) {
            event.preventDefault();
            const hideTarget = document.getElementById(toggleLink.dataset.hideTarget);
            const showTarget = document.getElementById(toggleLink.dataset.showTarget);
            if (hideTarget) {
                hideTarget.style.display = 'none';
                hideTarget.classList.add('project-hidden');
            }
            if (showTarget) {
                showTarget.style.display = '';
                showTarget.classList.remove('project-hidden');
            }
            return;
        }

        const headingToggle = event.target.closest('.project-collapsible-trigger[data-toggle-target]');
        if (!headingToggle) return;

        const target = document.getElementById(headingToggle.dataset.toggleTarget);
        if (!target) return;

        const currentlyHidden = target.classList.contains('project-hidden') || target.hasAttribute('hidden') || getComputedStyle(target).display === 'none';
        if (currentlyHidden) {
            target.hidden = false;
            target.classList.remove('project-hidden');
            headingToggle.setAttribute('aria-expanded', 'true');
        } else {
            target.hidden = true;
            target.classList.add('project-hidden');
            headingToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

onReady(loadProjects);
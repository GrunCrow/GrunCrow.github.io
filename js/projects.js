async function loadProjects() {
    const container = document.getElementById('projects-container');
    const nav = document.getElementById('projects-nav');
    if (!container) return;

    try {
        const res = await fetch('data/projects.json');
        const items = await res.json();

        const research = items.filter(p => p.type === 'research');
        const personal = items.filter(p => p.type === 'personal');

        // Build navigation
        if (nav) {
            nav.innerHTML = `
                <a class="section-link" href="#research-projects"><i class="fas fa-university"></i> Research Projects</a>
                ${research.map(p => `<a class="project-link" href="#${p.id}-project">${truncate(p.title)}</a>`).join('')}
                <a class="section-link section-link-spaced" href="#personal-projects"><i class="fas fa-code"></i> Personal Projects</a>
                ${personal.map(p => `<a class="project-link" href="#${p.id}-project">${truncate(p.title)}</a>`).join('')}
            `;
        }

        // Build content
        container.innerHTML = `
            <section id="intro" class="card">
                <h2>Projects</h2>
                <p class="meta-note">Explore my work at the intersection of AI, Computer Vision, and biodiversity conservation.</p>
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

        setupScrollSpy();
    } catch (err) {
        if (container) container.innerHTML = '<p>Could not load projects.</p>';
        console.error(err);
    }
}

function renderProject(proj) {
    const statusBadge = proj.status === 'ongoing'
        ? '<span class="pill pill--success"><i class="fas fa-spinner"></i> Ongoing</span>'
        : '<span class="pill pill--info"><i class="fas fa-check"></i> Completed</span>';

    const typeBadge = proj.type === 'research'
        ? '<span class="pill pill--info"><i class="fas fa-university"></i> Research</span>'
        : '<span class="pill pill--warning"><i class="fas fa-code"></i> Personal</span>';

    const logo = proj.logo ? `<img src="${proj.logo}" alt="${proj.title} Logo" class="project-title-logo">` : '';

    const images = proj.images && proj.images.length
        ? `<div class="project-images project-images-rectangles">
                ${proj.images.map(img => `<img src="${img}" alt="${proj.title}" loading="lazy">`).join('')}
           </div>` : '';

    // Description with "read more" functionality
    const isLongDescription = proj.description && proj.description.length > 300;
    const shortDescription = isLongDescription ? proj.description.substring(0, 300) + '...' : proj.description;
    const descriptionId = `desc-${proj.id}`;
    
    const description = isLongDescription
        ? `<div>
                <p id="${descriptionId}-short" class="project-description">${shortDescription}
                    <a href="#" onclick="document.getElementById('${descriptionId}-short').style.display='none'; document.getElementById('${descriptionId}-full').style.display='block'; return false;" class="project-toggle-link"> Read more</a>
                </p>
                <p id="${descriptionId}-full" class="project-description project-hidden">${proj.description}
                    <a href="#" onclick="document.getElementById('${descriptionId}-full').style.display='none'; document.getElementById('${descriptionId}-short').style.display='block'; return false;" class="project-toggle-link"> Read less</a>
                </p>
           </div>`
        : `<p class="project-description">${proj.description || ''}</p>`;

    // Objectives with "read more"
    const objectives = proj.objectives && proj.objectives.length
        ? `<div class="project-collapsible-section">
                <h4 class="project-collapsible-title" onclick="document.getElementById('obj-${proj.id}').style.display = document.getElementById('obj-${proj.id}').style.display === 'none' ? 'block' : 'none';">
                    <i class="fas fa-chevron-down"></i>Objectives
                </h4>
                <ol id="obj-${proj.id}" class="project-collapsible-list project-hidden">${proj.objectives.map(o => `<li class="project-collapsible-item">${o}</li>`).join('')}</ol>
           </div>` : '';

    // Tasks with "read more"
    const tasks = proj.tasks && proj.tasks.length
        ? `<div class="project-collapsible-section">
                <h4 class="project-collapsible-title" onclick="document.getElementById('task-${proj.id}').style.display = document.getElementById('task-${proj.id}').style.display === 'none' ? 'block' : 'none';">
                    <i class="fas fa-chevron-down"></i>Contributions
                </h4>
                <ul id="task-${proj.id}" class="project-collapsible-list project-hidden">${proj.tasks.map(t => `<li class="project-collapsible-item">${t}</li>`).join('')}</ul>
           </div>` : '';

    const tags = proj.tags && proj.tags.length
        ? `<div class="project-tags">
                ${proj.tags.map(tag => `<span class="pill">${tag}</span>`).join('')}
           </div>` : '';

    const links = proj.links && proj.links.length
        ? `<div class="project-links">
                ${proj.links.map(link => {
                    const icon = link.type === 'github' ? 'fab fa-github'
                               : link.type === 'pdf' ? 'far fa-file-pdf'
                               : 'fas fa-external-link-alt';
                    return `<a href="${link.url}" target="_blank" rel="noopener" class="project-link-cta"><i class="${icon}"></i> ${link.label || 'Link'}</a>`;
                }).join('')}
           </div>` : '';

    return `
        <div id="${proj.id}-project" class="project-box ${proj.featured ? 'featured-card' : ''}">
            <div class="project-head">
                <div class="project-head-main">
                    <div class="project-title-row">
                        ${logo}
                        <h3 class="project-title">${proj.title}</h3>
                    </div>
                    <h4 class="project-org">${proj.organization || ''}</h4>
                    ${proj.authors ? `<h5 class="project-authors">Authors: ${proj.authors}</h5>` : ''}
                    <h6 class="project-period">${proj.period || ''}</h6>
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

function truncate(text, max = 52) {
    return text.length > max ? text.slice(0, max) + '…' : text;
}

function setupScrollSpy() {
    const links = document.querySelectorAll('.projects-sidebar a');
    const targets = document.querySelectorAll('section[id], .project-box[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        targets.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) {
                current = sec.id;
            }
        });
        links.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
        });
    });
}

document.addEventListener('DOMContentLoaded', loadProjects);
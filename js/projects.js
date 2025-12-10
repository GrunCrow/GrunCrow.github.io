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
                <a class="section-link" href="#personal-projects" style="margin-top:8px;"><i class="fas fa-code"></i> Personal Projects</a>
                ${personal.map(p => `<a class="project-link" href="#${p.id}-project">${truncate(p.title)}</a>`).join('')}
            `;
        }

        // Build content
        container.innerHTML = `
            <section id="intro" class="card">
                <h2>Projects</h2>
                <p>Explore my work at the intersection of AI, Computer Vision, and biodiversity conservation.</p>
            </section>
            <section id="research-projects">
                <h2><i class="fas fa-university" style="color: var(--primary);"></i> Research Projects</h2>
                <p style="color: var(--muted); margin-bottom: 16px;">Collaborative research initiatives with academic institutions and conservation organizations.</p>
                ${research.map(renderProject).join('')}
            </section>
            <section id="personal-projects">
                <h2><i class="fas fa-code" style="color: var(--primary);"></i> Personal Projects & Theses</h2>
                <p style="color: var(--muted); margin-bottom: 16px;">Academic work and open-source tools developed for ecological monitoring.</p>
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
        ? '<span class="pill" style="background:#e8f5e9;color:#2e7d32;border-color:#c8e6c9;">Ongoing</span>'
        : '<span class="pill" style="background:#e3f2fd;color:#1565c0;border-color:#bbdefb;">Completed</span>';

    const logo = proj.logo ? `<img src="${proj.logo}" alt="${proj.title} Logo">` : '';

    const images = proj.images && proj.images.length
        ? `<div class="project-images project-images-rectangles">
                ${proj.images.map(img => `<img src="${img}" alt="${proj.title}" loading="lazy">`).join('')}
           </div>` : '';

    const tasks = proj.tasks && proj.tasks.length
        ? `<h4>Contributions:</h4><ul>${proj.tasks.map(t => `<li>${t}</li>`).join('')}</ul>` : '';

    const objectives = proj.objectives && proj.objectives.length
        ? `<h4>Objectives:</h4><ol>${proj.objectives.map(o => `<li>${o}</li>`).join('')}</ol>` : '';

    const tags = proj.tags && proj.tags.length
        ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
                ${proj.tags.map(tag => `<span class="pill">${tag}</span>`).join('')}
           </div>` : '';

    const links = proj.links && proj.links.length
        ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:14px;">
                ${proj.links.map(link => {
                    const icon = link.type === 'github' ? 'fab fa-github'
                               : link.type === 'pdf' ? 'far fa-file-alt'
                               : 'fas fa-link';
                    return `<a href="${link.url}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:none;font-weight:600;"><i class="${icon}"></i> ${link.label || 'Link'}</a>`;
                }).join('')}
           </div>` : '';

    return `
        <div id="${proj.id}-project" class="project-box ${proj.featured ? 'featured-card' : ''}">
            <div class="project-header">
                <h3>${logo}${proj.title}</h3>
                <div class="project-info">
                    <h4>${proj.organization || ''}</h4>
                    ${proj.authors ? `<h5>Authors: ${proj.authors}</h5>` : ''}
                    <h6>${proj.period || ''} ${statusBadge}</h6>
                </div>
            </div>
            ${tags}
            <p>${proj.description || ''}</p>
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
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
                <p style="line-height: 1.6; color: var(--muted);">Explore my work at the intersection of AI, Computer Vision, and biodiversity conservation.</p>
            </section>
            <section id="research-projects">
                <h2 style="color: var(--primary);"><i class="fas fa-university"></i> Research Projects</h2>
                <p style="color: var(--muted); margin-bottom: 20px; line-height: 1.6;">Collaborative research initiatives with academic institutions and conservation organizations.</p>
                ${research.map(renderProject).join('')}
            </section>
            <section id="personal-projects">
                <h2 style="color: var(--primary);"><i class="fas fa-code"></i> Personal Projects & Theses</h2>
                <p style="color: var(--muted); margin-bottom: 20px; line-height: 1.6;">Academic work and open-source tools developed for ecological monitoring.</p>
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
        ? '<span class="pill" style="background:#e8f5e9;color:#2e7d32;border-color:#c8e6c9;"><i class="fas fa-spinner"></i> Ongoing</span>'
        : '<span class="pill" style="background:#e3f2fd;color:#1565c0;border-color:#bbdefb;"><i class="fas fa-check"></i> Completed</span>';

    const typeBadge = proj.type === 'research'
        ? '<span class="pill" style="background:#e3f2fd;color:#1565c0;border-color:#bbdefb;"><i class="fas fa-university"></i> Research</span>'
        : '<span class="pill" style="background:#fff3e0;color:#e65100;border-color:#ffe0b2;"><i class="fas fa-code"></i> Personal</span>';

    const logo = proj.logo ? `<img src="${proj.logo}" alt="${proj.title} Logo" style="width: 40px; height: 28px; object-fit: contain; margin: 0; flex-shrink: 0;">` : '';

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
                <p id="${descriptionId}-short" style="margin: 14px 0; line-height: 1.6; color: var(--text);">${shortDescription}
                    <a href="#" onclick="document.getElementById('${descriptionId}-short').style.display='none'; document.getElementById('${descriptionId}-full').style.display='block'; return false;" style="color: var(--primary); font-weight: 600; text-decoration: none;"> Read more</a>
                </p>
                <p id="${descriptionId}-full" style="display: none; margin: 14px 0; line-height: 1.6; color: var(--text);">${proj.description}
                    <a href="#" onclick="document.getElementById('${descriptionId}-full').style.display='none'; document.getElementById('${descriptionId}-short').style.display='block'; return false;" style="color: var(--primary); font-weight: 600; text-decoration: none;"> Read less</a>
                </p>
           </div>`
        : `<p style="margin: 14px 0; line-height: 1.6; color: var(--text);">${proj.description || ''}</p>`;

    // Objectives with "read more"
    const objectives = proj.objectives && proj.objectives.length
        ? `<div style="margin-top: 20px;">
                <h4 style="margin-top: 0; color: var(--primary); cursor: pointer;" onclick="document.getElementById('obj-${proj.id}').style.display = document.getElementById('obj-${proj.id}').style.display === 'none' ? 'block' : 'none';">
                    <i class="fas fa-chevron-down" style="margin-right: 6px; font-size: 0.8rem;"></i>Objectives
                </h4>
                <ol id="obj-${proj.id}" style="display: none; margin: 8px 0; padding-left: 20px; color: var(--muted);">${proj.objectives.map(o => `<li style="margin-bottom: 6px; line-height: 1.5;">${o}</li>`).join('')}</ol>
           </div>` : '';

    // Tasks with "read more"
    const tasks = proj.tasks && proj.tasks.length
        ? `<div style="margin-top: 20px;">
                <h4 style="margin-top: 0; color: var(--primary); cursor: pointer;" onclick="document.getElementById('task-${proj.id}').style.display = document.getElementById('task-${proj.id}').style.display === 'none' ? 'block' : 'none';">
                    <i class="fas fa-chevron-down" style="margin-right: 6px; font-size: 0.8rem;"></i>Contributions
                </h4>
                <ul id="task-${proj.id}" style="display: none; margin: 8px 0; padding-left: 20px; color: var(--muted);">${proj.tasks.map(t => `<li style="margin-bottom: 6px; line-height: 1.5;">${t}</li>`).join('')}</ul>
           </div>` : '';

    const tags = proj.tags && proj.tags.length
        ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;">
                ${proj.tags.map(tag => `<span class="pill">${tag}</span>`).join('')}
           </div>` : '';

    const links = proj.links && proj.links.length
        ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:18px;">
                ${proj.links.map(link => {
                    const icon = link.type === 'github' ? 'fab fa-github'
                               : link.type === 'pdf' ? 'far fa-file-pdf'
                               : 'fas fa-external-link-alt';
                    return `<a href="${link.url}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:none;font-weight:600;display:inline-flex;align-items:center;gap:6px;"><i class="${icon}"></i> ${link.label || 'Link'}</a>`;
                }).join('')}
           </div>` : '';

    return `
        <div id="${proj.id}-project" class="project-box ${proj.featured ? 'featured-card' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                        ${logo}
                        <h3 style="margin: 0;">${proj.title}</h3>
                    </div>
                    <h4 style="margin: 4px 0; color: var(--primary);">${proj.organization || ''}</h4>
                    ${proj.authors ? `<h5 style="margin: 2px 0; color: var(--muted); font-weight: 500;">Authors: ${proj.authors}</h5>` : ''}
                    <h6 style="margin: 6px 0 0 0; color: var(--muted); font-size: 0.9rem;">${proj.period || ''}</h6>
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; align-items: flex-end;">
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
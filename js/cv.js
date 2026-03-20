async function loadCV() {
    try {
        const res = await fetch('data/cv.json');
        const cv = await res.json();

        // Load profile
        loadProfile(cv.profile);

        // Load sections
        loadExperience(cv.experience);
        loadEducation(cv.education);
        loadCertifications(cv.certifications);
        loadPublicationsSummary();
        loadSkills(cv.skills);
        loadVolunteering(cv.volunteering);

        // Initialize scroll-spy
        setupScrollSpy();
    } catch (err) {
        console.error('Error loading CV:', err);
    }
}

function loadProfile(profile) {
    const sidebar = document.querySelector('.cv-profile');
    if (sidebar) {
        sidebar.innerHTML = `
            <img src="${safeUrl(profile.image)}" alt="${escapeHtml(profile.name)}" class="cv-profile-image">
            <h2>${escapeHtml(profile.name)}</h2>
            <p class="cv-title">${escapeHtml(profile.title)}</p>
            <p class="cv-subtitle">${escapeHtml(profile.subtitle)}</p>
        `;
    }
}

function getPillClass(isPresent) {
    return isPresent ? 'pill pill--warning' : 'pill pill--info';
}

function formatWorkType(workType) {
    if (!workType) return '';
    if (workType === 'onsite') return 'On-site';
    return workType.charAt(0).toUpperCase() + workType.slice(1);
}

function renderMetaPills(item) {
    const parts = [];

    if (item.workType) {
        parts.push(`<span class="pill pill--accent"><i class="fas fa-laptop-house"></i> ${formatWorkType(item.workType)}</span>`);
    }

    if (item.location) {
        parts.push(`<span class="pill pill--success"><i class="fas fa-map-marker-alt"></i> ${item.location}</span>`);
    }

    if (parts.length === 0) return '';
    return `<div class="cv-meta-pills">${parts.join('')}</div>`;
}

function loadExperience(items) {
    const container = document.getElementById('experience-content');
    if (!container) return;

    container.innerHTML = items.map(item => renderExperienceEntry(item)).join('');
}

function renderExperienceEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const project = item.project 
        ? `<p class="cv-project"><strong>Project:</strong> <a href="${safeUrl(item.project.link)}">${escapeHtml(item.project.title)}</a></p>`
        : '';
    
    const responsibilities = item.responsibilities.length > 0
        ? `<ul class="cv-responsibilities">${item.responsibilities.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
        : '';

    const metaPills = renderMetaPills(item);

    return `
        <div class="cv-entry ${item.featured ? 'featured-card' : ''}">
            <div class="cv-entry-header">
                <div>
                    <h3>${escapeHtml(item.position)}</h3>
                    <p class="cv-organization">${escapeHtml(item.organization)}</p>
                </div>
                <div class="cv-period">${pill}${metaPills}</div>
            </div>
            ${project}
            ${responsibilities}
        </div>
    `;
}

function loadEducation(items) {
    const container = document.getElementById('education-content');
    if (!container) return;

    container.innerHTML = items.map(item => renderEducationEntry(item)).join('');
}

function renderEducationEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-graduation-cap"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const details = item.details && item.details.length > 0
        ? `<ul class="cv-responsibilities">${item.details.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
        : '';

    const metaPills = renderMetaPills(item);

    return `
        <div class="cv-entry ${item.featured ? 'featured-card' : ''}">
            <div class="cv-entry-header">
                <div>
                    <h3>${escapeHtml(item.degree)}</h3>
                    <p class="cv-organization">${escapeHtml(item.institution)}</p>
                </div>
                <div class="cv-period">${pill}${metaPills}</div>
            </div>
            ${details}
        </div>
    `;
}

function loadCertifications(items) {
    const container = document.getElementById('certifications-content');
    if (!container) return;

    container.innerHTML = items.map(item => renderCertificationEntry(item)).join('');
}

function renderCertificationEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-certificate"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const description = item.description
        ? `<p class="cv-description">${escapeHtml(item.description)}</p>`
        : '';
    
    const projects = item.projects && item.projects.length > 0
        ? `<ul class="cv-responsibilities">${item.projects.map(p => {
            const isLink = typeof p === 'object' && p.link;
            return `<li>${isLink ? `<a href="${safeUrl(p.link)}">${escapeHtml(p.title)}</a>` : escapeHtml(p)}</li>`;
        }).join('')}</ul>`
        : '';

    const metaPills = renderMetaPills(item);

    return `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <h3>${escapeHtml(item.title)}</h3>
                    <p class="cv-organization">${escapeHtml(item.institution)}</p>
                </div>
                <div class="cv-period">${pill}${metaPills}</div>
            </div>
            ${description}
            ${projects}
        </div>
    `;
}

function loadSkills(items) {
    const container = document.getElementById('skills-content');
    if (!container) return;

    container.innerHTML = `<div class="cv-skills-grid">
        ${items.map(skill => `
            <div class="cv-skill-card">
                <h4><i class="fas ${escapeHtml(skill.icon)}"></i> ${escapeHtml(skill.category)}</h4>
                <ul>
                    ${skill.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>`;
}

async function loadPublicationsSummary() {
    const container = document.getElementById('publications-content');
    if (!container) return;

    try {
        const res = await fetch('data/publications.json');
        const publications = await res.json();

        const recent = publications.slice(0, 5);

        container.innerHTML = `
            <p class="cv-description">Selected recent publications from my research profile. For the complete list, visit the full publications section.</p>
            <div class="cv-publications-list">
                ${recent.map(pub => {
                    const venue = pub.journal ? `${pub.journal}${pub.editorial ? ` (${pub.editorial})` : ''}` : '';
                    const title = pub.doi
                        ? `<a href="${safeUrl(pub.doi)}" target="_blank" rel="noopener noreferrer">${escapeHtml(pub.title)}</a>`
                        : escapeHtml(pub.title);

                    return `
                        <div class="cv-entry">
                            <h3>${title}</h3>
                            <p class="cv-organization">${escapeHtml(venue)}</p>
                            <div class="cv-meta-pills">
                                ${pub.date ? `<span class="pill pill--info"><i class="far fa-calendar"></i> ${escapeHtml(pub.date)}</span>` : ''}
                                ${pub.type ? `<span class="pill pill--accent"><i class="fas fa-file-alt"></i> ${escapeHtml(pub.type.charAt(0).toUpperCase() + pub.type.slice(1))}</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
            <p class="meta-note cv-publications-cta-wrap">
                <a href="publications.html#all-publications-section" class="cv-link-cta">
                    <i class="fas fa-external-link-alt"></i> View all publications
                </a>
            </p>
        `;
    } catch (err) {
        container.innerHTML = `
            <p class="cv-description">Publications are available in the dedicated section.</p>
            <p><a href="publications.html#all-publications-section" class="cv-link-cta"><i class="fas fa-external-link-alt"></i> Open publications</a></p>
        `;
        console.error('Error loading publications summary:', err);
    }
}

function loadVolunteering(items) {
    const container = document.getElementById('volunteering-content');
    if (!container) return;

    container.innerHTML = items.map(item => renderVolunteeringEntry(item)).join('');
}

function renderVolunteeringEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const description = item.description
        ? `<p class="cv-description">${item.description}</p>`
        : '';

    return `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <h3>${escapeHtml(item.position)}</h3>
                    ${item.organization ? `<p class="cv-organization">${escapeHtml(item.organization)}</p>` : ''}
                </div>
                <div class="cv-period">${pill}</div>
            </div>
            ${description}
        </div>
    `;
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

function setupScrollSpy() {
    const links = document.querySelectorAll('.cv-nav-link');
    const sections = document.querySelectorAll('[id$="-content"]');

    function highlightNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id').replace('-content', '');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (current && link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    // Don't call highlightNav() on page load, wait for user to scroll
}

document.addEventListener('DOMContentLoaded', loadCV);
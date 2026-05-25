const { escapeHtml, safeUrl, fetchJson, initScrollSpy, onReady } = window.SiteUtils;

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function safeLinkOrNull(value) {
    const url = safeUrl(value);
    return url || null;
}

async function loadCV() {
    try {
        const cv = await fetchJson('data/cv.json', 'cv data');

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
        initScrollSpy({
            linkSelector: '.cv-nav-link',
            sectionSelector: '.cv-section[id]',
            offset: 200,
            runOnInit: false
        });
    } catch (err) {
        console.error('Error loading CV:', err);
    }
}

function loadProfile(profile) {
    const sidebar = document.querySelector('.cv-profile');
    if (sidebar) {
        const name = profile?.name || 'Profile';
        const imageUrl = safeLinkOrNull(profile?.image);
        sidebar.innerHTML = `
            ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(name)}" class="cv-profile-image">` : ''}
            <h2>${escapeHtml(name)}</h2>
            <p class="cv-title">${escapeHtml(profile?.title || '')}</p>
            <p class="cv-subtitle">${escapeHtml(profile?.subtitle || '')}</p>
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
        parts.push(`<span class="pill pill--success"><i class="fas fa-map-marker-alt"></i> ${escapeHtml(item.location)}</span>`);
    }

    if (parts.length === 0) return '';
    return `<div class="cv-meta-pills">${parts.join('')}</div>`;
}

function loadExperience(items) {
    const container = document.getElementById('experience-content');
    if (!container) return;

    container.innerHTML = asArray(items).map(item => renderExperienceEntry(item)).join('');
}

function renderExperienceEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}</span>`;
    const positionLink = safeLinkOrNull(item?.link);
    const projectTitle = item?.project?.title || '';
    const projectLink = safeLinkOrNull(item?.project?.link);
    const position = positionLink
        ? `<a href="${positionLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.position)}</a>`
        : escapeHtml(item.position);
    
    const project = item.project
        ? `<p class="cv-project"><strong>Project:</strong> ${projectLink ? `<a href="${projectLink}">${escapeHtml(projectTitle)}</a>` : escapeHtml(projectTitle)}</p>`
        : '';

    const responsibilitiesList = asArray(item.responsibilities);
    const responsibilities = responsibilitiesList.length > 0
        ? `<ul class="cv-responsibilities">${responsibilitiesList.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul>`
        : '';

    const metaPills = renderMetaPills(item);

    return `
        <div class="cv-entry ${item.featured ? 'featured-card' : ''}">
            <div class="cv-entry-header">
                <div>
                    <h3>${position}</h3>
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

    container.innerHTML = asArray(items).map(item => renderEducationEntry(item)).join('');
}

function renderEducationEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-graduation-cap"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const detailsList = asArray(item.details);
    const details = detailsList.length > 0
        ? `<ul class="cv-responsibilities">${detailsList.map(d => `<li>${escapeHtml(d)}</li>`).join('')}</ul>`
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

    container.innerHTML = asArray(items).map(item => renderCertificationEntry(item)).join('');
}

function renderCertificationEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-certificate"></i> ${item.startDate} - ${item.endDate}</span>`;
    const titleLink = safeLinkOrNull(item?.link);
    const title = titleLink
        ? `<a href="${titleLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>`
        : escapeHtml(item.title);
    
    const description = item.description
        ? `<p class="cv-description">${escapeHtml(item.description)}</p>`
        : '';
    
    const projectItems = asArray(item.projects);
    const projects = projectItems.length > 0
        ? `<ul class="cv-responsibilities">${projectItems.map(p => {
            const isLink = typeof p === 'object' && p.link;
            const linkUrl = isLink ? safeLinkOrNull(p.link) : null;
            return `<li>${linkUrl ? `<a href="${linkUrl}">${escapeHtml(p.title)}</a>` : escapeHtml(typeof p === 'object' ? (p.title || '') : p)}</li>`;
        }).join('')}</ul>`
        : '';

    const metaPills = renderMetaPills(item);

    return `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <h3>${title}</h3>
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

    const skillsList = asArray(items);

    container.innerHTML = `<div class="cv-skills-grid">
        ${skillsList.map(skill => `
            <div class="cv-skill-card">
                <h4><i class="fas ${escapeHtml(skill.icon)}"></i> ${escapeHtml(skill.category)}</h4>
                <ul>
                    ${asArray(skill.items).map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>`;
}

async function loadPublicationsSummary() {
    const container = document.getElementById('publications-content');
    if (!container) return;

    try {
        const publications = await fetchJson('data/publications.json', 'publications data');

        const recent = asArray(publications).slice(0, 5);

        container.innerHTML = `
            <p class="cv-description">Selected recent publications from my research profile. For the complete list, visit the full publications section.</p>
            <div class="cv-publications-list">
                ${recent.map(pub => {
                    const venue = pub.journal ? `${pub.journal}${pub.editorial ? ` (${pub.editorial})` : ''}` : '';
                    const titleText = pub?.title || 'Untitled publication';
                    const doiUrl = safeLinkOrNull(pub?.doi);
                    const title = doiUrl
                        ? `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(titleText)}</a>`
                        : escapeHtml(titleText);

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

    container.innerHTML = asArray(items).map(item => renderVolunteeringEntry(item)).join('');
}

function renderVolunteeringEntry(item) {
    const pillClass = getPillClass(item.isPresent);
    const pill = `<span class="${pillClass}"><i class="fas fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const description = item.description
        ? `<p class="cv-description">${escapeHtml(item.description)}</p>`
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

onReady(loadCV);
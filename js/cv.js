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
            <img src="${profile.image}" alt="${profile.name}" class="cv-profile-image">
            <h2>${profile.name}</h2>
            <p class="cv-title">${profile.title}</p>
            <p class="cv-subtitle">${profile.subtitle}</p>
        `;
    }
}

function getPillStyle(isPresent) {
    if (isPresent) {
        // Green for "Present" positions
        return {
            background: '#fff3e0',
            color: '#e65100',
            borderColor: '#ffe0b2'
        };
    }
    // Blue for past positions
    return {
        background: '#e3f2fd',
        color: '#1565c0',
        borderColor: '#bbdefb'
    };
}

function loadExperience(items) {
    const container = document.getElementById('experience-content');
    if (!container) return;

    container.innerHTML = items.map(item => renderExperienceEntry(item)).join('');
}

function renderExperienceEntry(item) {
    const style = getPillStyle(item.isPresent);
    const pill = `<span class="pill" style="background:${style.background};color:${style.color};border-color:${style.borderColor};"><i class="fas fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const project = item.project 
        ? `<p class="cv-project"><strong>Project:</strong> <a href="${item.project.link}">${item.project.title}</a></p>`
        : '';
    
    const responsibilities = item.responsibilities.length > 0
        ? `<ul class="cv-responsibilities">${item.responsibilities.map(r => `<li>${r}</li>`).join('')}</ul>`
        : '';

    return `
        <div class="cv-entry ${item.featured ? 'featured-card' : ''}">
            <div class="cv-entry-header">
                <div>
                    <h3>${item.position}</h3>
                    <p class="cv-organization">${item.organization}</p>
                </div>
                <div class="cv-period">${pill}</div>
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
    const style = getPillStyle(item.isPresent);
    const pill = `<span class="pill" style="background:${style.background};color:${style.color};border-color:${style.borderColor};"><i class="fas fa-graduation-cap"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const details = item.details && item.details.length > 0
        ? `<ul class="cv-responsibilities">${item.details.map(d => `<li>${d}</li>`).join('')}</ul>`
        : '';

    return `
        <div class="cv-entry ${item.featured ? 'featured-card' : ''}">
            <div class="cv-entry-header">
                <div>
                    <h3>${item.degree}</h3>
                    <p class="cv-organization">${item.institution}</p>
                </div>
                <div class="cv-period">${pill}</div>
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
    const style = getPillStyle(item.isPresent);
    const pill = `<span class="pill" style="background:${style.background};color:${style.color};border-color:${style.borderColor};"><i class="fas fa-certificate"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const description = item.description
        ? `<p class="cv-description">${item.description}</p>`
        : '';
    
    const projects = item.projects && item.projects.length > 0
        ? `<ul class="cv-responsibilities">${item.projects.map(p => {
            const isLink = typeof p === 'object' && p.link;
            return `<li>${isLink ? `<a href="${p.link}">${p.title}</a>` : p}</li>`;
        }).join('')}</ul>`
        : '';

    return `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <h3>${item.title}</h3>
                    <p class="cv-organization">${item.institution}</p>
                </div>
                <div class="cv-period">${pill}</div>
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
                <h4><i class="fas ${skill.icon}"></i> ${skill.category}</h4>
                <ul>
                    ${skill.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
    </div>`;
}

function loadVolunteering(items) {
    const container = document.getElementById('volunteering-content');
    if (!container) return;

    container.innerHTML = items.map(item => renderVolunteeringEntry(item)).join('');
}

function renderVolunteeringEntry(item) {
    const style = getPillStyle(item.isPresent);
    const pill = `<span class="pill" style="background:${style.background};color:${style.color};border-color:${style.borderColor};"><i class="fas fa-calendar-alt"></i> ${item.startDate} - ${item.endDate}</span>`;
    
    const description = item.description
        ? `<p class="cv-description">${item.description}</p>`
        : '';

    return `
        <div class="cv-entry">
            <div class="cv-entry-header">
                <div>
                    <h3>${item.position}</h3>
                    ${item.organization ? `<p class="cv-organization">${item.organization}</p>` : ''}
                </div>
                <div class="cv-period">${pill}</div>
            </div>
            ${description}
        </div>
    `;
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
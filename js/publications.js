async function loadPublications() {
    const container = document.getElementById('publications-list');
    const featuredContainer = document.getElementById('featured-publications');
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!container) return;
    
    try {
        const res = await fetch('data/publications.json');
        const items = await res.json();
        
        const featured = items.filter(pub => pub.featured);
        
        // Render featured publications
        if (featuredContainer && featured.length > 0) {
            featuredContainer.innerHTML = `
                <h2 id="featured-section"><i class="fas fa-star" style="color: var(--primary);"></i> Featured Publications</h2>
                ${featured.map(pub => renderPublication(pub, true)).join('')}
            `;
        }
        
        // Render all publications
        container.innerHTML = `
            <h2 id="all-publications-section"><i class="fas fa-book" style="color: var(--primary);"></i> All Publications</h2>
            ${items.map(pub => renderPublication(pub, false)).join('')}
        `;
        
        // Build sidebar navigation
        if (sidebarNav) {
            const stats = `
                <div style="background: var(--bg); border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary);">${items.length}</div>
                    <div style="font-size: 0.85rem; color: var(--muted);">Publications</div>
                </div>
            `;
            
            sidebarNav.innerHTML = stats + `
                ${featured.length > 0 ? `
                    <div class="sidebar-section">
                        <a class="section-link" href="#featured-section"><i class="fas fa-star"></i> Featured</a>
                        <ul class="sidebar-sublist">
                            ${featured.map(pub => `<li><a href="#publication-${pub.id}"><i class="fas fa-star" style="color:#ffd700; margin-right:4px;"></i>${pub.title.substring(0, 55)}${pub.title.length > 55 ? '...' : ''}</a></li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="sidebar-section">
                    <a class="section-link" href="#all-publications-section"><i class="fas fa-book"></i> All Publications</a>
                    <ul class="sidebar-sublist">
                        ${items.map(pub => `<li><a href="#publication-${pub.id}">${pub.title.substring(0, 55)}${pub.title.length > 55 ? '...' : ''}</a></li>`).join('')}
                    </ul>
                </div>
            `;
            
            // Highlight active section on scroll
            setupScrollSpy();
        }
            
    } catch (err) {
        container.innerHTML = '<p>Could not load publications.</p>';
        console.error(err);
    }
}

function renderPublication(pub, isFeatured) {
    let authors = pub.authors || '';
    authors = authors.replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez|A\. Márquez Rodríguez|Alba Márquez Rodríguez)/gi, '<strong>$1</strong>');
    
    const imageHtml = pub.image ? 
        `<img src="${pub.image}" alt="${pub.title}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">` : '';
    
    // Determine publication type and status badges
    const type = pub.type || 'journal';
    const status = pub.status || 'published';
    const typeBadges = [];
    const statusBadges = [];
    
    if (type === 'conference') {
        typeBadges.push('<span class="pill" style="background:#f3e5f5;color:#6a1b9a;border-color:#ce93d8;"><i class="fas fa-users" style="margin-right: 4px;"></i> Conference</span>');
    } else if (type === 'preprint') {
        typeBadges.push('<span class="pill" style="background:#fff8e1;color:#f57f17;border-color:#ffd54f;"><i class="fas fa-file-alt" style="margin-right: 4px;"></i> Preprint</span>');
    } else {
        typeBadges.push('<span class="pill" style="background:#e8f5e9;color:#2e7d32;border-color:#c8e6c9;"><i class="fas fa-file-alt" style="margin-right: 4px;"></i> Journal</span>');
    }

    if (status === 'on review') {
        statusBadges.push('<span class="pill" style="background:#e8eaf6;color:#3949ab;border-color:#c5cae9;"><i class="fas fa-hourglass-half" style="margin-right: 4px;"></i> On review</span>');
    } else if (status === 'in press') {
        statusBadges.push('<span class="pill" style="background:#fce4ec;color:#ad1457;border-color:#f8bbd9;"><i class="fas fa-clock" style="margin-right: 4px;"></i> In press</span>');
    } else if (status === 'sent to journal') {
        statusBadges.push('<span class="pill" style="background:#f3e5f5;color:#6a1b9a;border-color:#ce93d8;"><i class="fas fa-paper-plane" style="margin-right: 4px;"></i> Sent to journal</span>');
    } else {
        statusBadges.push('<span class="pill" style="background:#c8e6c9;color:#2e7d32;border-color:#4caf50;"><i class="fas fa-check" style="margin-right: 4px;"></i> Published</span>');
    }
    
    const abstractHtml = pub.abstract ? `
        <details style="margin-top: 12px;">
            <summary style="cursor: pointer; color: var(--primary); font-weight: 600;">Abstract</summary>
            <p>${pub.abstract}</p>
        </details>
    ` : '';
    
    return `
    <section id="publication-${pub.id}" class="card ${isFeatured ? 'featured-card' : ''}">
        ${imageHtml}
        <div class="pub-header">
            <h3 class="pub-title">
                ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title}
            </h3>
            ${pub.date ? `<div class="pub-date"><i class="far fa-calendar"></i> ${pub.date}</div>` : ''}
        </div>
        <div class="pub-meta">
            <div class="pub-venue">
                <span class="pill" style="background:#e3f2fd;color:#1565c0;">${pub.journal}${pub.editorial ? ` (${pub.editorial})` : ''}</span>
            </div>
            <div class="pub-badges-container" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="pub-type-badges" style="display: flex; gap: 8px;">${typeBadges.join(' ')}</div>
                <div class="pub-status-badges" style="display: flex; gap: 8px;">${statusBadges.join(' ')}</div>
            </div>
        </div>
        ${authors ? `<div style="margin: 12px 0; font-size: 0.9rem; color: var(--muted);"><strong>Authors:</strong> ${authors}</div>` : ''}
        ${abstractHtml}
        <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
            ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none; font-weight: 600;"><i class="fas fa-external-link-alt"></i> View Paper</a>` : ''}
        </div>
    </section>
    `;
}

function setupScrollSpy() {
    const links = document.querySelectorAll('.publications-sidebar a');
    const sections = document.querySelectorAll('.card[id^="publication-"], h2[id$="-section"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });
        
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', loadPublications);
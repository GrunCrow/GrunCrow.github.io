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
                ${featured.length > 0 ? '<a class="section-link" href="#featured-section"><i class="fas fa-star"></i> Featured</a>' : ''}
                <a class="section-link" href="#all-publications-section"><i class="fas fa-book"></i> All Publications</a>
                ${items.map(pub => {
                    const starIcon = pub.featured ? '<i class="fas fa-star" style="color:#ffd700; margin-right:4px;"></i>' : '';
                    return `<a href="#publication-${pub.id}">${starIcon}${pub.title.substring(0, 55)}${pub.title.length > 55 ? '...' : ''}</a>`;
                }).join('')}
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
    authors = authors.replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez)/gi, '<strong>$1</strong>');
    
    const imageHtml = pub.image ? 
        `<img src="${pub.image}" alt="${pub.title}" style="width: 100%; max-width: 400px; border-radius: 8px; margin-bottom: 16px;">` : '';
    
    // Determine publication type badge
    const typeBadge = pub.venue && pub.venue.toLowerCase().includes('conference') 
        ? '<span class="pill" style="background:#fff3e0;color:#e65100;border-color:#ffe0b2;"><i class="fas fa-users"></i> Conference</span>'
        : '<span class="pill" style="background:#e8f5e9;color:#2e7d32;border-color:#c8e6c9;"><i class="fas fa-file-alt"></i> Journal</span>';
    
    const abstractPreview = pub.abstract && pub.abstract.length > 400
        ? `<p style="margin-top: 12px;">
               <span id="abstract-short-${pub.id}">${pub.abstract.substring(0, 400)}... 
                   <a href="#" onclick="document.getElementById('abstract-short-${pub.id}').style.display='none'; 
                                       document.getElementById('abstract-full-${pub.id}').style.display='block'; 
                                       return false;" style="color: var(--primary); font-weight: 600;">Read more</a>
               </span>
               <span id="abstract-full-${pub.id}" style="display: none;">${pub.abstract}</span>
           </p>`
        : pub.abstract ? `<p style="margin-top: 12px;">${pub.abstract}</p>` : '';
    
    return `
    <section id="publication-${pub.id}" class="card ${isFeatured ? 'featured-card' : ''}">
        ${imageHtml}
        <div class="pub-header">
            <h3 class="pub-title">
                ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title}
            </h3>
            <div style="margin: 8px 0;">
                ${typeBadge}
            </div>
            <div class="pub-meta">
                <span class="pill" style="background:#e3f2fd;color:#1565c0;">${pub.venue || ''}</span>
                ${pub.date ? `<span><i class="far fa-calendar"></i> ${pub.date}</span>` : ''}
            </div>
        </div>
        ${authors ? `<div style="margin: 12px 0; font-size: 0.9rem; color: var(--muted);"><strong>Authors:</strong> ${authors}</div>` : ''}
        ${abstractPreview}
        <div style="display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap;">
            ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: none; font-weight: 600;"><i class="fas fa-external-link-alt"></i> View Paper</a>` : ''}
            ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noopener" style="color: var(--muted); text-decoration: none;"><i class="fas fa-quote-right"></i> Cite</a>` : ''}
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
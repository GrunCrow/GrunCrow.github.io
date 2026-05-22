const { escapeHtml, safeId, safeUrl, initScrollSpy } = window.SiteUtils;

function getPublicationTitle(pub) {
    return String(pub?.title || 'Untitled publication');
}

function logMalformedPublicationAssets(items) {
    const malformed = [];

    items.forEach((pub) => {
        const publicationId = safeId(pub?.id || getPublicationTitle(pub));

        if (pub?.doi && !safeUrl(pub.doi)) {
            malformed.push({ id: publicationId, type: 'doi', value: pub.doi });
        }

        if (pub?.image && !safeUrl(pub.image)) {
            malformed.push({ id: publicationId, type: 'image', value: pub.image });
        }
    });

    if (malformed.length > 0) {
        console.warn('[publications] Malformed DOI/image entries hidden from UI:', malformed);
    }
}

async function loadPublications() {
    const container = document.getElementById('publications-list');
    const featuredContainer = document.getElementById('featured-publications');
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!container) return;
    
    try {
        const res = await fetch('data/publications.json');
        const items = await res.json();
        logMalformedPublicationAssets(items);
        
        const featured = items.filter(pub => pub.featured);
        
        // Render featured publications
        if (featuredContainer && featured.length > 0) {
            featuredContainer.innerHTML = `
                <h2 id="featured-section"><i class="fas fa-star section-title-icon"></i> Featured Publications</h2>
                ${featured.map(pub => renderPublication(pub, true)).join('')}
            `;
        }
        
        // Render all publications
        container.innerHTML = `
            <h2 id="all-publications-section"><i class="fas fa-book section-title-icon"></i> All Publications</h2>
            ${items.map(pub => renderPublication(pub, false)).join('')}
        `;
        
        // Build sidebar navigation
        if (sidebarNav) {
            const stats = `
                <div class="pub-stats-box">
                    <div class="pub-stats-value">${items.length}</div>
                    <div class="pub-stats-label">Publications</div>
                </div>
            `;
            
            sidebarNav.innerHTML = stats + `
                ${featured.length > 0 ? `
                    <div class="sidebar-section">
                        <a class="section-link" href="#featured-section"><i class="fas fa-star"></i> Featured</a>
                        <ul class="sidebar-sublist">
                            ${featured.map(pub => {
                                const title = getPublicationTitle(pub);
                                return `<li><a href="#publication-${safeId(pub.id)}"><i class="fas fa-star icon-award"></i>${escapeHtml(title.substring(0, 55))}${title.length > 55 ? '...' : ''}</a></li>`;
                            }).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="sidebar-section">
                    <a class="section-link" href="#all-publications-section"><i class="fas fa-book"></i> All Publications</a>
                    <ul class="sidebar-sublist">
                        ${items.map(pub => {
                            const title = getPublicationTitle(pub);
                            return `<li><a href="#publication-${safeId(pub.id)}">${escapeHtml(title.substring(0, 55))}${title.length > 55 ? '...' : ''}</a></li>`;
                        }).join('')}
                    </ul>
                </div>
            `;
            
            initScrollSpy({
                linkSelector: '.publications-sidebar a',
                sectionSelector: '.card[id^="publication-"], h2[id$="-section"]',
                offset: 100
            });
        }
            
    } catch (err) {
        container.innerHTML = '<p>Could not load publications.</p>';
        console.error(err);
    }
}

function renderPublication(pub, isFeatured) {
    const pubId = safeId(pub.id);
    const title = getPublicationTitle(pub);
    const doiUrl = safeUrl(pub.doi);
    const imageUrl = safeUrl(pub.image);
    let authors = pub.authors || '';
    authors = escapeHtml(authors).replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez|A\. Márquez Rodríguez|Alba Márquez Rodríguez)/gi, '<strong>$1</strong>');
    
    const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(title)}" class="pub-image">` : '';
    
    // Determine publication type and status badges
    const type = pub.type || 'journal';
    const status = pub.status || 'published';
    const typeBadges = [];
    const statusBadges = [];
    
    if (type === 'conference') {
        typeBadges.push('<span class="pill pill--accent"><i class="fas fa-users"></i> Conference</span>');
    } else if (type === 'preprint') {
        typeBadges.push('<span class="pill pill--warning"><i class="fas fa-file-alt"></i> Preprint</span>');
    } else {
        typeBadges.push('<span class="pill pill--success"><i class="fas fa-file-alt"></i> Journal</span>');
    }

    if (status === 'on review') {
        statusBadges.push('<span class="pill pill--info"><i class="fas fa-hourglass-half"></i> On review</span>');
    } else if (status === 'in press') {
        statusBadges.push('<span class="pill pill--rose"><i class="fas fa-clock"></i> In press</span>');
    } else if (status === 'sent to journal') {
        statusBadges.push('<span class="pill pill--accent"><i class="fas fa-paper-plane"></i> Sent to journal</span>');
    } else {
        statusBadges.push('<span class="pill pill--success"><i class="fas fa-check"></i> Published</span>');
    }
    
    const abstractHtml = pub.abstract ? `
        <details class="pub-abstract">
            <summary>Abstract</summary>
            <p>${escapeHtml(pub.abstract)}</p>
        </details>
    ` : '';
    
    return `
    <section id="publication-${pubId}" class="card ${isFeatured ? 'featured-card' : ''}">
        ${imageHtml}
        <div class="pub-header">
            <h3 class="pub-title">
                ${doiUrl ? `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="title-link">${escapeHtml(title)}</a>` : escapeHtml(title)}
            </h3>
            ${pub.date ? `<div class="pub-date"><i class="far fa-calendar"></i> ${escapeHtml(pub.date)}</div>` : ''}
        </div>
        <div class="pub-meta">
            <div class="pub-venue">
                <span class="pill pill--info">${escapeHtml(pub.journal)}${pub.editorial ? ` (${escapeHtml(pub.editorial)})` : ''}</span>
            </div>
            <div class="pub-badges-container">
                <div class="pub-type-badges">${typeBadges.join(' ')}</div>
                <div class="pub-status-badges">${statusBadges.join(' ')}</div>
            </div>
        </div>
        ${authors ? `<div class="pub-authors"><strong>Authors:</strong> ${authors}</div>` : ''}
        ${abstractHtml}
        <div class="pub-links">
            ${doiUrl ? `<a href="${doiUrl}" target="_blank" rel="noopener noreferrer" class="pub-link"><i class="fas fa-external-link-alt"></i> View Paper</a>` : ''}
        </div>
    </section>
    `;
}

document.addEventListener('DOMContentLoaded', loadPublications);
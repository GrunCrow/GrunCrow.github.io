const { escapeHtml, safeId, safeUrl, normalizeImageAsset, truncate, fetchJson, initScrollSpy, onReady } = window.SiteUtils;

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function safeLinkOrNull(value) {
    const url = safeUrl(value);
    return url || null;
}

function getCongressTitle(congress) {
    return String(congress?.title || 'Untitled presentation');
}

function logMalformedCongressAssets(items) {
    const malformed = [];

    items.forEach((congress) => {
        const congressId = safeId(congress?.id || getCongressTitle(congress));

        asArray(congress?.links).forEach((link, idx) => {
            if (link?.url && !safeLinkOrNull(link.url)) {
                malformed.push({ id: congressId, field: `links[${idx}].url`, value: link.url });
            }
        });

        asArray(congress?.images).forEach((image, idx) => {
            if (image && !safeLinkOrNull(image)) {
                malformed.push({ id: congressId, field: `images[${idx}]`, value: image });
            }
        });
    });

    if (malformed.length > 0) {
        console.warn('[congresses] Malformed links/images hidden from UI:', malformed);
    }
}

async function loadCongresses() {
    const container = document.getElementById('congresses-container');
    const nav = document.getElementById('congresses-nav');
    if (!container) return;

    try {
        const items = asArray(await fetchJson('data/congresses.json', 'congresses data'));
        logMalformedCongressAssets(items);

        const featured = items.filter(c => c.featured);
        const all = items;

        // Build navigation
        if (nav) {
            nav.innerHTML = 
            `
                ${featured.length > 0 ? '<a class="section-link" href="#featured-congresses"><i class="fas fa-star"></i> Featured</a>' : ''}
                <a class="section-link" href="#all-congresses"><i class="fas fa-calendar-alt"></i> All Congresses</a>
                ${all.map(c => {
                    const congressId = safeId(c.id);
                    const title = getCongressTitle(c);
                    const typeIcon = c.type === 'oral' 
                        ? '<i class="fas fa-microphone section-title-icon"></i>' 
                        : '<i class="fas fa-image section-title-icon"></i>';
                    return `<a class="congress-link" href="#congress-${congressId}">${typeIcon} ${escapeHtml(truncate(title, 45))}</a>`;
                }).join('')}
            `;
        }

        // Build content
        let contentHTML = `
            <section id="intro" class="card">
                <h2>Congresses & Conferences</h2>
                <p>My presentations and communications at scientific conferences and congresses.</p>
            </section>
        `;

        // if (awarded.length > 0) {
        //     contentHTML += `
        //         <section id="awarded-congresses">
        //             <h2><i class="fas fa-trophy" style="color: #ffd700;"></i> Award-winning Presentations</h2>
        //             <p style="color: var(--muted); margin-bottom: 16px;">Presentations recognized with awards and prizes.</p>
        //             ${awarded.map(renderCongress).join('')}
        //         </section>
        //     `;
        // }

        if (featured.length > 0) {
            contentHTML += `
                <section id="featured-congresses">
                    <h2><i class="fas fa-star section-title-icon"></i> Featured Presentations</h2>
                    ${featured.map(renderCongress).join('')}
                </section>
            `;
        }

        contentHTML += `
            <section id="all-congresses">
                <h2><i class="fas fa-calendar-alt section-title-icon"></i> All Presentations</h2>
                ${all.map(renderCongress).join('')}
            </section>
        `;

        container.innerHTML = contentHTML;
        setupCongressInteractions(container);
        initScrollSpy({
            linkSelector: '.congresses-sidebar a',
            sectionSelector: '[id^="congress-"], #featured-congresses, #all-congresses',
            offset: 150
        });
    } catch (err) {
        if (container) container.innerHTML = '<p>Could not load congresses.</p>';
        console.error(err);
    }
}

function renderCongress(congress) {
    const title = getCongressTitle(congress);
    const congressId = safeId(congress.id || title);
    const typeBadge = congress.type === 'oral'
        ? '<span class="pill pill--info"><i class="fas fa-microphone"></i> Oral Presentation</span>'
        : '<span class="pill pill--warning"><i class="fas fa-image"></i> Poster</span>';

    const awardBadge = congress.award
        ? `<span class="pill pill--award"><i class="fas fa-trophy"></i> ${escapeHtml(congress.award)}</span>`
        : '';

    const validImages = asArray(congress.images)
        .map((img) => normalizeImageAsset(img, title))
        .filter(Boolean);

    const allLinks = asArray(congress.links)
        .map((link) => {
            const linkUrl = safeLinkOrNull(link?.url);
            if (!linkUrl) return null;
            return {
                type: link?.type,
                label: link?.label || 'Link',
                url: linkUrl
            };
        })
        .filter(Boolean);

    // Find PDF link for poster
    const posterPdfLink = allLinks.find(link => link.type === 'pdf');
    
    // Filter out PDF links for posters (since the poster image becomes the link)
    const filteredLinks = congress.type === 'poster' 
        ? allLinks.filter(link => link.type !== 'pdf')
        : allLinks;
    
    const links = filteredLinks.length > 0
        ? `<div class="congress-links">
                ${filteredLinks.map(link => {
                    const icon = link.type === 'pdf' ? 'far fa-file-pdf'
                               : link.type === 'web' ? 'fas fa-link'
                               : link.type === 'video' ? 'fas fa-video'
                               : 'fas fa-external-link-alt';
                    return `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="button secondary-button small-button"><i class="${icon}"></i> ${escapeHtml(link.label)}</a>`;
                }).join('')}
           </div>` : '';

    // Handle description with "read more" feature (>300 chars)
        const description = String(congress.description || '');
        const descriptionHTML = description.length > 300
                ? `<p class="congress-description">
                         <span id="desc-short-${congressId}">${escapeHtml(description.substring(0, 300))}...</span>
                         <span id="desc-full-${congressId}" class="project-hidden">${escapeHtml(description)} <a href="#" class="project-toggle-link" data-hide-target="desc-full-${congressId}" data-show-target="desc-short-${congressId}">Read less</a></span>
                         <button class="congress-toggle-btn" data-hide-target="desc-short-${congressId}" data-show-target="desc-full-${congressId}">
                             <span>Read more</span>
                         </button>
                     </p>`
                : `<p class="congress-description">${escapeHtml(description)}</p>`;

    // Different layout for poster vs oral
    if (congress.type === 'poster' && validImages.length > 0) {
        // Poster layout: text left, poster right
        const posterImage = validImages[0]; // Use first image as main poster
        const otherImages = validImages.slice(1);
        
        const otherImagesHTML = otherImages.length > 0
            ? `<div class="project-images project-images-rectangles">
                    ${otherImages.map((imageAsset) => `<img src="${imageAsset.url}" alt="${escapeHtml(imageAsset.alt)}" loading="lazy" decoding="async">`).join('')}
               </div>`
            : '';

        return `
            <div id="congress-${congressId}" class="project-box ${congress.featured ? 'featured-card' : ''}">
                <div class="section-header section-header-top">
                    <div>
                        <h3>${escapeHtml(title)}</h3>
                    </div>
                    <div class="section-info">
                        <h4>${escapeHtml(congress.conference || '')}</h4>
                        ${congress.organization ? `<h5>${escapeHtml(congress.organization)}</h5>` : ''}
                        <h6>${escapeHtml(congress.location || '')}</h6>
                        <h6>${escapeHtml(congress.date || '')}</h6>
                    </div>
                </div>
                <div class="congress-badge-row">
                    ${typeBadge}
                    <div class="congress-award-wrap">
                        ${awardBadge}
                    </div>
                </div>
                
                <div class="congress-poster-layout">
                    <div>
                        ${descriptionHTML}
                        ${links}
                    </div>
                    <div class="congress-poster-col">
                        ${posterPdfLink 
                            ? `<a href="${posterPdfLink.url}" target="_blank" rel="noopener noreferrer" class="congress-poster-link">
                                     <img src="${posterImage.url}" alt="${escapeHtml(posterImage.alt || `${title} Poster`)}" loading="lazy" decoding="async"
                                         class="congress-poster-img">
                                    <div class="congress-poster-caption">
                                        <i class="far fa-file-pdf"></i> Click to view full poster
                                    </div>
                               </a>`
                                : `<img src="${posterImage.url}" alt="${escapeHtml(posterImage.alt || `${title} Poster`)}" loading="lazy" decoding="async"
                                    class="congress-poster-img">`
                        }
                    </div>
                </div>
                ${otherImagesHTML}
            </div>
        `;
    } else {
        // Oral presentation layout: normal flow
        const images = validImages.length > 0
            ? `<div class="project-images project-images-rectangles">
                    ${validImages.map((imageAsset) => `<img src="${imageAsset.url}" alt="${escapeHtml(imageAsset.alt)}" loading="lazy" decoding="async">`).join('')}
               </div>` : '';

        return `
            <div id="congress-${congressId}" class="project-box ${congress.featured ? 'featured-card' : ''}">
                <div class="section-header section-header-top">
                    <div>
                        <h3>${escapeHtml(title)}</h3>
                    </div>
                    <div class="section-info">
                        <h4>${escapeHtml(congress.conference || '')}</h4>
                        ${congress.organization ? `<h5>${escapeHtml(congress.organization)}</h5>` : ''}
                        <h6>${escapeHtml(congress.location || '')}</h6>
                        <h6>${escapeHtml(congress.date || '')}</h6>
                    </div>
                </div>
                <div class="congress-badge-row">
                    ${typeBadge}
                    <div class="congress-award-wrap">
                        ${awardBadge}
                    </div>
                </div>
                ${descriptionHTML}
                ${images}
                ${links}
            </div>
        `;
    }
}

function setupCongressInteractions(container) {
    container.addEventListener('click', (event) => {
        const toggleButton = event.target.closest('[data-hide-target][data-show-target]');
        if (!toggleButton) return;

        event.preventDefault();
        const hideTarget = document.getElementById(toggleButton.dataset.hideTarget);
        const showTarget = document.getElementById(toggleButton.dataset.showTarget);
        if (hideTarget) {
            hideTarget.style.display = 'none';
            hideTarget.classList.add('project-hidden');
        }
        if (showTarget) {
            showTarget.style.display = '';
            showTarget.classList.remove('project-hidden');
        }
    });
}

onReady(loadCongresses);
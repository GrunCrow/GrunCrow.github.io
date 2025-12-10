async function loadCongresses() {
    const container = document.getElementById('congresses-container');
    const nav = document.getElementById('congresses-nav');
    if (!container) return;

    try {
        const res = await fetch('data/congresses.json');
        const items = await res.json();

        const featured = items.filter(c => c.featured);
        const awarded = items.filter(c => c.award);
        const all = items;

        // Build navigation
        if (nav) {
            nav.innerHTML = 
            `
                ${featured.length > 0 ? '<a class="section-link" href="#featured-congresses"><i class="fas fa-star"></i> Featured</a>' : ''}
                <a class="section-link" href="#all-congresses"><i class="fas fa-calendar-alt"></i> All Congresses</a>
                ${all.map(c => {
                    const typeIcon = c.type === 'oral' 
                        ? '<i class="fas fa-microphone" style="color:#1565c0;"></i>' 
                        : '<i class="fas fa-image" style="color:#1565c0;"></i>';
                    return `<a class="congress-link" href="#congress-${c.id}">${typeIcon} ${truncate(c.title, 45)}</a>`;
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
                    <h2><i class="fas fa-star" style="color: var(--primary);"></i> Featured Presentations</h2>
                    ${featured.map(renderCongress).join('')}
                </section>
            `;
        }

        contentHTML += `
            <section id="all-congresses">
                <h2><i class="fas fa-calendar-alt" style="color: var(--primary);"></i> All Presentations</h2>
                ${all.map(renderCongress).join('')}
            </section>
        `;

        container.innerHTML = contentHTML;
        setupScrollSpy();
    } catch (err) {
        if (container) container.innerHTML = '<p>Could not load congresses.</p>';
        console.error(err);
    }
}

function renderCongress(congress) {
    const typeBadge = congress.type === 'oral'
        ? '<span class="pill" style="background:#e3f2fd;color:#1565c0;border-color:#bbdefb;"><i class="fas fa-microphone"></i> Oral Presentation</span>'
        : '<span class="pill" style="background:#fff3e0;color:#e65100;border-color:#ffe0b2;"><i class="fas fa-image"></i> Poster</span>';

    const awardBadge = congress.award
        ? `<span class="pill" style="background:#fff8e1;color:#f57f17;border:2px solid #ffd700;font-weight:600;"><i class="fas fa-trophy"></i> ${congress.award}</span>`
        : '';

    // Find PDF link for poster
    const posterPdfLink = congress.links && congress.links.find(link => link.type === 'pdf');
    
    // Filter out PDF links for posters (since the poster image becomes the link)
    const filteredLinks = congress.type === 'poster' 
        ? (congress.links || []).filter(link => link.type !== 'pdf')
        : (congress.links || []);
    
    const links = filteredLinks.length > 0
        ? `<div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:14px;">
                ${filteredLinks.map(link => {
                    const icon = link.type === 'pdf' ? 'far fa-file-pdf'
                               : link.type === 'web' ? 'fas fa-link'
                               : link.type === 'video' ? 'fas fa-video'
                               : 'fas fa-external-link-alt';
                    return `<a href="${link.url}" target="_blank" rel="noopener" style="color:var(--primary);text-decoration:none;font-weight:600;"><i class="${icon}"></i> ${link.label || 'Link'}</a>`;
                }).join('')}
           </div>` : '';

    // Different layout for poster vs oral
    if (congress.type === 'poster' && congress.images && congress.images.length > 0) {
        // Poster layout: text left, poster right
        const posterImage = congress.images[0]; // Use first image as main poster
        const otherImages = congress.images.slice(1);
        
        const otherImagesHTML = otherImages.length > 0
            ? `<div class="project-images project-images-rectangles">
                    ${otherImages.map(img => `<img src="${img}" alt="${congress.title}" loading="lazy">`).join('')}
               </div>`
            : '';

        return `
            <div id="congress-${congress.id}" class="project-box ${congress.featured ? 'featured-card' : ''}">
                <div class="section-header" style="align-items: flex-start;">
                    <div>
                        <h3>${congress.title}</h3>
                    </div>
                    <div class="section-info">
                        <h4>${congress.conference}</h4>
                        ${congress.organization ? `<h5>${congress.organization}</h5>` : ''}
                        <h6>${congress.location}</h6>
                        <h6>${congress.date}</h6>
                    </div>
                </div>
                <div style="margin: 12px 0; display: flex; gap: 8px; flex-wrap: wrap; justify-content: space-between;">
                    ${typeBadge}
                    <div style="margin-left: auto;">
                        ${awardBadge}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; margin-top: 16px;">
                    <div>
                        <p>${congress.description}</p>
                        ${links}
                    </div>
                    <div style="position: sticky; top: 120px;">
                        ${posterPdfLink 
                            ? `<a href="${posterPdfLink.url}" target="_blank" rel="noopener" style="display: block; cursor: pointer; transition: transform 0.2s ease;">
                                    <img src="${posterImage}" alt="${congress.title} Poster" loading="lazy" 
                                         style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.2s ease, box-shadow 0.2s ease;"
                                         onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.2)';"
                                         onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';">
                                    <div style="text-align: center; margin-top: 8px; color: var(--primary); font-weight: 600;">
                                        <i class="far fa-file-pdf"></i> Click to view full poster
                                    </div>
                               </a>`
                            : `<img src="${posterImage}" alt="${congress.title} Poster" loading="lazy" 
                                    style="width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">`
                        }
                    </div>
                </div>
                ${otherImagesHTML}
            </div>
        `;
    } else {
        // Oral presentation layout: normal flow
        const images = congress.images && congress.images.length
            ? `<div class="project-images project-images-rectangles">
                    ${congress.images.map(img => `<img src="${img}" alt="${congress.title}" loading="lazy">`).join('')}
               </div>` : '';

        return `
            <div id="congress-${congress.id}" class="project-box ${congress.featured ? 'featured-card' : ''}">
                <div class="section-header" style="align-items: flex-start;">
                    <div>
                        <h3>${congress.title}</h3>
                    </div>
                    <div class="section-info">
                        <h4>${congress.conference}</h4>
                        ${congress.organization ? `<h5>${congress.organization}</h5>` : ''}
                        <h6>${congress.location}</h6>
                        <h6>${congress.date}</h6>
                    </div>
                </div>
                <div style="margin: 12px 0; display: flex; gap: 8px; flex-wrap: wrap; justify-content: space-between;">
                    ${typeBadge}
                    <div style="margin-left: auto;">
                        ${awardBadge}
                    </div>
                </div>
                <p>${congress.description}</p>
                ${images}
                ${links}
            </div>
        `;
    }
}

function truncate(str, maxLen = 60) {
    return str.length > maxLen ? str.substring(0, maxLen) + '...' : str;
}

function setupScrollSpy() {
    const links = document.querySelectorAll('.congresses-sidebar a');
    const sections = document.querySelectorAll('[id^="congress-"], #featured-congresses, #all-congresses, #awarded-congresses');

    function highlightNav() {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    highlightNav();
}

document.addEventListener('DOMContentLoaded', loadCongresses);
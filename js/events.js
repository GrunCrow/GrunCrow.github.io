const { escapeHtml, safeId, safeUrl, initScrollSpy } = window.SiteUtils;

async function loadEvents() {
    const container = document.getElementById('events-container');
    const sidebarNav = document.getElementById('events-nav');
    if (!container) return;
    
    try {
        const res = await fetch('data/events.json');
        const events = await res.json();
        
        container.innerHTML = `
            <h2 id="events-section"><i class="fas fa-microphone section-title-icon"></i> Talks & Events</h2>
            ${events.map(event => renderEvent(event)).join('')}
        `;
        
        // Build sidebar navigation
        if (sidebarNav) {
            sidebarNav.innerHTML = events.map(event => {
                const eventId = safeId(event.id);
                const title = escapeHtml((event.title || '').substring(0, 50));
                return `<a href="#event-${eventId}">${title}${(event.title || '').length > 50 ? '...' : ''}</a>`;
            }).join('');
            
            initScrollSpy({
                linkSelector: '.events-sidebar a',
                sectionSelector: '.event-card[id^="event-"]',
                offset: 100
            });
        }
    } catch (err) {
        container.innerHTML = '<p>Could not load events.</p>';
        console.error(err);
    }
}

function renderEvent(event) {
    const eventId = safeId(event.id);
    let speakers = event.speakers || '';
    speakers = escapeHtml(speakers).replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez|A\. Márquez Rodríguez|Alba Márquez Rodríguez)/gi, '<strong>$1</strong>');
    
    const typeBadge = `<span class="pill pill--success"><i class="fas fa-${event.type === 'workshop' ? 'users' : 'chalkboard-teacher'}"></i> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>`;
    
    const locationTypeBadge = event.locationType
        ? `<span class="pill ${event.locationType === 'online' ? 'pill--info' : 'pill--accent'}"><i class="fas fa-${event.locationType === 'online' ? 'globe' : 'map-marker-alt'}"></i> ${event.locationType.charAt(0).toUpperCase() + event.locationType.slice(1)}</span>`
        : '';
    
    const imagesHtml = event.images ? `
        <div class="project-images project-images-rectangles">
            ${event.images.map(img => {
                const imageUrl = safeUrl(img);
                return imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(event.title)}">` : '';
            }).join('')}
        </div>
    ` : '';

    const linksHtml = event.links ? `
        <p>Related links:</p>
        <ul>
            ${event.links.map(link => {
                const linkUrl = safeUrl(link.url);
                if (!linkUrl) return '';
                return `<li><a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.text)}</a></li>`;
            }).join('')}
        </ul>
    ` : '';

    const videoButtonHtml = event.videoLink ? `
        <div class="event-video-button">
            <a href="${safeUrl(event.videoLink)}" target="_blank" rel="noopener noreferrer" class="btn-primary">
                <i class="fab fa-youtube"></i> Watch Video
            </a>
        </div>
    ` : '';

    return `
        <section id="event-${eventId}" class="card event-card">
            <div class="event-header">
                <div class="event-left">
                    <div class="event-date">${escapeHtml(event.date)}</div>
                    <div class="event-location">${escapeHtml(event.location || 'Online')}</div>
                </div>
                <div class="event-main">
                    <div class="event-info">
                        <h3 class="event-title">
                            ${event.link ? `<a href="${safeUrl(event.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(event.title)}</a>` : escapeHtml(event.title)}
                        </h3>
                        <div class="event-meta">
                            <span class="event-organizer">${escapeHtml(event.organizer)}</span>
                            <span class="event-speakers">${speakers}</span>
                        </div>
                    </div>
                    <div class="event-badges">
                        ${typeBadge}
                        ${locationTypeBadge}
                    </div>
                </div>
            </div>
            <div class="event-content">
                <p>${escapeHtml(event.description)}</p>
                ${linksHtml}
            </div>
            ${imagesHtml}
            ${videoButtonHtml}
        </section>
    `;
}

document.addEventListener('DOMContentLoaded', loadEvents);
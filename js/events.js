const { escapeHtml, safeId, safeUrl, normalizeImageAsset, fetchJson, initScrollSpy, onReady } = window.SiteUtils;

function asArray(value) {
    return Array.isArray(value) ? value : [];
}

function safeLinkOrNull(value) {
    const url = safeUrl(value);
    return url || null;
}

function getEventTitle(event) {
    return String(event?.title || 'Untitled event');
}

function eventDateToIso(dateValue) {
    if (!dateValue) return null;
    const parsed = new Date(String(dateValue));
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
}

function injectEventsStructuredData(events) {
    const scriptId = 'events-jsonld';
    const existing = document.getElementById(scriptId);
    if (existing) {
        existing.remove();
    }

    const graph = asArray(events).map((event) => {
        const title = getEventTitle(event);
        const eventUrl = safeLinkOrNull(event.link) || `${window.location.origin}${window.location.pathname}#event-${safeId(event.id || title)}`;
        const payload = {
            '@type': 'Event',
            name: title,
            description: String(event.description || ''),
            url: eventUrl,
            eventStatus: 'https://schema.org/EventScheduled'
        };

        const isoDate = eventDateToIso(event.date);
        if (isoDate) {
            payload.startDate = isoDate;
        }

        const locationType = String(event.locationType || '').toLowerCase();
        payload.location = locationType === 'online'
            ? {
                '@type': 'VirtualLocation',
                url: eventUrl
            }
            : {
                '@type': 'Place',
                name: String(event.location || 'In-person event')
            };

        if (event.organizer) {
            payload.organizer = {
                '@type': 'Organization',
                name: String(event.organizer)
            };
        }

        return payload;
    });

    if (graph.length === 0) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': graph
    });
    document.head.appendChild(script);
}

function normalizeEventType(type) {
    const raw = String(type || '').trim().toLowerCase();
    if (!raw) return { icon: 'calendar-alt', label: 'Event' };
    if (raw === 'workshop') return { icon: 'users', label: 'Workshop' };
    if (raw === 'seminar') return { icon: 'chalkboard-teacher', label: 'Seminar' };
    return { icon: 'chalkboard-teacher', label: raw.charAt(0).toUpperCase() + raw.slice(1) };
}

function logMalformedEventAssets(events) {
    const malformed = [];

    events.forEach((event) => {
        const eventId = safeId(event?.id || getEventTitle(event));

        if (event?.link && !safeLinkOrNull(event.link)) {
            malformed.push({ id: eventId, field: 'link', value: event.link });
        }

        if (event?.videoLink && !safeLinkOrNull(event.videoLink)) {
            malformed.push({ id: eventId, field: 'videoLink', value: event.videoLink });
        }

        asArray(event?.links).forEach((link, idx) => {
            if (link?.url && !safeLinkOrNull(link.url)) {
                malformed.push({ id: eventId, field: `links[${idx}].url`, value: link.url });
            }
        });

        asArray(event?.images).forEach((image, idx) => {
            if (image && !safeLinkOrNull(image)) {
                malformed.push({ id: eventId, field: `images[${idx}]`, value: image });
            }
        });
    });

    if (malformed.length > 0) {
        console.warn('[events] Malformed links/images hidden from UI:', malformed);
    }
}

async function loadEvents() {
    const container = document.getElementById('events-container');
    const sidebarNav = document.getElementById('events-nav');
    if (!container) return;
    
    try {
        const events = asArray(await fetchJson('data/events.json', 'events data'));
        logMalformedEventAssets(events);
        injectEventsStructuredData(events);
        
        container.innerHTML = `
            <h2 id="events-section"><i class="fas fa-microphone section-title-icon"></i> Talks & Events</h2>
            ${events.map(event => renderEvent(event)).join('')}
        `;
        
        // Build sidebar navigation
        if (sidebarNav) {
            sidebarNav.innerHTML = events.map(event => {
                const eventId = safeId(event.id);
                const title = getEventTitle(event);
                const shortTitle = escapeHtml(title.substring(0, 50));
                return `<a href="#event-${eventId}">${shortTitle}${title.length > 50 ? '...' : ''}</a>`;
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
    const title = getEventTitle(event);
    const eventId = safeId(event.id || title);
    const eventType = normalizeEventType(event.type);
    const locationType = String(event?.locationType || '').toLowerCase();
    const locationTypeLabel = locationType ? locationType.charAt(0).toUpperCase() + locationType.slice(1) : '';
    let speakers = event.speakers || '';
    speakers = escapeHtml(speakers).replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez|A\. Márquez Rodríguez|Alba Márquez Rodríguez)/gi, '<strong>$1</strong>');
    const eventLink = safeLinkOrNull(event.link);
    const videoLink = safeLinkOrNull(event.videoLink);
    
    const typeBadge = `<span class="pill pill--success"><i class="fas fa-${eventType.icon}"></i> ${eventType.label}</span>`;
    
    const locationTypeBadge = locationType
        ? `<span class="pill ${locationType === 'online' ? 'pill--info' : 'pill--accent'}"><i class="fas fa-${locationType === 'online' ? 'globe' : 'map-marker-alt'}"></i> ${locationTypeLabel}</span>`
        : '';

    const validImages = asArray(event.images)
        .map((img) => normalizeImageAsset(img, title))
        .filter(Boolean);
    
    const imagesHtml = validImages.length > 0 ? `
        <div class="project-images project-images-rectangles">
            ${validImages.map((imageAsset) => `<img src="${imageAsset.url}" alt="${escapeHtml(imageAsset.alt)}" loading="lazy" decoding="async">`).join('')}
        </div>
    ` : '';

    const validLinks = asArray(event.links)
        .map((link) => {
            const linkUrl = safeLinkOrNull(link?.url);
            if (!linkUrl) return null;
            return { text: escapeHtml(link?.text || 'Link'), url: linkUrl };
        })
        .filter(Boolean);

    const linksHtml = validLinks.length > 0 ? `
        <p>Related links:</p>
        <ul>
            ${validLinks.map((link) => `<li><a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.text}</a></li>`).join('')}
        </ul>
    ` : '';

    const videoButtonHtml = videoLink ? `
        <div class="event-video-button">
            <a href="${videoLink}" target="_blank" rel="noopener noreferrer" class="button secondary-button small-button">
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
                            ${eventLink ? `<a href="${eventLink}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>` : escapeHtml(title)}
                        </h3>
                        <div class="event-meta">
                            <span class="event-organizer">${escapeHtml(event.organizer || '')}</span>
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
                <p>${escapeHtml(event.description || '')}</p>
                ${linksHtml}
            </div>
            ${imagesHtml}
            ${videoButtonHtml}
        </section>
    `;
}

onReady(loadEvents);
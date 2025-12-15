async function loadEvents() {
    const container = document.getElementById('events-container');
    const sidebarNav = document.getElementById('events-nav');
    if (!container) return;
    
    try {
        const res = await fetch('data/events.json');
        const events = await res.json();
        
        container.innerHTML = `
            <h2 id="events-section"><i class="fas fa-microphone" style="color: var(--primary);"></i> Talks & Events</h2>
            ${events.map(event => renderEvent(event)).join('')}
        `;
        
        // Build sidebar navigation
        if (sidebarNav) {
            sidebarNav.innerHTML = events.map(event => `<a href="#event-${event.id}">${event.title.substring(0, 50)}${event.title.length > 50 ? '...' : ''}</a>`).join('');
            
            // Highlight active section on scroll
            setupEventsScrollSpy();
        }
    } catch (err) {
        container.innerHTML = '<p>Could not load events.</p>';
        console.error(err);
    }
}

function renderEvent(event) {
    let speakers = event.speakers || '';
    speakers = speakers.replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez|A\. Márquez Rodríguez|Alba Márquez Rodríguez)/gi, '<strong>$1</strong>');
    
    const typeBadge = `<span class="pill" style="background:#e8f5e9;color:#2e7d32;border-color:#c8e6c9;"><i class="fas fa-${event.type === 'workshop' ? 'users' : 'chalkboard-teacher'}" style="margin-right: 4px;"></i> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>`;
    
    const locationTypeBadge = event.locationType ? 
        `<span class="pill" style="background:${event.locationType === 'online' ? '#e3f2fd' : '#f3e5f5'};color:${event.locationType === 'online' ? '#1565c0' : '#7b1fa2'};border-color:${event.locationType === 'online' ? '#bbdefb' : '#ce93d8'};"><i class="fas fa-${event.locationType === 'online' ? 'globe' : 'map-marker-alt'}" style="margin-right: 4px;"></i> ${event.locationType.charAt(0).toUpperCase() + event.locationType.slice(1)}</span>` : '';
    
    const imagesHtml = event.images ? `
        <div class="project-images project-images-rectangles">
            ${event.images.map(img => `<img src="${img}" alt="${event.title}">`).join('')}
        </div>
    ` : '';

    const linksHtml = event.links ? `
        <p>Related links:</p>
        <ul>
            ${event.links.map(link => `<li><a href="${link.url}" target="_blank">${link.text}</a></li>`).join('')}
        </ul>
    ` : '';

    const videoButtonHtml = event.videoLink ? `
        <div class="event-video-button">
            <a href="${event.videoLink}" target="_blank" class="btn-primary">
                <i class="fab fa-youtube"></i> Watch Video
            </a>
        </div>
    ` : '';

    return `
        <section id="event-${event.id}" class="card event-card">
            <div class="event-header">
                <div class="event-left">
                    <div class="event-date">${event.date}</div>
                    <div class="event-location">${event.location || 'Online'}</div>
                </div>
                <div class="event-main">
                    <div class="event-info">
                        <h3 class="event-title">
                            ${event.link ? `<a href="${event.link}" target="_blank">${event.title}</a>` : event.title}
                        </h3>
                        <div class="event-meta">
                            <span class="event-organizer">${event.organizer}</span>
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
                <p>${event.description}</p>
                ${linksHtml}
            </div>
            ${imagesHtml}
            ${videoButtonHtml}
        </section>
    `;
}

function setupEventsScrollSpy() {
    const links = document.querySelectorAll('.events-sidebar a');
    const sections = document.querySelectorAll('.event-card[id^="event-"]');
    
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

document.addEventListener('DOMContentLoaded', loadEvents);
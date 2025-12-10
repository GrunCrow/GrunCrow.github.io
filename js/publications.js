async function loadPublications() {
    const container = document.getElementById('publications-list');
    const featuredContainer = document.getElementById('featured-publications');
    const sidebarNav = document.getElementById('sidebar-nav');
    if (!container) return;
    
    try {
        const res = await fetch('data/publications.json');
        const items = await res.json();
        
        // Render featured publications
        if (featuredContainer) {
            const featured = items.filter(pub => pub.featured).slice(0, 3);
            if (featured.length > 0) {
                featuredContainer.innerHTML = '<h2>Featured Publications</h2>' + 
                    featured.map(pub => renderPublication(pub, true)).join('');
            }
        }
        
        // Render all publications
        container.innerHTML = '<h2>All Publications</h2>' + 
            items.map(pub => renderPublication(pub, false)).join('');
        
        // Build sidebar navigation
        if (sidebarNav) {
            sidebarNav.innerHTML = items.map(pub => 
                `<a href="#publication-${pub.id}">${pub.title.substring(0, 60)}${pub.title.length > 60 ? '...' : ''}</a>`
            ).join('');
            
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
    
    return `
    <section id="publication-${pub.id}" class="card ${isFeatured ? 'featured-card' : ''}">
        ${imageHtml}
        <div class="pub-header">
            <h3 class="pub-title">
                ${pub.doi ? `<a href="${pub.doi}" target="_blank" rel="noopener">${pub.title}</a>` : pub.title}
            </h3>
            <div class="pub-meta">
                <span class="pill">${pub.venue || ''}</span>
                ${authors ? `<span>Authors: ${authors}</span>` : ''}
                ${pub.doi ? `<span>DOI: <a href="${pub.doi}" target="_blank" rel="noopener">${pub.doi}</a></span>` : ''}
                ${pub.date ? `<span>${pub.date}</span>` : ''}
            </div>
        </div>
        ${pub.abstract ? `<p>${pub.abstract}</p>` : ''}
        ${pub.doi ? `<div class="pub-actions"><a href="${pub.doi}" target="_blank" rel="noopener">View paper →</a></div>` : ''}
    </section>
    `;
}

function setupScrollSpy() {
    const links = document.querySelectorAll('.publications-sidebar a');
    const sections = document.querySelectorAll('.card[id^="publication-"]');
    
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
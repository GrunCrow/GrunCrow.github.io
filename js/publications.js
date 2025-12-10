async function loadPublications() {
    const container = document.getElementById('publications-list');
    if (!container) return;
    try {
        const res = await fetch('data/publications.json');
        const items = await res.json();
        container.innerHTML = items.map(pub => {
            // Bold the author name
            let authors = pub.authors || '';
            authors = authors.replace(/(Alba Márquez-Rodríguez|A\. Márquez-Rodríguez)/gi, '<strong>$1</strong>');
            
            return `
            <section id="publication-${pub.id}" class="card">
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
        `}).join('');
    } catch (err) {
        container.innerHTML = '<p>Could not load publications.</p>';
        console.error(err);
    }
}
document.addEventListener('DOMContentLoaded', loadPublications);
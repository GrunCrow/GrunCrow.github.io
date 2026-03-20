async function injectFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    try {
        const res = await fetch('footer.html');
        const html = await res.text();
        placeholder.innerHTML = html;
        
        // Fetch and display last updated date
        fetchLastUpdated();
    } catch (e) {
        console.error('Footer load failed', e);
    }
}

async function fetchLastUpdated() {
    try {
        const response = await fetch('https://api.github.com/repos/GrunCrow/GrunCrow.github.io/commits?per_page=1');
        const data = await response.json();
        
        if (data && data.length > 0) {
            const lastCommitDate = new Date(data[0].commit.author.date);
            const formattedDate = lastCommitDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const lastUpdatedElement = document.getElementById('last-updated');
            if (lastUpdatedElement) {
                lastUpdatedElement.textContent = `Last updated: ${formattedDate}`;
            }
        }
    } catch (e) {
        console.error('Failed to fetch last update date', e);
    }
}

document.addEventListener('DOMContentLoaded', injectFooter);
// Social Media Page Script
function setupSocialNavigation() {
    const navLinks = document.querySelectorAll('.social-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Scroll-spy for navigation
    window.addEventListener('scroll', () => {
        let current = '';
        document.querySelectorAll('[id^="linkedin"], [id^="twitter"], [id^="github"], [id^="scholar"], [id^="orcid"], [id^="mastodon"]').forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });
}

// Fetch GitHub user information
async function loadGitHubInfo() {
    try {
        const res = await fetch('https://api.github.com/users/GrunCrow');
        const user = await res.json();
        
        const container = document.getElementById('github-repos');
        
        container.innerHTML = `
            <div class="github-info-card" style="text-align: center;">
            <div class="github-info-header" style="display: flex; flex-direction: column; align-items: center;">
                <img src="${user.avatar_url}" alt="${user.name}" class="github-avatar">
                <div class="github-info-details" style="text-align: center;">
                    <h4>${user.name || user.login}</h4>
                    <p class="github-bio">${user.bio || 'Developer & Open Source Enthusiast'}</p>
                    <div class="github-stats-inline" style="display: flex; justify-content: center; gap: 20px;">
                        <div class="stat-item">
                        <span class="stat-num">${user.public_repos}</span>
                        <span class="stat-label">Repositories</span>
                        </div>
                        <div class="stat-item">
                        <span class="stat-num">${user.followers}</span>
                        <span class="stat-label">Followers</span>
                        </div>
                        <div class="stat-item">
                        <span class="stat-num">${user.following}</span>
                        <span class="stat-label">Following</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="github-info-body" style="text-align: center;">
                <p><strong>Member Since:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            </div>
        `;
    } catch (err) {
        console.error('Error loading GitHub info:', err);
        const container = document.getElementById('github-repos');
        container.innerHTML = `
            <div class="github-info-card">
                <h4>GitHub Profile</h4>
                <p style="color: var(--muted); margin: 12px 0;">
                    Explore my open source projects, contributions, and collaborative work.
                </p>
                <div class="github-info-body">
                    <ul style="color: var(--muted); line-height: 1.8;">
                        <li><strong>Languages:</strong> Python, C++, Java, SQL</li>
                        <li><strong>Focus Areas:</strong> AI, Computer vision, Data science</li>
                        <li><strong>Interests:</strong> Open Source, Ecology Tech, Deep Learning</li>
                    </ul>
                </div>
                <a href="https://github.com/GrunCrow" target="_blank" rel="noopener" class="github-profile-btn">
                    <i class="fab fa-github"></i> Visit GitHub Profile
                </a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupSocialNavigation();
    loadGitHubInfo();
});
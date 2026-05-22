// Set email and social media links
const linkedinEl = document.getElementById('linkedin');
const twitterEl = document.getElementById('twitter');
const githubEl = document.getElementById('github');

if (linkedinEl && typeof linkedin !== 'undefined') linkedinEl.href = linkedin;
if (twitterEl && typeof twitter !== 'undefined') twitterEl.href = twitter;
if (githubEl && typeof github !== 'undefined') githubEl.href = github;

function initHeaderScrollEffect() {
    const header = document.querySelector('header');
    if (!header) return;

    const updateHeaderState = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initActiveTopNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const links = document.querySelectorAll('header nav a[href]');

    links.forEach((link) => {
        const href = (link.getAttribute('href') || '').split('#')[0];
        const isCurrent = href === currentPath || (currentPath === '' && href === 'index.html');
        if (isCurrent) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        }
    });
}

function initBackToTop() {
    document.addEventListener('click', (event) => {
        const backToTopLink = event.target.closest('.back-to-top');
        if (!backToTopLink) return;

        event.preventDefault();
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initHeaderScrollEffect();
    initActiveTopNav();
    initBackToTop();
});
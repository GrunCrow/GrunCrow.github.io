document.addEventListener('DOMContentLoaded', () => {
    const emailEl = document.getElementById('email');
    const emailLink = document.getElementById('email-link');
    if (emailEl && typeof email !== 'undefined') {
        emailEl.textContent = email;
        if (emailLink) emailLink.href = `mailto:${email}`;
    }
});

// Set email and social media links
document.getElementById("linkedin").href = linkedin;
document.getElementById("twitter").href = twitter;
document.getElementById("github").href = github;

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
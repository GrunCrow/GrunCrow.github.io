// Set email and social media links
const linkedinEl = document.getElementById('linkedin');
const twitterEl = document.getElementById('twitter');
const githubEl = document.getElementById('github');

if (linkedinEl && typeof linkedin !== 'undefined') linkedinEl.href = linkedin;
if (twitterEl && typeof twitter !== 'undefined') twitterEl.href = twitter;
if (githubEl && typeof github !== 'undefined') githubEl.href = github;

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});
async function injectFooter() {
    const placeholder = document.getElementById('footer-placeholder');
    if (!placeholder) return;
    try {
        const res = await fetch('footer.html');
        const html = await res.text();
        placeholder.innerHTML = html;
    } catch (e) {
        console.error('Footer load failed', e);
    }
}
document.addEventListener('DOMContentLoaded', injectFooter);
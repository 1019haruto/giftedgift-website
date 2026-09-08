const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

navToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
});

siteNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    siteNav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const notes = document.getElementById('contactNotes').value.trim();

    if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.SUBMISSION_ENDPOINT &&
        SITE_CONFIG.SUBMISSION_ENDPOINT.indexOf('script.google.com') !== -1) {
      fetch(SITE_CONFIG.SUBMISSION_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          page: document.title,
          email: email,
          categories: [{ name: '無料相談フォーム', fields: { 'お名前': name } }],
          notes: notes,
        }),
      }).catch(() => {
        // 送信に失敗しても、お客様には既に完了メッセージを表示済みのため何もしない
      });
    }

    alert('送信ありがとうございます。担当より折り返しご連絡いたします。');
    contactForm.reset();
  });
}

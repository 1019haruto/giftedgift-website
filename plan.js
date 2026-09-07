document.querySelectorAll('.category-chip input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const panel = document.getElementById(checkbox.dataset.target);
    if (panel) panel.hidden = !checkbox.checked;
    checkbox.closest('.category-chip').classList.toggle('is-active', checkbox.checked);
    updateEmptyHint();
  });
});

function updateEmptyHint() {
  const hint = document.getElementById('emptyHint');
  if (!hint) return;
  const anyChecked = document.querySelectorAll('.category-chip input[type="checkbox"]:checked').length > 0;
  hint.hidden = anyChecked;
}

const planForm = document.getElementById('planForm');
const emailStep = document.getElementById('emailStep');
const doneStep = document.getElementById('doneStep');

if (planForm) {
  planForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (emailStep) {
      planForm.hidden = true;
      emailStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('ご相談内容を受け付けました（デモ画面です）。');
    }
  });
}

const sendEmailBtn = document.getElementById('sendEmailBtn');
if (sendEmailBtn) {
  sendEmailBtn.addEventListener('click', () => {
    const emailInput = document.getElementById('finalEmailInput');
    const email = emailInput ? emailInput.value.trim() : '';
    if (!email) {
      alert('メールアドレスを入力してください。');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const confirmedEmail = document.getElementById('confirmedEmail');
    const issuedCode = document.getElementById('issuedCode');
    if (confirmedEmail) confirmedEmail.textContent = email + ' 宛にお送りする内容としてお預かりしました。';
    if (issuedCode) issuedCode.textContent = code;
    if (emailStep) emailStep.hidden = true;
    if (doneStep) {
      doneStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

updateEmptyHint();

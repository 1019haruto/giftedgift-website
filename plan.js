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

function collectRequestSummary() {
  const summary = { page: document.title, categories: [] };

  document.querySelectorAll('.category-panel').forEach((panel) => {
    if (panel.hidden) return;
    const heading = panel.querySelector('h3');
    const fields = {};

    panel.querySelectorAll('select').forEach((select) => {
      const label = select.closest('label');
      const labelText = label ? label.childNodes[0].textContent.trim() : (select.id || '選択項目');
      fields[labelText] = select.value;
    });

    panel.querySelectorAll('.field-grid input[type="text"]').forEach((input) => {
      const value = input.value.trim();
      if (!value) return;
      const label = input.closest('label');
      const labelText = label ? label.childNodes[0].textContent.trim() : (input.id || '入力項目');
      fields[labelText] = value;
    });

    const checked = Array.from(panel.querySelectorAll('.checkbox-row input[type="checkbox"]:checked'))
      .map((cb) => (cb.closest('label') ? cb.closest('label').textContent.trim() : cb.value));
    if (checked.length > 0) fields['選択項目'] = checked;

    panel.querySelectorAll('textarea').forEach((textarea) => {
      const value = textarea.value.trim();
      if (!value) return;
      const label = textarea.closest('label');
      const labelText = label ? label.childNodes[0].textContent.trim() : (textarea.id || '備考');
      fields[labelText] = value;
    });

    summary.categories.push({ name: heading ? heading.textContent.trim() : '', fields });
  });

  const notes = document.querySelector('.notes-field textarea');
  summary.notes = notes ? notes.value : '';
  return summary;
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

    if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.SUBMISSION_ENDPOINT &&
        SITE_CONFIG.SUBMISSION_ENDPOINT.indexOf('script.google.com') !== -1) {
      const payload = Object.assign(collectRequestSummary(), { email: email });
      fetch(SITE_CONFIG.SUBMISSION_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      }).catch(() => {
        // 送信に失敗しても、お客様には既に完了画面を表示済みのため何もしない
      });
    }
  });
}

updateEmptyHint();

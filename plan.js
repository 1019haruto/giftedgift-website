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

document.querySelectorAll('.field-grid select').forEach((select) => {
  const hasOther = Array.from(select.options).some((opt) => opt.textContent.trim() === 'その他');
  if (!hasOther) return;

  const label = select.closest('label');
  if (!label) return;

  const otherInput = document.createElement('input');
  otherInput.type = 'text';
  otherInput.className = 'other-detail-input';
  otherInput.placeholder = '具体的にご記入ください';
  otherInput.hidden = true;
  label.appendChild(otherInput);

  const syncOtherInput = () => {
    const isOther = select.value === 'その他';
    otherInput.hidden = !isOther;
    if (!isOther) otherInput.value = '';
  };

  select.addEventListener('change', syncOtherInput);
  syncOtherInput();
});

const planForm = document.getElementById('planForm');
const confirmStep = document.getElementById('confirmStep');
const confirmContent = document.getElementById('confirmContent');
const upsellStep = document.getElementById('upsellStep');
const emailStep = document.getElementById('emailStep');
const doneStep = document.getElementById('doneStep');
let selectedAddons = [];
let submittedEmail = '';
let submittedToken = '';

function escapeHtmlLocal(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderSummaryHtml(summary) {
  const categoriesHtml = summary.categories
    .filter((cat) => Object.keys(cat.fields).length > 0)
    .map((cat) => {
      const rows = Object.entries(cat.fields).map(([key, value]) => {
        const displayValue = Array.isArray(value) ? value.join('、') : value;
        return (
          '<div class="confirm-field-row">' +
            '<span class="confirm-field-label">' + escapeHtmlLocal(key) + '</span>' +
            '<span class="confirm-field-value">' + escapeHtmlLocal(String(displayValue)) + '</span>' +
          '</div>'
        );
      }).join('');
      return (
        '<div class="confirm-category">' +
          '<div class="confirm-category-name">' + escapeHtmlLocal(cat.name) + '</div>' +
          rows +
        '</div>'
      );
    }).join('');

  const notesHtml = summary.notes
    ? '<div class="confirm-notes"><strong>こだわり・補足事項</strong><p>' + escapeHtmlLocal(summary.notes) + '</p></div>'
    : '';

  return categoriesHtml + notesHtml || '<p>選択された内容がありません。</p>';
}

if (planForm) {
  planForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (confirmStep && confirmContent) {
      confirmContent.innerHTML = renderSummaryHtml(collectRequestSummary());
      planForm.hidden = true;
      confirmStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (emailStep) {
      planForm.hidden = true;
      emailStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      alert('ご相談内容を受け付けました（デモ画面です）。');
    }
  });
}

const confirmBackBtn = document.getElementById('confirmBackBtn');
if (confirmBackBtn) {
  confirmBackBtn.addEventListener('click', () => {
    confirmStep.hidden = true;
    planForm.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const confirmNextBtn = document.getElementById('confirmNextBtn');
if (confirmNextBtn) {
  confirmNextBtn.addEventListener('click', () => {
    confirmStep.hidden = true;
    if (upsellStep) {
      upsellStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (emailStep) {
      emailStep.hidden = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

function proceedFromUpsellToEmail() {
  upsellStep.hidden = true;
  if (emailStep) {
    emailStep.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

const upsellSkipBtn = document.getElementById('upsellSkipBtn');
if (upsellSkipBtn) {
  upsellSkipBtn.addEventListener('click', () => {
    selectedAddons = [];
    proceedFromUpsellToEmail();
  });
}

const upsellNextBtn = document.getElementById('upsellNextBtn');
if (upsellNextBtn) {
  upsellNextBtn.addEventListener('click', () => {
    selectedAddons = Array.from(document.querySelectorAll('.upsell-option:checked')).map((cb) => cb.value);
    proceedFromUpsellToEmail();
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

  if (selectedAddons.length > 0) {
    summary.categories.push({ name: '🎁 追加オプション（ギフト＋α）', fields: { 選択項目: selectedAddons } });
  }

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
    submittedEmail = email;
    submittedToken = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
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
      const payload = Object.assign(collectRequestSummary(), { email: email, code: code, token: submittedToken });
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

const lineSendBtn = document.getElementById('lineSendBtn');
if (lineSendBtn) {
  lineSendBtn.addEventListener('click', () => {
    const lineSendNote = document.getElementById('lineSendNote');
    if (typeof SITE_CONFIG === 'undefined' || !SITE_CONFIG.LINE_LOGIN_CHANNEL_ID || !SITE_CONFIG.LINE_LOGIN_REDIRECT_URI) {
      if (lineSendNote) {
        lineSendNote.hidden = false;
        lineSendNote.textContent = 'LINE連携の設定が未完了のため、送信できません。';
      }
      return;
    }
    if (!submittedToken) return;

    lineSendBtn.disabled = true;
    lineSendBtn.textContent = 'LINEアプリに移動しています…';

    const authUrl = 'https://access.line.me/oauth2/v2.1/authorize' +
      '?response_type=code' +
      '&client_id=' + encodeURIComponent(SITE_CONFIG.LINE_LOGIN_CHANNEL_ID) +
      '&redirect_uri=' + encodeURIComponent(SITE_CONFIG.LINE_LOGIN_REDIRECT_URI) +
      '&state=' + encodeURIComponent(submittedToken) +
      '&scope=' + encodeURIComponent('profile openid') +
      '&bot_prompt=aggressive';

    window.location.href = authUrl;
  });
}

updateEmptyHint();

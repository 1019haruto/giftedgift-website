document.querySelectorAll('.category-chip input[type="checkbox"]').forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    const panel = document.getElementById(checkbox.dataset.target);
    if (panel) panel.hidden = !checkbox.checked;
    checkbox.closest('.category-chip').classList.toggle('is-active', checkbox.checked);
    updateEmptyHint();
    updatePlanPreview();
  });
});

/* ---------- mood / relationship choice cards ---------- */
function wireChoiceCards(containerId, selectId) {
  const container = document.getElementById(containerId);
  const select = document.getElementById(selectId);
  if (!container || !select) return;

  container.querySelectorAll('.choice-card').forEach((card) => {
    card.addEventListener('click', () => {
      container.querySelectorAll('.choice-card').forEach((c) => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      select.value = card.dataset.value;
      updatePlanPreview();
    });
  });
}

wireChoiceCards('moodCards', 'moodSelect');
wireChoiceCards('relationshipCards', 'relationshipSelect');
wireChoiceCards('topicCards', 'topicSelect');
wireChoiceCards('timeOfDayCards', 'timeOfDaySelect');

/* ---------- 第2・第3希望日を段階的に表示 ---------- */
function revealDateFieldOnInput(dateInputId, nextFieldId) {
  const dateInput = document.getElementById(dateInputId);
  const nextField = document.getElementById(nextFieldId);
  if (!dateInput || !nextField) return;
  dateInput.addEventListener('input', () => {
    if (dateInput.value.trim()) nextField.hidden = false;
  });
}

revealDateFieldOnInput('dateChoice1', 'dateChoice2Field');
revealDateFieldOnInput('dateChoice2', 'dateChoice3Field');

/* ---------- 手入力時、半角数字を yyyy/mm/dd に自動でスラッシュ区切り ---------- */
function applyDateSlashMask(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('input', () => {
    const raw = inputEl.value;
    if (!/^[0-9/]*$/.test(raw)) return; // 「未定」など数字以外が混ざったら何もしない

    const cursorPos = inputEl.selectionStart;
    const digitsBeforeCursor = raw.slice(0, cursorPos).replace(/\//g, '').length;

    const digits = raw.replace(/\//g, '').slice(0, 8);
    let formatted = digits.slice(0, 4);
    if (digits.length > 4) formatted += '/' + digits.slice(4, 6);
    if (digits.length > 6) formatted += '/' + digits.slice(6, 8);

    if (formatted === raw) return;
    inputEl.value = formatted;

    let newPos = 0;
    let seenDigits = 0;
    while (newPos < formatted.length && seenDigits < digitsBeforeCursor) {
      if (formatted[newPos] !== '/') seenDigits++;
      newPos++;
    }
    inputEl.setSelectionRange(newPos, newPos);
  });
}

applyDateSlashMask(document.getElementById('dateChoice1'));
applyDateSlashMask(document.getElementById('dateChoice2'));
applyDateSlashMask(document.getElementById('dateChoice3'));

/* ---------- 希望日のカレンダー選択（開始日・終了日） ---------- */
function formatIsoDateToJp(isoStr) {
  const parts = isoStr.split('-');
  return parts[0] + '/' + parts[1] + '/' + parts[2];
}

function wireDateRangePicker(baseId) {
  const input = document.getElementById(baseId);
  const toggle = document.getElementById(baseId + 'CalToggle');
  const popover = document.getElementById(baseId + 'CalPopover');
  const startInput = document.getElementById(baseId + 'Start');
  const endInput = document.getElementById(baseId + 'End');
  const applyBtn = popover ? popover.querySelector('.date-range-apply') : null;
  if (!input || !toggle || !popover || !startInput || !endInput || !applyBtn) return;

  toggle.addEventListener('click', () => {
    popover.hidden = !popover.hidden;
  });

  startInput.addEventListener('change', () => {
    if (startInput.value) endInput.min = startInput.value;
  });

  applyBtn.addEventListener('click', () => {
    if (!startInput.value) {
      popover.hidden = true;
      return;
    }
    let text = formatIsoDateToJp(startInput.value);
    if (endInput.value && endInput.value !== startInput.value) {
      text += '〜' + formatIsoDateToJp(endInput.value);
    }
    input.value = text;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    popover.hidden = true;
  });

  document.addEventListener('click', (e) => {
    if (popover.hidden) return;
    if (popover.contains(e.target) || e.target === toggle) return;
    popover.hidden = true;
  });
}

wireDateRangePicker('dateChoice1');
wireDateRangePicker('dateChoice2');
wireDateRangePicker('dateChoice3');

/* ---------- 選択値が一致したときだけ隣の入力欄を表示 ---------- */
function revealFieldOnSelectValue(selectId, targetValue, fieldId) {
  const select = document.getElementById(selectId);
  const field = document.getElementById(fieldId);
  if (!select || !field) return;
  const sync = () => {
    const show = select.value === targetValue;
    field.hidden = !show;
    if (!show) {
      const input = field.querySelector('input, textarea');
      if (input) input.value = '';
    }
  };
  select.addEventListener('change', sync);
  sync();
}

revealFieldOnSelectValue('allergySelect', '有', 'allergyDetailField');

/* ---------- 都道府県 dropdown ---------- */
const prefectureToggle = document.getElementById('prefectureToggle');
const prefecturePanel = document.getElementById('prefecturePanel');
const prefectureSummary = document.getElementById('prefectureSummary');
if (prefectureToggle && prefecturePanel && prefectureSummary) {
  prefectureToggle.addEventListener('click', () => {
    prefecturePanel.hidden = !prefecturePanel.hidden;
    prefectureToggle.classList.toggle('is-open', !prefecturePanel.hidden);
  });

  function updatePrefectureSummary() {
    const checked = Array.from(prefecturePanel.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
    if (checked.length === 0) prefectureSummary.textContent = 'どこでも可';
    else if (checked.length <= 2) prefectureSummary.textContent = checked.join('、');
    else prefectureSummary.textContent = checked.length + '件選択中';
  }

  prefecturePanel.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', updatePrefectureSummary);
  });
}

const previewToggleBtn = document.getElementById('previewToggle');
if (previewToggleBtn) {
  previewToggleBtn.addEventListener('click', () => {
    previewExpanded = !previewExpanded;
    updatePlanPreview();
  });
}

/* ---------- live "YOUR PLAN" preview ---------- */
const ADDON_TIMELINE = [
  { target: 'cat-transport', icon: '🚗', label: '移動' },
  { target: 'cat-flower', icon: '🌷', label: '花束をお渡し' },
  { target: 'cat-meal', icon: '🍽️', label: 'お食事' },
  { target: 'cat-cake', icon: '🍰', label: 'ケーキでお祝い' },
  { target: 'cat-goods', icon: '🎁', label: 'ギフトをお渡し' },
  { target: 'cat-stay', icon: '🏨', label: '宿泊でゆっくり' },
];

let previewExpanded = false;

function updatePlanPreview() {
  const planPreview = document.getElementById('planPreview');
  const previewEmpty = document.getElementById('previewEmpty');
  const previewBody = document.getElementById('previewBody');
  const previewMoodEn = document.getElementById('previewMoodEn');
  const previewMoodCopy = document.getElementById('previewMoodCopy');
  const previewWith = document.getElementById('previewWith');
  const previewTimeline = document.getElementById('previewTimeline');
  const previewToggle = document.getElementById('previewToggle');
  const previewCount = document.getElementById('previewCount');
  if (!previewEmpty || !previewBody) return;

  const moodCard = document.querySelector('#moodCards .choice-card.is-selected');
  const relCard = document.querySelector('#relationshipCards .choice-card.is-selected');
  const checkedAddons = Array.from(document.querySelectorAll('.category-chip input[type="checkbox"]:checked'))
    .map((cb) => cb.dataset.target);

  const count = (moodCard ? 1 : 0) + (relCard ? 1 : 0) + checkedAddons.length;
  const hasAnything = count > 0;

  if (previewToggle) previewToggle.hidden = !hasAnything;
  if (previewCount) previewCount.textContent = String(count);
  if (planPreview) planPreview.classList.toggle('is-expanded', previewExpanded);
  if (previewToggle) previewToggle.classList.toggle('is-expanded', previewExpanded);

  if (!hasAnything) {
    previewEmpty.hidden = false;
    previewBody.hidden = true;
    return;
  }

  previewEmpty.hidden = true;
  previewBody.hidden = false;

  if (moodCard) {
    previewMoodEn.textContent = moodCard.dataset.en || 'YOUR PLAN';
    previewMoodCopy.textContent = moodCard.dataset.copy || '';
  } else {
    previewMoodEn.textContent = 'YOUR PLAN';
    previewMoodCopy.textContent = 'あなたたちの時間を、一緒に考えています。';
  }

  if (relCard) {
    const relContainer = document.getElementById('relationshipCards');
    const suffix = (relContainer && relContainer.dataset.suffix) || 'へ';
    previewWith.hidden = false;
    previewWith.textContent = relCard.dataset.value + suffix;
  } else {
    previewWith.hidden = true;
  }

  if (previewTimeline) {
    previewTimeline.innerHTML = ADDON_TIMELINE
      .filter((item) => checkedAddons.includes(item.target))
      .map((item) => (
        '<li><span class="plan-preview-timeline-icon">' + item.icon + '</span><span>' + item.label + '</span></li>'
      ))
      .join('');
  }
}

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
  otherInput.placeholder = select.dataset.otherPlaceholder || '具体的にご記入ください';
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
let submittedCode = '';

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
      confirmStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (emailStep) {
      planForm.hidden = true;
      emailStep.hidden = false;
      emailStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    planForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const confirmNextBtn = document.getElementById('confirmNextBtn');
if (confirmNextBtn) {
  confirmNextBtn.addEventListener('click', () => {
    confirmStep.hidden = true;
    if (upsellStep) {
      upsellStep.hidden = false;
      upsellStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (emailStep) {
      emailStep.hidden = false;
      emailStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function proceedFromUpsellToEmail() {
  upsellStep.hidden = true;
  if (emailStep) {
    emailStep.hidden = false;
    emailStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      if (select.multiple) {
        const values = Array.from(select.selectedOptions).map((opt) => opt.value);
        if (values.length > 0) fields[labelText] = values;
      } else {
        fields[labelText] = select.value;
      }
    });

    panel.querySelectorAll('.field-grid input[type="text"], .field-grid input[type="date"]').forEach((input) => {
      if (input.closest('.date-range-popover')) return;
      const value = input.value.trim();
      if (!value) return;
      const label = input.closest('label');
      const labelText = label ? label.childNodes[0].textContent.trim() : (input.id || '入力項目');
      fields[labelText] = value;
    });

    panel.querySelectorAll('.checkbox-row').forEach((row) => {
      const checked = Array.from(row.querySelectorAll('input[type="checkbox"]:checked'))
        .map((cb) => (cb.closest('label') ? cb.closest('label').textContent.trim() : cb.value));
      if (checked.length > 0) fields[row.dataset.fieldLabel || '選択項目'] = checked;
    });

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
    submittedCode = code;
    submittedToken = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('gitedgift_user_email', email);
    const confirmedEmail = document.getElementById('confirmedEmail');
    const issuedCode = document.getElementById('issuedCode');
    if (confirmedEmail) confirmedEmail.textContent = email + ' 宛にお送りする内容としてお預かりしました。';
    if (issuedCode) issuedCode.textContent = code;
    if (emailStep) emailStep.hidden = true;
    if (doneStep) {
      doneStep.hidden = false;
      doneStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(goToLineNow, 1500);
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

const LINE_OFFICIAL_ACCOUNT_ID = '@430uoiak';

function buildLineMessageText() {
  const summary = collectRequestSummary();
  const lines = ['【GIFTED×GIFT】ご相談内容', ''];

  if (submittedCode) lines.push('確認コード: ' + submittedCode, '');

  summary.categories.forEach((cat) => {
    const fieldEntries = Object.entries(cat.fields);
    if (fieldEntries.length === 0) return;
    lines.push(cat.name);
    fieldEntries.forEach(([key, value]) => {
      const displayValue = Array.isArray(value) ? value.join('、') : value;
      lines.push('・' + key + ': ' + displayValue);
    });
    lines.push('');
  });

  if (summary.notes) lines.push('こだわり・補足事項', summary.notes, '');

  return lines.join('\n').trim();
}

function goToLineNow() {
  const message = buildLineMessageText();
  const lineUrl = 'https://line.me/R/oaMessage/' + LINE_OFFICIAL_ACCOUNT_ID + '/?' + encodeURIComponent(message);
  window.location.href = lineUrl;
}

const lineSendBtn = document.getElementById('lineSendBtn');
if (lineSendBtn) {
  lineSendBtn.addEventListener('click', goToLineNow);
}

updateEmptyHint();
updatePlanPreview();

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

/* ---------- 国内・海外 toggle ---------- */
const domesticOverseasSelect = document.getElementById('domesticOverseasSelect');
const prefectureField = document.getElementById('prefectureField');
const regionField = document.getElementById('regionField');
const countryField = document.getElementById('countryField');
const cityField = document.getElementById('cityField');

function updateLocationMode() {
  const isOverseas = domesticOverseasSelect && domesticOverseasSelect.value === '海外';
  if (prefectureField) prefectureField.hidden = isOverseas;
  if (cityField) cityField.hidden = isOverseas;
  if (regionField) regionField.hidden = !isOverseas;
  if (countryField) countryField.hidden = !isOverseas;

  if (isOverseas) {
    if (prefecturePanel) {
      prefecturePanel.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => { cb.checked = false; });
      if (typeof updatePrefectureSummary === 'function') updatePrefectureSummary();
    }
    if (cityField) {
      const cityInput = cityField.querySelector('input[type="text"]');
      if (cityInput) cityInput.value = '';
    }
  } else {
    if (regionPanel) {
      regionPanel.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => { cb.checked = false; });
      if (typeof updateRegionSummary === 'function') updateRegionSummary();
    }
    checkedCountries.clear();
    updateCountrySummary();
    renderCountryList();
  }
}

if (domesticOverseasSelect) {
  domesticOverseasSelect.addEventListener('change', updateLocationMode);
}

/* ---------- 地域・州 dropdown ---------- */
const regionToggle = document.getElementById('regionToggle');
const regionPanel = document.getElementById('regionPanel');
const regionSummary = document.getElementById('regionSummary');
if (regionToggle && regionPanel && regionSummary) {
  regionToggle.addEventListener('click', () => {
    regionPanel.hidden = !regionPanel.hidden;
    regionToggle.classList.toggle('is-open', !regionPanel.hidden);
  });

  var updateRegionSummary = function updateRegionSummary() {
    const checked = Array.from(regionPanel.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value);
    if (checked.length === 0) regionSummary.textContent = '未選択';
    else if (checked.length <= 2) regionSummary.textContent = checked.join('、');
    else regionSummary.textContent = checked.length + '件選択中';
  };

  regionPanel.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      updateRegionSummary();
      syncCountriesToSelectedRegions();
      renderCountryList();
    });
  });
}

/* ---------- 国（検索付き）dropdown ---------- */
const COUNTRIES_BY_REGION = {
  'アジア': ['中国', '韓国', '台湾', '香港', 'タイ', 'ベトナム', 'シンガポール', 'マレーシア', 'インドネシア', 'フィリピン', 'インド', 'カンボジア', 'ラオス', 'ミャンマー', 'モンゴル', 'ネパール', 'スリランカ'],
  'ヨーロッパ': ['フランス', 'イタリア', 'スペイン', 'ドイツ', 'イギリス', 'ポルトガル', 'オランダ', 'ベルギー', 'スイス', 'オーストリア', 'ギリシャ', 'チェコ', 'ハンガリー', 'ポーランド', 'デンマーク', 'スウェーデン', 'ノルウェー', 'フィンランド', 'アイスランド', 'クロアチア', 'アイルランド'],
  '北米': ['アメリカ', 'カナダ', 'メキシコ'],
  '中南米': ['ブラジル', 'アルゼンチン', 'ペルー', 'チリ', 'コロンビア', 'キューバ', 'コスタリカ'],
  '中東': ['アラブ首長国連邦', 'サウジアラビア', 'トルコ', 'イスラエル', 'ヨルダン', 'カタール', 'オマーン'],
  'アフリカ': ['エジプト', 'モロッコ', '南アフリカ', 'ケニア', 'タンザニア', 'チュニジア'],
  'オセアニア': ['オーストラリア', 'ニュージーランド', 'フィジー', 'グアム', 'パラオ', 'ニューカレドニア'],
};

const countryToggle = document.getElementById('countryToggle');
const countryPanel = document.getElementById('countryPanel');
const countrySummary = document.getElementById('countrySummary');
const countrySearchInput = document.getElementById('countrySearchInput');
const countryCheckboxList = document.getElementById('countryCheckboxList');
const countryEmptyHint = document.getElementById('countryEmptyHint');
const checkedCountries = new Set();

function getSelectedRegions() {
  return regionPanel ? Array.from(regionPanel.querySelectorAll('input[type="checkbox"]:checked')).map((cb) => cb.value) : [];
}

function updateCountrySummary() {
  if (!countrySummary) return;
  const checked = Array.from(checkedCountries);
  if (checked.length === 0) countrySummary.textContent = '未選択';
  else if (checked.length <= 2) countrySummary.textContent = checked.join('、');
  else countrySummary.textContent = checked.length + '件選択中';
}

function syncCountriesToSelectedRegions() {
  const available = new Set(getSelectedRegions().flatMap((region) => COUNTRIES_BY_REGION[region] || []));
  Array.from(checkedCountries).forEach((country) => {
    if (!available.has(country)) checkedCountries.delete(country);
  });
  updateCountrySummary();
}

function renderCountryList() {
  if (!countryCheckboxList) return;
  const selectedRegions = getSelectedRegions();
  const searchTerm = countrySearchInput ? countrySearchInput.value.trim() : '';
  const candidates = selectedRegions.flatMap((region) => COUNTRIES_BY_REGION[region] || []);

  if (candidates.length === 0) {
    countryCheckboxList.innerHTML = '';
    if (countryEmptyHint) countryEmptyHint.hidden = false;
    return;
  }
  if (countryEmptyHint) countryEmptyHint.hidden = true;

  const filtered = candidates.filter((country) => !searchTerm || country.includes(searchTerm) || checkedCountries.has(country));

  countryCheckboxList.innerHTML = filtered.length
    ? filtered.map((country) => (
        '<label><input type="checkbox" value="' + country + '"' + (checkedCountries.has(country) ? ' checked' : '') + '> ' + country + '</label>'
      )).join('')
    : '<p class="location-empty-hint">該当する国が見つかりません</p>';

  countryCheckboxList.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) checkedCountries.add(cb.value);
      else checkedCountries.delete(cb.value);
      updateCountrySummary();
    });
  });
}

if (countryToggle && countryPanel) {
  countryToggle.addEventListener('click', () => {
    countryPanel.hidden = !countryPanel.hidden;
    countryToggle.classList.toggle('is-open', !countryPanel.hidden);
  });
}
if (countrySearchInput) {
  countrySearchInput.addEventListener('input', renderCountryList);
}

renderCountryList();

if (domesticOverseasSelect) updateLocationMode();

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
      if (select.multiple) {
        const values = Array.from(select.selectedOptions).map((opt) => opt.value);
        if (values.length > 0) fields[labelText] = values;
      } else {
        fields[labelText] = select.value;
      }
    });

    panel.querySelectorAll('.field-grid input[type="text"], .field-grid input[type="date"]').forEach((input) => {
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
    submittedToken = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('gitedgift_user_email', email);
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
updatePlanPreview();

(function () {
  const overlay = document.getElementById('gateOverlay');
  const gateChoice = document.getElementById('gateChoice');
  const gateLoginEmail = document.getElementById('gateLoginEmail');
  const gateLoginCode = document.getElementById('gateLoginCode');
  const cards = document.querySelectorAll('.service-card[data-target]');

  if (!overlay || !gateChoice || !gateLoginEmail || !gateLoginCode || cards.length === 0) {
    return;
  }

  const steps = { choice: gateChoice, loginEmail: gateLoginEmail, loginCode: gateLoginCode };
  let targetUrl = 'index.html';

  function showStep(name) {
    Object.values(steps).forEach((s) => { s.hidden = true; });
    steps[name].hidden = false;
  }

  function openGate(target) {
    targetUrl = target;
    overlay.hidden = false;
    showStep('choice');
  }

  function closeGate() {
    overlay.hidden = true;
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openGate(card.dataset.target));
  });

  const gateClose = document.getElementById('gateClose');
  if (gateClose) gateClose.addEventListener('click', closeGate);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeGate();
  });

  const gateNewUser = document.getElementById('gateNewUser');
  if (gateNewUser) {
    gateNewUser.addEventListener('click', () => {
      window.location.href = targetUrl;
    });
  }

  const gateLogin = document.getElementById('gateLogin');
  if (gateLogin) gateLogin.addEventListener('click', () => showStep('loginEmail'));

  const backToChoice1 = document.getElementById('backToChoice1');
  if (backToChoice1) backToChoice1.addEventListener('click', () => showStep('choice'));

  const backToChoice2 = document.getElementById('backToChoice2');
  if (backToChoice2) backToChoice2.addEventListener('click', () => showStep('choice'));

  const sendCodeBtn = document.getElementById('sendCodeBtn');
  if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmailInput');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        alert('メールアドレスを入力してください。');
        return;
      }
      const codeSentTo = document.getElementById('codeSentTo');
      if (codeSentTo) {
        codeSentTo.textContent =
          email + ' 宛に確認コードを送信しました（デモ画面のため実際には送信されません）。';
      }
      showStep('loginCode');
    });
  }

  const resendCodeLink = document.getElementById('resendCodeLink');
  if (resendCodeLink) {
    resendCodeLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert('確認コードを再送しました（デモ画面です）。');
    });
  }

  const verifyCodeBtn = document.getElementById('verifyCodeBtn');
  if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', () => {
      const codeInput = document.getElementById('loginCodeInput');
      const code = codeInput ? codeInput.value.trim() : '';
      if (code.length !== 6) {
        alert('6桁のコードを入力してください。');
        return;
      }
      closeGate();
      window.location.href = targetUrl;
    });
  }
})();

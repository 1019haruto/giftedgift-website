(function () {
  const overlay = document.getElementById('gateOverlay');
  const gateChoice = document.getElementById('gateChoice');
  const gateLoginEmail = document.getElementById('gateLoginEmail');
  const cards = document.querySelectorAll('.service-card[data-target]');

  if (!overlay || !gateChoice || !gateLoginEmail) {
    return;
  }

  const steps = { choice: gateChoice, loginEmail: gateLoginEmail };
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

  const myGiftTriggers = document.querySelectorAll('#navMyGift, #floatingMyGift');
  myGiftTriggers.forEach((btn) => {
    btn.addEventListener('click', () => {
      overlay.hidden = false;
      showStep('loginEmail');
    });
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

  const verifyCodeBtn = document.getElementById('verifyCodeBtn');
  if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('loginEmailInput');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) {
        alert('メールアドレスを入力してください。');
        return;
      }
      const codeInput = document.getElementById('loginCodeInput');
      const code = codeInput ? codeInput.value.trim() : '';
      if (code.length !== 6) {
        alert('6桁のコードを入力してください。');
        return;
      }
      localStorage.setItem('gitedgift_user_email', email);
      closeGate();
      window.location.href = 'mypage.html';
    });
  }
})();

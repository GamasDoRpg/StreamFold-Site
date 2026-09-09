(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const service = window.PilotService;
  const preview = service?.mode === 'frontend-only' && new URLSearchParams(location.search).get('preview') === '1';
  const panels = [...document.querySelectorAll('.page-panel')];
  const links = [...document.querySelectorAll('[data-page]')];
  let toastTimer;

  function notify(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 5000);
  }
  function route(focus) {
    const requested = location.hash.slice(1);
    const selected = panels.some(panel => panel.id === requested) ? requested : 'overview';
    panels.forEach(panel => { panel.hidden = panel.id !== selected; });
    links.forEach(link => {
      if (link.dataset.page === selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const heading = $(selected).querySelector('h1');
    document.title = `${heading.textContent.replace(/\.$/, '')} · DEXIS pilot`;
    if (focus) { heading.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' }); }
  }
  $('login-view').hidden = preview;
  $('portal-view').hidden = !preview;
  if (preview) { route(false); window.addEventListener('hashchange', () => route(true)); }

  // Attach handlers before enabling form submission. Inputs intentionally have no
  // name attributes, so a missing script cannot submit credentials to static hosting.
  async function submit(form, messageId, action) {
    const button = form.querySelector('[type="submit"]');
    const original = button.textContent;
    button.disabled = true;
    button.textContent = 'Please wait…';
    form.setAttribute('aria-busy', 'true');
    $(messageId).textContent = '';
    try { await action(); }
    catch (error) { $(messageId).textContent = error?.code === 'PILOT_NOT_CONNECTED' ? error.message : 'Unable to complete this request. Please try again or contact StreamFold.'; }
    finally { button.disabled = false; button.textContent = original; form.removeAttribute('aria-busy'); }
  }
  $('login-form').addEventListener('submit', event => {
    event.preventDefault();
    const credentials = { email: $('email').value.trim(), password: $('password').value };
    void submit(event.currentTarget, 'login-message', () => service.signIn(credentials)).finally(() => { $('password').value = ''; });
  });
  $('reset-form').addEventListener('submit', event => {
    event.preventDefault();
    void submit(event.currentTarget, 'reset-message', () => service.resetPassword($('reset-email').value.trim()));
  });
  $('password-form').addEventListener('submit', event => {
    event.preventDefault();
    if ($('new-password').value !== $('confirm-password').value) {
      $('password-message').textContent = 'The new passwords do not match.';
      $('confirm-password').focus(); return;
    }
    const values = { currentPassword: $('current-password').value, newPassword: $('new-password').value };
    void submit(event.currentTarget, 'password-message', () => service.changePassword(values)).finally(() => { $('password-form').reset(); });
  });
  if (service) document.querySelectorAll('form [type="submit"]').forEach(button => { button.disabled = false; });

  document.querySelectorAll('[data-toggle-password]').forEach(button => button.addEventListener('click', () => {
    const field = $(button.dataset.togglePassword);
    const show = field.type === 'password';
    field.type = show ? 'text' : 'password';
    button.textContent = show ? 'Hide' : 'Show';
    button.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    button.setAttribute('aria-pressed', String(show));
  }));
  document.querySelectorAll('[data-open-dialog]').forEach(button => button.addEventListener('click', () => {
    const dialog = $(button.dataset.openDialog);
    dialog.querySelector('form').reset();
    dialog.querySelector('.form-message').textContent = '';
    if (dialog.id === 'reset-dialog') $('reset-email').value = $('email').value;
    dialog.showModal();
  }));
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => {
    dialog.querySelector('form').reset();
    dialog.querySelector('.form-message').textContent = '';
  }));
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const target = $(button.dataset.copy);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(target.textContent.trim());
      notify('Copied to clipboard.');
    } catch {
      const selection = window.getSelection();
      const range = document.createRange(); range.selectNodeContents(target);
      selection.removeAllRanges(); selection.addRange(range);
      notify('Text selected. Copy it with your keyboard or device menu.');
    }
  }));
})();

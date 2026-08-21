(function () {
  function getStoredTheme() { return localStorage.getItem('theme'); }
  function effectiveTheme() {
    var stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyIcon(theme) {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.setAttribute('data-current', theme);
  }
  function init() {
    applyIcon(effectiveTheme());
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = effectiveTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      applyIcon(next);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

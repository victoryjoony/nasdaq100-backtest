(function () {
  var LANG_NAMES = { ko: '한국어', en: 'English' };

  function getStoredLang() { return localStorage.getItem('lang'); }
  function effectiveLang() {
    var stored = getStoredLang();
    if (stored === 'ko' || stored === 'en') return stored;
    return 'en';
  }
  function apply(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    var dict = window.I18N || {};
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      var entry = dict[key];
      if (!entry) return;
      var val = entry[lang];
      if (val === undefined) return;
      el.innerHTML = val;
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var spec = el.getAttribute('data-i18n-attr');
      spec.split(';').forEach(function (pair) {
        var parts = pair.split(':');
        if (parts.length !== 2) return;
        var attr = parts[0].trim(), key = parts[1].trim();
        var entry = dict[key];
        if (!entry || entry[lang] === undefined) return;
        el.setAttribute(attr, entry[lang]);
      });
    });
    document.querySelectorAll('[data-i18n-block]').forEach(function (el) {
      el.hidden = el.getAttribute('data-i18n-block') !== lang;
    });
    var label = document.getElementById('langCurrentLabel');
    if (label) label.textContent = lang.toUpperCase();
    document.querySelectorAll('.lang-option').forEach(function (opt) {
      var isCurrent = opt.getAttribute('data-lang-option') === lang;
      opt.setAttribute('aria-selected', String(isCurrent));
      opt.classList.toggle('current', isCurrent);
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  function closeMenu() {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langToggle');
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    var menu = document.getElementById('langMenu');
    var btn = document.getElementById('langToggle');
    if (menu) menu.hidden = false;
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }
  function init() {
    apply(effectiveLang());
    var btn = document.getElementById('langToggle');
    var menu = document.getElementById('langMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.hidden) openMenu(); else closeMenu();
    });
    menu.querySelectorAll('.lang-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var lang = opt.getAttribute('data-lang-option');
        localStorage.setItem('lang', lang);
        apply(lang);
        closeMenu();
        btn.focus();
      });
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== btn) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { closeMenu(); btn.focus(); }
    });
  }
  window.i18nEffectiveLang = effectiveLang;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

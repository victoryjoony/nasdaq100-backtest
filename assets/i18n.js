(function () {
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
    var btn = document.getElementById('langToggle');
    if (btn) btn.textContent = lang === 'ko' ? 'EN' : '한국어';
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }
  function init() {
    apply(effectiveLang());
    var btn = document.getElementById('langToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = effectiveLang() === 'ko' ? 'en' : 'ko';
      localStorage.setItem('lang', next);
      apply(next);
    });
  }
  window.i18nEffectiveLang = effectiveLang;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * Prescott Broadcasting — theme.js
 * Loads theme settings from CMS API and applies them to the page.
 * Injected into every page via <script src="../js/theme.js"></script>
 */
(function() {
  var API = 'https://pbc-cms-production.up.railway.app';

  function applyTheme(t) {
    // Build a dynamic <style> block
    var underline = t.nav_underline === '1' || t.nav_underline === true;
    var css = [
      'nav.main-nav { background: ' + (t.nav_bg || '#fbf3e7') + ' !important; }',
      'nav.main-nav .nav-links li a { color: ' + (t.nav_text || '#1a2f4e') + '; }',
      'nav.main-nav .nav-links li a:hover { color: ' + (t.nav_hover || '#487ea6') + '; }',
      'nav.main-nav .nav-links li a.active { color: ' + (t.nav_active || '#487ea6') + ' !important;' +
        (underline ? ' border-bottom: 3px solid ' + (t.nav_active || '#487ea6') + ' !important;' : ' border-bottom: none !important;') +
        ' font-weight: 800 !important; }',
      'footer { background: ' + (t.footer_bg || '#05254c') + ' !important; }',
      '.footer-col-title { color: ' + (t.footer_heading || '#ffffff') + ' !important; }',
      '.footer-tagline { color: ' + (t.footer_text || 'rgba(255,255,255,0.6)') + ' !important; }',
      '.footer-links li a { color: ' + (t.footer_link || 'rgba(255,255,255,0.75)') + ' !important; }',
      '.footer-links li a:hover { color: ' + (t.footer_link_hover || '#ffffff') + ' !important; }',
      '.footer-contact p { color: ' + (t.footer_text || 'rgba(255,255,255,0.75)') + ' !important; }',
      '.footer-social a { background: rgba(255,255,255,0.1); color: #fff; }',
      '.footer-legal { color: ' + (t.footer_text || 'rgba(255,255,255,0.5)') + ' !important; border-top-color: rgba(255,255,255,0.15) !important; }',
      '.footer-legal-links a { color: ' + (t.footer_text || 'rgba(255,255,255,0.5)') + ' !important; }',
      '.footer-legal-links a:hover { color: ' + (t.footer_link_hover || '#ffffff') + ' !important; }',
      '.stay-connected-box { background: ' + (t.sc_bg || '#f8efe1') + ' !important; }',
      '.hero { background: ' + (t.hero_bg || '#faf3e6') + ' !important; }',
      '.editorial-section { background: ' + (t.content_bg || '#faf3e6') + ' !important; }',
      '.content-wrap { background: ' + (t.content_bg || '#faf3e6') + ' !important; }',
      '.inquiry-section { background: ' + (t.content_bg || '#faf3e6') + ' !important; }',
      '.psa-section { background: ' + (t.content_bg || '#faf3e6') + ' !important; }',
      '.event-submit-section { background: ' + (t.content_bg || '#faf3e6') + ' !important; }',
      'body { background: ' + (t.content_bg || '#faf3e6') + ' !important; }',
      '.stations-section { background: ' + (t.stations_bg || '#6c8ea3') + ' !important; }',
      '.station-card { color: ' + (t.stations_text || '#ffffff') + ' !important; }',
      '.station-name { color: ' + (t.stations_text || '#ffffff') + ' !important; }',
      '.station-tagline { color: ' + (t.stations_text || 'rgba(255,255,255,0.7)') + ' !important; }',
      '.station-btn.primary { background: ' + (t.stations_btn_bg || '#6c8ea3') + ' !important; border-color: rgba(255,255,255,0.8) !important; }',
      '.station-btn { color: ' + (t.stations_btn_text || '#ffffff') + ' !important; }',
      '.station-link { color: ' + (t.stations_btn_text || 'rgba(255,255,255,0.8)') + ' !important; }',
      '.more-than-radio { background: ' + (t.mtr_bg || '#faf3e6') + ' !important; }',
    ];

    // Footer graphic — store it and apply whenever the MTR section is ready
    window._pbcFooterGraphic = t.footer_graphic || null;
    window._pbcCmsApi = API;
    applyFooterGraphic();

    var styleEl = document.getElementById('pbc-theme');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'pbc-theme';
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css.join('\n');
  }

  function applyFooterGraphic() {
    if (!window._pbcFooterGraphic) return;
    var bgEl = document.querySelector('.more-than-radio-bg img');
    if (bgEl) {
      var fg = window._pbcFooterGraphic;
      bgEl.src = fg.startsWith('http') ? fg : (window._pbcCmsApi + '/' + fg);
    }
  }

  // Expose so layout.js can call after building the MTR section
  window.applyFooterGraphic = applyFooterGraphic;

  // Load and apply
    fetch(API + '/api/theme?station=calmaz')
    .then(function(r) { return r.json(); })
    .then(function(t) { applyTheme(t); })
    .catch(function() {}); // fail silently — CSS fallbacks handle it
})();

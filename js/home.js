/**
 * home.js v4 — Stations from CMS API, cards from CMS API
 */

var CMS_API = 'https://pbc-cms-production.up.railway.app';

document.addEventListener('site-config-loaded', function(e) {
  var cfg = e.detail;
  var root = window.SITE_ROOT || './';

  // ── STATIONS GRID — from CMS API ───────────────────────────
  var stationsGrid = document.getElementById('stations-grid');
  if (stationsGrid) {
    fetch(CMS_API + '/api/stations')
      .then(function(r) { return r.json(); })
      .then(function(stations) {
        stationsGrid.innerHTML = stations.map(function(s) {
          var logo = s.logo
            ? (s.logo.startsWith('uploads/') ? CMS_API + '/' + s.logo : root + s.logo)
            : '';
          var isExplore = s.button_style === 'explore';
          var primaryLabel = s.primary_btn_label || (isExplore ? 'EXPLORE' : '((&bull;)) LISTEN LIVE');
          var primaryHref = isExplore ? (s.external_url || '#') : (s.listen_live_url || '#');
          var secondaryLabel = s.secondary_btn_label || (isExplore ? (s.name + ' &rsaquo;') : 'SCHEDULE &amp; SHOWS &rsaquo;');
          var secondaryHref = s.external_url || '#';

          return '<div class="station-card">' +
            '<a href="' + (s.external_url||'#') + '" target="_blank" rel="noopener" class="station-logo-link">' +
              '<div class="station-logo-wrap">' +
                (logo ? '<img src="' + logo + '" alt="' + s.name + '" style="max-width:' + (s.logo_size||100) + '%;max-height:' + (s.logo_size||100) + '%;width:auto;height:auto;" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'block\'" />' : '') +
                '<span class="station-logo-fallback" style="display:none">' + s.name + '</span>' +
              '</div>' +
            '</a>' +
            '<div class="station-actions">' +
              '<a href="' + primaryHref + '" class="station-btn primary" target="_blank" rel="noopener">' + primaryLabel + '</a>' +
              '<a href="' + secondaryHref + '" class="station-link" target="_blank" rel="noopener">' + secondaryLabel + '</a>' +
            '</div>' +
          '</div>';
        }).join('');
      })
      .catch(function() {
        // Fallback to site-config
        stationsGrid.innerHTML = cfg.stations.map(function(s) {
          var isExplore = s.buttonStyle === 'explore';
          return '<div class="station-card">' +
            '<div class="station-logo-wrap"><img src="' + root + s.logo + '" alt="' + s.name + '" /></div>' +
            '<div class="station-actions">' +
              '<a href="' + (isExplore ? s.externalUrl : s.listenLiveUrl) + '" class="station-btn primary" target="_blank">' + (isExplore ? 'EXPLORE' : '((&bull;)) LISTEN LIVE') + '</a>' +
              '<a href="' + s.externalUrl + '" class="station-link" target="_blank">' + (isExplore ? s.name : 'SCHEDULE &amp; SHOWS') + ' &rsaquo;</a>' +
            '</div></div>';
        }).join('');
      });
  }

  // ── CARDS GRID — from CMS API ──────────────────────────────
  var cardsGrid = document.getElementById('cards-grid');
  if (cardsGrid) {
    cardsGrid.innerHTML = [1,2,3,4].map(function() {
      return '<div class="content-card" style="background:#f0e8dc;border-radius:8px;min-height:280px;"></div>';
    }).join('');
    fetch(CMS_API + '/api/cards')
      .then(function(r) { return r.json(); })
      .then(function(cards) {
        cardsGrid.innerHTML = cards.map(function(card) {
          var imgSrc = card.image
            ? (card.image.startsWith('http') ? card.image : CMS_API + '/' + card.image)
            : (root + 'images/card-' + card.card_id + '.png');
          return (
            '<a href="' + root + (card.cta_url || '#') + '" class="content-card content-card-link">' +
              '<div class="content-card-image">' +
                '<img src="' + imgSrc + '" alt="' + (card.image_alt || card.title) + '" />' +
              '</div>' +
              '<p class="content-card-body">' + (card.body || '') + '</p>' +
              '<span class="content-card-cta">' + (card.cta_label || '') + ' &rsaquo;</span>' +
            '</a>'
          );
        }).join('');
      })
      .catch(function() {});
  }
});

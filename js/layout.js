/**
 * CalmArizona — layout.js
 * Builds nav and footer from site-config.json
 */
(function() {
  var CFG_URL = 'site-config.json';
  var depth = parseInt(document.currentScript?.getAttribute('data-depth') || '0');
  var root = depth === 0 ? '' : '../'.repeat(depth);
  var API = 'https://pbc-cms-production.up.railway.app';

  var SVG = {
    search: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    menu:   '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    fb:     '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    ig:     '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>',
    yt:     '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>',
    email:  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>'
  };

  function socialHTML(social) {
    var html = '';
    if (social.facebook)  html += '<a href="'+social.facebook+'" target="_blank" rel="noopener">'+SVG.fb+'</a>';
    if (social.instagram) html += '<a href="'+social.instagram+'" target="_blank" rel="noopener">'+SVG.ig+'</a>';
    if (social.youtube)   html += '<a href="'+social.youtube+'" target="_blank" rel="noopener">'+SVG.yt+'</a>';
    if (social.email)     html += '<a href="'+social.email+'">'+SVG.email+'</a>';
    return html;
  }

  function parseActivePages(cfg) {
    var defaults = ['home','news','events','podcasts','schedule','shows','advertise','about','fcc','contact','public-inspection-help','employment','archive'];
    var val = cfg._activePages;
    if (!val) return defaults;
    if (Array.isArray(val)) return val;
    try { return JSON.parse(val); } catch(e) { return defaults; }
  }
  function pageKeyFromUrl(url) {
    url = (url || '').replace(/^\//,'').replace(/^pages\//,'').replace(/\.html$/,'');
    if (url === 'index') return 'home';
    return url;
  }
  function isPageActive(cfg, key) {
    return parseActivePages(cfg).indexOf(key) !== -1;
  }

  function buildNav(cfg) {
    var links = cfg.nav.links.filter(function(l) {
      return isPageActive(cfg, pageKeyFromUrl(l.url));
    }).map(function(l) {
      var href = root + l.url.replace(/^\//, '');
      var _lu = l.url.replace(/^\//, '');
      var _pn = window.location.pathname;
      var active = _pn.endsWith(_lu) ||
                   (_lu === 'index.html' && (_pn === '/' || _pn.endsWith('/'))) ||
                   (_pn.endsWith('/') && _lu === 'index.html');
      return '<li><a href="'+href+'"'+(active?' class="active"':'')+'>'+l.label+'</a></li>';
    }).join('');

    return '<nav class="main-nav">'
      + '<div class="main-nav-inner">'
      +   '<a href="'+root+'index.html" class="nav-logo">'
      +     '<img src="'+root+cfg.site.logo+'" alt="'+cfg.site.name+'" />'
      +   '</a>'
      +   '<div class="nav-right">'
      +     '<div class="nav-links-wrap">'
      +       '<ul class="nav-links" id="main-nav-links">'+links+'</ul>'
      +       '<div class="nav-actions">'
      +         '<button class="nav-search" aria-label="Search">'+SVG.search+'</button>'
      +         '<button class="nav-hamburger" id="nav-hamburger" aria-label="Menu">'+SVG.menu+'</button>'
      +       '</div>'
      +     '</div>'
      +     '<div class="nav-social">'+socialHTML(cfg.site.social)+'</div>'
      +   '</div>'
      + '</div>'      + '</nav>';
  }

  function buildFooter(cfg) {
    var mtrGraphic = cfg._footerGraphic || '';
    var mtrBg = cfg._mtrBg || '#faf3e6';
    var mtrSection = mtrGraphic
      ? '<section class="more-than-radio" style="background:'+mtrBg+' !important;">'
        + '<div class="more-than-radio-bg"><img src="'
        + (mtrGraphic.startsWith('http') ? mtrGraphic : mtrGraphic.startsWith('/uploads/') ? 'https://pbc-cms-production.up.railway.app' + mtrGraphic : mtrGraphic.startsWith('uploads/') ? 'https://pbc-cms-production.up.railway.app/' + mtrGraphic : mtrGraphic)
        + '" alt="CALMAZ" style="width:100%;display:block;" /></div>'
        + '</section>'
      : '';
    var cols = cfg.footer.columns.map(function(col) {
      var links = col.links.filter(function(l) {
        return l.url.startsWith('http') || isPageActive(cfg, pageKeyFromUrl(l.url));
      }).map(function(l) {
        var href = l.url.startsWith('http') ? l.url : root + l.url;
        return '<li><a href="'+href+'">'+l.label+'</a></li>';
      }).join('');
      return '<div class="footer-col">'
        + '<div class="footer-col-title">'+col.title+'</div>'
        + '<ul class="footer-links">'+links+'</ul>'
        + '</div>';
    }).join('');

    var st = cfg.station;
    return mtrSection + '<footer>'
      + '<div class="footer-grid">'
      +   '<div class="footer-logo-col">'
      +     '<div class="footer-logo"><img src="'+root+'images/logo-calmaz.png" alt="'+cfg.site.name+'" onerror="this.src=\''+root+cfg.site.logo+'\'" /></div>'
      +     '<div class="footer-tagline">'+st.frequency+'<br>'+st.tagline+'</div>'
      +   '</div>'
      +   '<div class="footer-right-group">'
      +   cols
      +   '<div class="footer-col footer-contact">'
      +     '<div class="footer-col-title">Contact Us</div>'
      +     '<p>'+st.address+'<br>'+st.city+'<br>'
      +       '<a href="tel:'+st.phone+'">'+st.phone+'</a><br>'
      +       '<a href="mailto:'+st.email+'">'+st.email+'</a>'
      +     '</p>'
      +   '</div>'
      +   '</div>'
      + '</div>'
      + '<div class="footer-legal">'
      +   '<span>'+cfg.footer.legal.copyright+'</span>'
      +   '<div class="footer-legal-links">'
      +     '<a href="'+root+cfg.footer.legal.privacyPolicyUrl.replace(/^\//, '')+'">Privacy Policy</a>'
      +     '<a href="'+root+cfg.footer.legal.termsUrl.replace(/^\//, '')+'">Terms of Use</a>'
      +   '</div>'
      + '</div>'
      + '</footer>';
  }

  // ── SEARCH ─────────────────────────────────────────────────────────────────
  function initSearch(root) {
    if (!document.getElementById('pbc-search-overlay')) {
      var overlay = document.createElement('div');
      overlay.id = 'pbc-search-overlay';
      overlay.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(3,42,72,.92);z-index:99999;padding:80px 24px 24px;box-sizing:border-box;';
      overlay.innerHTML = '<div style="max-width:680px;margin:0 auto;">'
        + '<div style="display:flex;gap:12px;margin-bottom:24px;">'
        + '<input id="pbc-search-input" type="text" placeholder="Search news, events\u2026" style="flex:1;padding:14px 18px;font-size:17px;border-radius:8px;border:none;outline:none;font-family:inherit;"/>'
        + '<button onclick="document.getElementById(\'pbc-search-overlay\').style.display=\'none\'" style="background:rgba(255,255,255,.15);border:none;color:#fff;font-size:22px;padding:0 18px;border-radius:8px;cursor:pointer;">&#10005;</button>'
        + '</div>'
        + '<div id="pbc-search-results" style="display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto;"></div>'
        + '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.style.display = 'none'; });
    }
    var input = document.getElementById('pbc-search-input');
    if (input && !input._wired) {
      input._wired = true;
      var t;
      input.addEventListener('input', function() {
        clearTimeout(t);
        var q = this.value.trim();
        if (q.length < 2) { document.getElementById('pbc-search-results').innerHTML = ''; return; }
        t = setTimeout(function() { runSearch(q, root); }, 280);
      });
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { var q = this.value.trim(); if (q.length >= 2) runSearch(q, root); }
      });
    }
    var btn = document.querySelector('.nav-search');
    if (btn && !btn._wired) {
      btn._wired = true;
      btn.addEventListener('click', function() {
        document.getElementById('pbc-search-overlay').style.display = 'block';
        setTimeout(function() { document.getElementById('pbc-search-input').focus(); }, 50);
      });
    }
    var hb = document.getElementById('nav-hamburger');
    if (hb && !hb._wired) {
      hb._wired = true;
      hb.addEventListener('click', function() {
        var nl = document.getElementById('main-nav-links');
        if (nl) nl.style.display = nl.style.display === 'flex' ? 'none' : 'flex';
      });
    }
  }

  function runSearch(q, root) {
    var results = document.getElementById('pbc-search-results');
    results.innerHTML = '<div style="color:rgba(255,255,255,.6);font-size:14px;padding:12px 0;">Searching\u2026</div>';
    var ql = q.toLowerCase();
    Promise.all([
      fetch(API + '/api/news?limit=200&station_id=calmaz').then(function(r){return r.json();}).catch(function(){return {};}),
      fetch(API + '/api/events?limit=200').then(function(r){return r.json();}).catch(function(){return [];})
    ]).then(function(data) {
      var news = (data[0].items || data[0]) || [];
      var events = data[1] || [];
      var hits = [];
      news.forEach(function(n) {
        if ((n.headline||'').toLowerCase().indexOf(ql) >= 0 || (n.body||'').toLowerCase().indexOf(ql) >= 0)
          hits.push({ type:'News', label:n.headline, sub:n.category||'', href:root+'pages/news.html' });
      });
      events.forEach(function(e) {
        if ((e.title||'').toLowerCase().indexOf(ql) >= 0 || (e.description||'').toLowerCase().indexOf(ql) >= 0)
          hits.push({ type:'Event', label:e.title, sub:(e.event_date||'')+(e.location?' \u00b7 '+e.location:''), href:root+'pages/events.html' });
      });
      if (!hits.length) {
        results.innerHTML = '<div style="color:rgba(255,255,255,.5);font-size:14px;padding:12px 0;">No results for \u201c'+q+'\u201d</div>';
        return;
      }
      results.innerHTML = '';
      hits.slice(0,12).forEach(function(h) {
        var a = document.createElement('a');
        a.href = h.href;
        a.style.cssText = 'display:block;background:rgba(255,255,255,.08);border-radius:8px;padding:14px 16px;text-decoration:none;margin-bottom:8px;';
        a.addEventListener('mouseover', function(){ this.style.background='rgba(255,255,255,.15)'; });
        a.addEventListener('mouseout',  function(){ this.style.background='rgba(255,255,255,.08)'; });
        a.addEventListener('click', function(){ document.getElementById('pbc-search-overlay').style.display='none'; });
        a.innerHTML = '<div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#487ea6;margin-bottom:4px;">'+h.type+'</div>'
          + '<div style="font-size:15px;font-weight:600;color:#fff;margin-bottom:3px;">'+h.label+'</div>'
          + (h.sub ? '<div style="font-size:12px;color:rgba(255,255,255,.55);">'+h.sub+'</div>' : '');
        results.appendChild(a);
      });
    });
  }

  // ── THEME ──────────────────────────────────────────────────────────────────
  function applyTheme(t) {
    var underline = t.nav_underline === '1' || t.nav_underline === true;
    var css = [
      'nav.main-nav { background: '+(t.nav_bg||'#fff7ec')+' !important; }',
      '.more-than-radio { background: '+(t.mtr_bg||'#faf3e6')+' !important; }',
      'nav.main-nav .nav-links li a { color: '+(t.nav_text||'#1a2f4e')+'; }',
      'nav.main-nav .nav-links li a:hover { color: '+(t.nav_hover||'#487ea6')+'; }',
      'nav.main-nav .nav-links li a.active { color: '+(t.nav_active||'#487ea6')+' !important;'+(underline?' border-bottom: 3px solid '+(t.nav_active||'#487ea6')+' !important;':' border-bottom: none !important;')+' font-weight: 800 !important; }',
      'footer { background: '+(t.footer_bg||'#05254c')+' !important; }',
      '.footer-col-title { color: '+(t.footer_heading||'#ffffff')+' !important; }',
      '.footer-links li a { color: '+(t.footer_link||'rgba(255,255,255,0.75)')+' !important; }',
      '.footer-contact p { color: '+(t.footer_text||'rgba(255,255,255,0.75)')+' !important; }',
      '.footer-legal { color: '+(t.footer_text||'rgba(255,255,255,0.5)')+' !important; border-top-color: rgba(255,255,255,0.15) !important; }',
    ];
    var el = document.getElementById('calmaz-theme');
    if (!el) { el = document.createElement('style'); el.id = 'calmaz-theme'; document.head.appendChild(el); }
    el.textContent = css.join('\n');
  }


  // ── AD BANNER ROTATOR ──────────────────────────────────────────────────────
  function initAdBanner() {
    fetch(API + '/api/ads/calmaz')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        var settings = d.settings || {};
        var ads = d.ads || [];
        var banner = document.getElementById('calmaz-ad-banner');
        if (!banner) return;

        // Hide if disabled or no ads
        if (!settings.enabled || !ads.length) {
          banner.style.display = 'none';
          return;
        }

        var interval = (settings.rotation_seconds || 6) * 1000;
        var current = 0;

        // Build all img elements up front — swap src only on rotation, no DOM rebuild
        function buildBanner() {
          var ad = ads[0];
          var src = ad.image.startsWith('http') ? ad.image : ad.image.startsWith('/uploads/') ? 'https://pbc-cms-production.up.railway.app' + ad.image : 'https://pbc-cms-production.up.railway.app/uploads/' + ad.image.split('/').pop();
          if (ad.link_url) {
            banner.innerHTML = '<a id="calmaz-ad-link" href="' + ad.link_url + '" target="_blank" rel="noopener" style="display:inline-block;">'
              + '<img id="calmaz-ad-img" src="' + src + '" alt="Advertisement" style="max-width:100%;height:auto;display:inline-block;" />'
              + '</a>';
          } else {
            banner.innerHTML = '<img id="calmaz-ad-img" src="' + src + '" alt="Advertisement" style="max-width:100%;height:auto;display:inline-block;" />';
          }
          banner.style.display = 'block';
        }

        function showAd(idx) {
          var ad = ads[idx];
          var src = ad.image.startsWith('http') ? ad.image : ad.image.startsWith('/uploads/') ? 'https://pbc-cms-production.up.railway.app' + ad.image : 'https://pbc-cms-production.up.railway.app/uploads/' + ad.image.split('/').pop();
          var img = document.getElementById('calmaz-ad-img');
          var link = document.getElementById('calmaz-ad-link');
          if (img) img.src = src;
          if (link) link.href = ad.link_url || '#';
        }

        buildBanner();

        if (ads.length > 1) {
          setInterval(function() {
            current = (current + 1) % ads.length;
            showAd(current);
          }, interval);
        }
      })
      .catch(function() {
        var banner = document.getElementById('calmaz-ad-banner');
        if (banner) banner.style.display = 'none';
      });
  }

  // ── INIT ───────────────────────────────────────────────────────────────────
  Promise.all([
    fetch(root + CFG_URL).then(function(r) { return r.json(); }),
    fetch(API + '/api/station-globals/calmaz').then(function(r) { return r.json(); }).catch(function() { return {}; }),
    fetch(API + '/api/theme?station=calmaz').then(function(r) { return r.json(); }).catch(function() { return {}; })
  ]).then(function(results) {
    var cfg = results[0];
    var globals = results[1];
    var theme = results[2];

    // Merge live CMS globals into station config
    if (globals.name)             cfg.station.name       = globals.name;
    if (globals.frequency)        cfg.station.frequency  = globals.frequency;
    if (globals.station_tagline)  cfg.station.tagline    = globals.station_tagline;
    if (globals.tagline)          cfg.site.tagline       = globals.tagline;
    if (globals.listen_url)       cfg.station.listenUrl  = globals.listen_url;
    if (globals.phone)            cfg.station.phone      = globals.phone;
    if (globals.email)            cfg.station.email      = globals.email;
    if (globals.address)          cfg.station.address    = globals.address;
    if (globals.city)             cfg.station.city       = globals.city;
    if (globals.copyright)        cfg.footer.legal.copyright = globals.copyright;
    if (globals.social_facebook)  cfg.site.social.facebook   = globals.social_facebook;
    if (globals.social_instagram) cfg.site.social.instagram  = globals.social_instagram;
    if (globals.social_youtube)   cfg.site.social.youtube    = globals.social_youtube;
    if (globals.social_email)     cfg.site.social.email      = globals.social_email;
    if (globals.nav_bg)           cfg._navBg                 = globals.nav_bg;
    if (globals.footer_graphic)   cfg._footerGraphic         = globals.footer_graphic;
    if (globals.footer_bg)        cfg._footerBg              = globals.footer_bg;
    if (globals.mtr_bg)           cfg._mtrBg                 = globals.mtr_bg;
    if (globals.active_pages)     cfg._activePages            = globals.active_pages;

    window.CALMAZ_CFG = cfg;
    window.CALMAZ_API = API;
    window.CALMAZ_ROOT = root;

    var headerEl = document.getElementById('site-header');
    var footerEl = document.getElementById('site-footer');
    if (headerEl) {
      // Insert nav as sibling BEFORE site-header
      var navDiv = document.createElement('div');
      navDiv.innerHTML = buildNav(cfg);
      while (navDiv.firstChild) {
        headerEl.parentNode.insertBefore(navDiv.firstChild, headerEl);
      }
      headerEl.parentNode.removeChild(headerEl);

      // On inner pages only: inject on-air bar after the nav
      var isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
      if (!isHome && !document.getElementById('on-air-bar')) {
        var onAirHtml = '<div class="on-air-bar" id="on-air-bar" style="display:none;padding-bottom:12px;">'
          + '<span class="on-air-badge">On Air Now</span>'
          + '<span class="on-air-show" id="on-air-show"></span>'
          + '<span class="on-air-host" id="on-air-host"></span>'
          + '<span class="on-air-time" id="on-air-time"></span>'
          + '<div style="display:flex;gap:10px;margin-left:auto;flex-shrink:0;align-items:center;">'
          + '<a href="#" data-listen="calmaz" style="display:inline-flex;align-items:center;gap:6px;background:#a04da6;color:#fff;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;text-decoration:none;white-space:nowrap;">&#9654; Listen Live</a>'
          + '<button id="watch-live-btn" style="display:none;align-items:center;gap:6px;background:rgba(255,255,255,.15);color:#fff;padding:6px 14px;border-radius:6px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;cursor:pointer;white-space:nowrap;border:1px solid rgba(255,255,255,.3);">&#128250; Watch Live</button>'
          + '</div>'
          + '</div>';
        var nav = document.querySelector('nav.main-nav');
        if (nav && nav.nextSibling) {
          nav.parentNode.insertBefore(createEl(onAirHtml), nav.nextSibling);
        } else if (nav) {
          nav.parentNode.appendChild(createEl(onAirHtml));
        }
      }
    }

    function createEl(html) {
      var d = document.createElement('div');
      d.innerHTML = html;
      return d.firstChild;
    }

    // Wrap nav + on-air-bar + weather-band in a single sticky container
    // This is the only reliable way to stack sticky elements without offset math
    setTimeout(function() {
      var nav = document.querySelector('nav.main-nav');
      var onAir = document.getElementById('on-air-bar');
      var weather = document.getElementById('calmaz-weather-band');
      if (!nav || !nav.parentNode) return;

      var wrapper = document.createElement('div');
      wrapper.id = 'calmaz-sticky-stack';
      wrapper.style.cssText = 'position:static;';

      // Insert wrapper before nav
      nav.parentNode.insertBefore(wrapper, nav);
      wrapper.appendChild(nav);
      if (onAir) wrapper.appendChild(onAir);
      if (weather) wrapper.appendChild(weather);

      // Remove individual sticky from children - parent handles it
      nav.style.position = 'relative';
      if (onAir) onAir.style.cssText = onAir.style.cssText.replace(/top:[^;]+;?/g, '');
      if (weather) weather.style.cssText = weather.style.cssText.replace(/top:[^;]+;?/g, '');
    }, 50);
    if (footerEl) footerEl.innerHTML = buildFooter(cfg);
    // Homepage has its own hardcoded on-air bar logic — skip on index
    if (!window.location.pathname.endsWith("index.html") && window.location.pathname !== "/") initOnAirBar();

    initSearch(root);
    // Merge station_globals nav overrides into theme (station_globals wins)
    if (globals.nav_active)   theme.nav_active   = globals.nav_active;
    if (globals.nav_hover)    theme.nav_hover    = globals.nav_hover;
    if (globals.nav_underline !== undefined) theme.nav_underline = globals.nav_underline;
    if (globals.nav_bg)       theme.nav_bg       = globals.nav_bg;
    if (globals.footer_bg)    theme.footer_bg    = globals.footer_bg;
    applyTheme(theme);
    initAdBanner();
    initWeatherReport(globals);
    // Apply CALMAZ-specific nav bg AFTER theme
    if (cfg._navBg) {
      var nbStyle = document.getElementById('calmaz-nav-bg');
      if (!nbStyle) { nbStyle = document.createElement('style'); nbStyle.id = 'calmaz-nav-bg'; document.head.appendChild(nbStyle); }
      nbStyle.textContent = 'nav.main-nav { background: ' + cfg._navBg + ' !important; }';
    }

    // Apply CALMAZ-specific footer bg AFTER theme (so it wins)
    if (cfg._footerBg) {
      var fbStyle = document.getElementById('calmaz-footer-bg');
      if (!fbStyle) { fbStyle = document.createElement('style'); fbStyle.id = 'calmaz-footer-bg'; document.head.appendChild(fbStyle); }
      fbStyle.textContent = 'footer { background: ' + cfg._footerBg + ' !important; border-top: none !important; }';
    }
  }).catch(function(e) { console.error('CALMAZ layout.js: init failed', e); });


  function initWeatherReport(globals) {
    var raw = globals.weather_report_url || '';
    if (!raw) return;
    var playerEl = document.getElementById('calmaz-weather-player');
    var reportEl = document.getElementById('calmaz-weather-report');
    if (!playerEl || !reportEl) return;
    // If they pasted a full iframe embed, extract the src URL
    var srcMatch = raw.match(/src=["']([^"']+)["\']/);
    if (srcMatch) {
      // Already a full embed — inject directly but override dimensions
      playerEl.innerHTML = '<iframe width="500" height="90" scrolling="no" frameborder="no" allow="autoplay"'
        + ' style="border-radius:4px;" src="' + srcMatch[1] + '"></iframe>';
    } else {
      // Plain SoundCloud URL — build embed
      var url = raw.trim();
      var embedUrl = 'https://w.soundcloud.com/player/?url=' + encodeURIComponent(url)
        + '&color=%23c0392b&auto_play=false&hide_related=true&show_comments=false'
        + '&show_user=true&show_reposts=false&show_teaser=false&visual=false'
        + '&buying=false&liking=false&download=false&sharing=false';
      playerEl.innerHTML = '<iframe width="500" height="90" scrolling="no" frameborder="no" allow="autoplay"'
        + ' style="border-radius:4px;" src="' + embedUrl + '"></iframe>';
    }
    reportEl.style.display = 'flex';
  }

  function initOnAirBar() {
    var API_URL = window.CALMAZ_API || 'https://pbc-cms-production.up.railway.app';
    // Keep on-air bar current for visitors who leave the site open.
    if (!window.CALMAZ_ON_AIR_TIMER) {
      window.CALMAZ_ON_AIR_TIMER = setInterval(initOnAirBar, 60000);
      window.addEventListener('focus', initOnAirBar);
      document.addEventListener('visibilitychange', function() {
        if (!document.hidden) initOnAirBar();
      });
    }
    function fmtH(h) {
      if (h === 0) return '12:00 AM';
      if (h === 12) return '12:00 PM';
      return h < 12 ? h + ':00 AM' : (h - 12) + ':00 PM';
    }
    var now = new Date();
    var day = now.getDay();
    var nowH = now.getHours();
    var dayGroups = {0:'sun',1:'mon',2:'tue-fri',3:'tue-fri',4:'tue-fri',5:'tue-fri',6:'sat'};
    // fallback groups same as homepage
    var todayGroup = dayGroups[day] || 'mon';

    fetch(API_URL + '/api/recent-tracks/kahm?ts=' + Date.now())
      .then(function(r) { return r.json(); })
      .then(function(tracks) {
        var bar = document.getElementById('on-air-bar');
        if (!bar) return;
        if (!tracks || !tracks.length) { bar.style.display = 'none'; setStickyOffsets(); return; }
        var t = tracks[0];
        function tc(s) { return (s||'').toLowerCase().replace(/\w/g, function(c){ return c.toUpperCase(); }); }
        var showEl = document.getElementById('on-air-show');
        var hostEl = document.getElementById('on-air-host');
        var timeEl = document.getElementById('on-air-time');
        if (showEl) showEl.textContent = tc(t.title || '');
        if (hostEl) hostEl.textContent = tc(t.artist || '');
        if (timeEl) timeEl.textContent = t.localtime || '';
        bar.style.display = 'flex';
        setStickyOffsets();
      })
      .catch(function() {});
  }

  // Known heights from CSS (nav logo = 180px)
  var NAV_H = 180;
  var ONAIR_H = 48; // padding 14+12 + single content line

  function setStickyOffsets() {
    var onAirBar = document.getElementById('on-air-bar');
    var weatherBand = document.getElementById('calmaz-weather-band');
    if (!weatherBand) return;

    var onAirVisible = onAirBar && window.getComputedStyle(onAirBar).display !== 'none';
    weatherBand.style.top = (NAV_H + (onAirVisible ? ONAIR_H : 0)) + 'px';
    if (onAirBar) onAirBar.style.top = NAV_H + 'px';
  }

  document.addEventListener('DOMContentLoaded', setStickyOffsets);
  window.addEventListener('load', setStickyOffsets);
  window.addEventListener('resize', setStickyOffsets);

})();

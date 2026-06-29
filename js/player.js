/**
 * CALMAZ Player — StreamGuys audio (with ads) + schedule-aware Watch Live video
 * Persists across page navigation via localStorage
 */
(function() {
  var STREAM_URL       = '';
  var STREAMGUYS_URL   = '';
  var API_URL          = 'https://pbc-cms-production.up.railway.app';
  var STORAGE_KEY      = 'calmaz_player_open';
  var VOL_KEY          = 'calmaz_volume';
  var POLL_INTERVAL    = 5 * 60 * 1000; // check schedule every 5 min

  // ── Inject CSS ──────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = `
    #calmaz-player-widget {
      position: fixed;
      bottom: -420px;
      right: 24px;
      width: 320px;
      background: #05254c;
      border-radius: 12px 12px 0 0;
      box-shadow: 0 -4px 32px rgba(0,0,0,0.45);
      z-index: 99999;
      transition: bottom 0.35s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.1);
      border-bottom: none;
    }
    #calmaz-player-widget.visible { bottom: 0; }

    /* Header bar */
    #calmaz-player-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #021d35;
      border-bottom: 2px solid #487ea6;
      cursor: pointer;
      user-select: none;
    }
    #calmaz-player-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #calmaz-player-logo-img {
      height: 28px;
      width: auto;
      object-fit: contain;
    }
    .calmaz-live-dot {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: #487ea6;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: .1em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 3px;
    }
    .calmaz-live-dot::before {
      content: '';
      width: 5px; height: 5px;
      background: #fff;
      border-radius: 50%;
      animation: calmaz-pulse 1.2s ease-in-out infinite;
    }
    @keyframes calmaz-pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:.4; transform:scale(.7); }
    }
    #calmaz-player-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    #calmaz-minimize-btn, #calmaz-close-btn {
      background: none;
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 16px;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1;
      transition: color .15s, background .15s;
    }
    #calmaz-minimize-btn:hover, #calmaz-close-btn:hover {
      color: #fff;
      background: rgba(255,255,255,0.1);
    }

    /* On-air info bar */
    #calmaz-on-air-bar {
      padding: 8px 14px;
      background: rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    #calmaz-on-air-show {
      font-size: 12px;
      font-weight: 700;
      color: #fff;
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #calmaz-watch-live-btn {
      display: none;
      align-items: center;
      gap: 5px;
      background: #487ea6;
      color: #fff;
      border: none;
      border-radius: 5px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: .05em;
      text-transform: uppercase;
      padding: 5px 10px;
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
      transition: background .15s;
      animation: calmaz-pulse-btn 2s ease-in-out infinite;
    }
    #calmaz-watch-live-btn:hover { background: #315f83; animation: none; }
    @keyframes calmaz-pulse-btn {
      0%,100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.5); }
      50%      { box-shadow: 0 0 0 6px rgba(192,57,43,0); }
    }

    /* Player iframe area */
    #calmaz-player-body {
      position: relative;
      width: 100%;
      background: #000;
    }
    #calmaz-player-iframe {
      width: 100%;
      height: 220px;
      border: none;
      display: block;
    }
    /* Video mode — taller */
    #calmaz-player-widget.video-mode #calmaz-player-iframe {
      height: 280px;
    }
    #calmaz-player-widget.video-mode {
      width: 380px;
    }

    /* Audio controls */
    #calmaz-audio-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: #021d35;
    }
    #calmaz-play-btn {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: #487ea6;
      border: none;
      cursor: pointer;
      color: #fff;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      transition: background .15s, transform .1s;
    }
    #calmaz-play-btn:hover { background: #315f83; transform: scale(1.07); }
    #calmaz-audio-info { flex: 1; min-width: 0; }
    #calmaz-track-label {
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    #calmaz-vol-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #calmaz-vol-icon {
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      cursor: pointer;
      user-select: none;
    }
    #calmaz-vol {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 3px;
      background: rgba(255,255,255,0.2);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }
    #calmaz-vol::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px; height: 12px;
      border-radius: 50%;
      background: #487ea6;
      cursor: pointer;
    }
    #calmaz-vol::-moz-range-thumb {
      width: 12px; height: 12px;
      border-radius: 50%;
      background: #487ea6;
      border: none;
    }
    #calmaz-player-widget.video-mode #calmaz-audio-mode { display: none; }

    /* Back to audio button (shown in video mode) */
    #calmaz-back-audio-btn {
      display: none;
      width: 100%;
      background: rgba(0,0,0,0.3);
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
      font-size: 11px;
      padding: 6px;
      cursor: pointer;
      text-align: center;
      transition: color .15s;
    }
    #calmaz-back-audio-btn:hover { color: #fff; }
    #calmaz-player-widget.video-mode #calmaz-back-audio-btn { display: block; }

    body.calmaz-player-open { padding-bottom: 0; }

    @media (max-width: 400px) {
      #calmaz-player-widget { width: calc(100vw - 16px); right: 8px; }
      #calmaz-player-widget.video-mode { width: calc(100vw - 16px); }
    }
  `;
  document.head.appendChild(style);

  // ── Build HTML ───────────────────────────────────────────────
  var widget = document.createElement('div');
  widget.id = 'calmaz-player-widget';
  widget.innerHTML = `
    <div id="calmaz-player-header">
      <div id="calmaz-player-header-left">
        <img id="calmaz-player-logo-img" src="/images/logo-calmaz.png" onerror="this.style.display='none'" alt="CALMAZ" />
        <span class="calmaz-live-dot">Live</span>
      </div>
      <div id="calmaz-player-header-right">
        <button id="calmaz-minimize-btn" title="Minimize">&#8211;</button>
        <button id="calmaz-close-btn" title="Close">&#10005;</button>
      </div>
    </div>
    <div id="calmaz-on-air-bar">
      <span id="calmaz-on-air-show">CalmArizona</span>
      <button id="calmaz-watch-live-btn">&#128250; Watch Live</button>
    </div>
    <div id="calmaz-player-body">
      <!-- Visible: audio controls or video embed -->
      <div id="calmaz-audio-mode">
        <audio id="calmaz-audio" preload="none" style="display:none"></audio>
        <div id="calmaz-audio-controls">
          <button id="calmaz-play-btn">&#9654;</button>
          <div id="calmaz-audio-info">
            <div id="calmaz-track-label">Live Stream</div>
            <div id="calmaz-vol-row">
              <span id="calmaz-vol-icon">&#128266;</span>
              <input type="range" id="calmaz-vol" min="0" max="1" step="0.02" value="1" />
            </div>
          </div>
        </div>
      </div>
      <iframe id="calmaz-player-iframe"
        src=""
        allow="autoplay; fullscreen"
        allowfullscreen
        scrolling="no"
        style="width:100%;border:none;display:none;height:280px;">
      </iframe>
      <button id="calmaz-back-audio-btn">&#8592; Back to audio</button>
      <!-- Hidden StreamGuys iframe — satisfies streaming contract -->
      <iframe id="calmaz-sg-iframe"
        src=""
        style="width:100%;height:0;border:none;display:block;transition:height 0.2s;"
        scrolling="no"
        allow="autoplay">
      </iframe>
    </div>
  `;
  document.body.appendChild(widget);

  var watchBtn     = document.getElementById('calmaz-watch-live-btn');
  var backAudioBtn = document.getElementById('calmaz-back-audio-btn');
  var onAirShow    = document.getElementById('calmaz-on-air-show');
  var header       = document.getElementById('calmaz-player-header');

  var isOpen       = false;
  var isMinimized  = false;
  var isVideoMode  = false;
  var isPlaying    = false;
  var currentVideoUrl = null;
  var pollTimer    = null;

  var audio    = document.getElementById('calmaz-audio');
  var iframe   = document.getElementById('calmaz-player-iframe');
  var sgIframe = document.getElementById('calmaz-sg-iframe');
  var playBtn  = document.getElementById('calmaz-play-btn');
  var volSlider = document.getElementById('calmaz-vol');
  var volIcon   = document.getElementById('calmaz-vol-icon');
  var trackLabel = document.getElementById('calmaz-track-label');

  // Restore volume
  var savedVol = parseFloat(localStorage.getItem(VOL_KEY) || '1');
  audio.volume = savedVol;
  volSlider.value = savedVol;

  function startAudio() {
    audio.src = STREAM_URL;
    audio.load();
    audio.play().then(function() {
      isPlaying = true;
      playBtn.innerHTML = '&#9646;&#9646;';
      trackLabel.textContent = 'Live Stream';
    }).catch(function() {
      isPlaying = false;
      playBtn.innerHTML = '&#9654;';
      trackLabel.textContent = 'Click play to listen';
    });
  }

  function stopAudio() {
    audio.pause();
    audio.src = '';
    isPlaying = false;
    playBtn.innerHTML = '&#9654;';
    trackLabel.textContent = 'Paused';
  }

  playBtn.addEventListener('click', function() {
    if (isPlaying) { stopAudio(); } else { startAudio(); }
  });

  volSlider.addEventListener('input', function() {
    audio.volume = parseFloat(this.value);
    localStorage.setItem(VOL_KEY, this.value);
    updateVolIcon();
  });

  volIcon.addEventListener('click', function() {
    audio.muted = !audio.muted;
    updateVolIcon();
  });

  function updateVolIcon() {
    if (audio.muted || audio.volume === 0) volIcon.innerHTML = '&#128263;';
    else if (audio.volume < 0.5) volIcon.innerHTML = '&#128265;';
    else volIcon.innerHTML = '&#128266;';
  }

  // ── Player state ─────────────────────────────────────────────
  function openPlayer(skipAudio) {
    if (!isOpen) {
      isOpen = true;
      localStorage.setItem(STORAGE_KEY, '1');
      // Load StreamGuys player as the visible audio player
      if (!skipAudio) {
        sgIframe.src = STREAMGUYS_URL;
        sgIframe.style.height = '160px';
        // Hide custom audio controls — StreamGuys handles playback
        var audioMode = document.getElementById('calmaz-audio-mode');
        if (audioMode) audioMode.style.display = 'none';
        isPlaying = true;
      }
    }
    widget.classList.add('visible');
    widget.style.bottom = '';
    isMinimized = false;
  }

  function minimizePlayer() {
    isMinimized = true;
    widget.style.bottom = '-' + (widget.offsetHeight - 44) + 'px';
  }

  function closePlayer() {
    stopAudio();
    iframe.src = '';
    sgIframe.src = '';
    sgIframe.style.height = '0';
    var audioMode = document.getElementById('calmaz-audio-mode');
    if (audioMode) audioMode.style.display = '';
    isOpen = false;
    isVideoMode = false;
    isPlaying = false;
    widget.classList.remove('visible', 'video-mode');
    widget.style.bottom = '';
    localStorage.removeItem(STORAGE_KEY);
    if (pollTimer) clearInterval(pollTimer);
  }

  function switchToVideo(url) {
    currentVideoUrl = url;
    isVideoMode = true;
    // Stop any audio source before loading video so streams don't overlap
    stopAudio();
    sgIframe.src = '';
    sgIframe.style.height = '0';
    var audioMode = document.getElementById('calmaz-audio-mode');
    if (audioMode) audioMode.style.display = 'none';
    widget.classList.add('video-mode');
    iframe.style.display = 'block';
    iframe.src = toEmbedUrl(url);
  }

  function switchToAudio() {
    isVideoMode = false;
    widget.classList.remove('video-mode');
    widget.style.bottom = '';
    iframe.style.display = 'none';
    iframe.src = '';
    currentVideoUrl = null;
    // Restore StreamGuys player
    if (isOpen) {
      sgIframe.style.height = '160px';
      var audioMode = document.getElementById('calmaz-audio-mode');
      if (audioMode) audioMode.style.display = 'none';
    }
  }

  function toEmbedUrl(url) {
    if (!url) return url;
    url = url.trim();
    function fresh(u) {
      var sep = u.indexOf('?') !== -1 ? '&' : '?';
      var out = u;
      if (out.indexOf('autoplay=') === -1) out += sep + 'autoplay=1';
      sep = out.indexOf('?') !== -1 ? '&' : '?';
      return out + sep + 'cb=' + Date.now();
    }
    // YouTube: watch?v=ID or youtu.be/ID → embed/ID
    var ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) return fresh('https://www.youtube.com/embed/' + ytMatch[1]);
    // Vimeo event/show URLs from CMS should be respected, but forced fresh.
    if (url.indexOf('vimeo.com/event') !== -1 && url.indexOf('/embed') !== -1) {
      return fresh(url);
    }
    // Bare Vimeo event: vimeo.com/event/ID → interactive embed
    var vimeoEvent = url.match(/vimeo\.com\/event\/(\d+)/);
    if (vimeoEvent) return fresh('https://vimeo.com/event/' + vimeoEvent[1] + '/embed/interaction');
    // Vimeo video: vimeo.com/ID
    var vimeoVideo = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoVideo) return fresh('https://player.vimeo.com/video/' + vimeoVideo[1]);
    return fresh(url);
  }

  // ── Schedule check ───────────────────────────────────────────
  function checkSchedule() {
    var now = new Date();
    var day = now.getDay(); // 0=Sun, 1=Mon...
    var hour = now.getHours();
    var dayGroups = {
      0:'sun', 1:'mon', 2:'tue-fri', 3:'tue-fri', 4:'tue-fri', 5:'tue-fri', 6:'sat'
    };
    var dayGroup = dayGroups[day];

    fetch(API_URL + '/api/schedule/calmaz')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var slots = data.slots || [];
        var current = null;
        for (var i = 0; i < slots.length; i++) {
          var s = slots[i];
          if (s.day_group === dayGroup && s.start_hour <= hour && s.end_hour > hour) {
            current = s;
            break;
          }
        }
        if (current) {
          onAirShow.textContent = '▶ ' + current.name;
          if (current.video_url) {
            watchBtn.style.display = 'inline-flex';
            watchBtn.onclick = function() { switchToVideo(current.video_url); };
          } else {
            watchBtn.style.display = 'none';
            // If we were in video mode for a previous show, switch back
            if (isVideoMode) switchToAudio();
          }
        } else {
          onAirShow.textContent = 'CalmArizona';
          watchBtn.style.display = 'none';
          if (isVideoMode) switchToAudio();
        }
      })
      .catch(function() {});
  }

  // ── Wire up buttons ──────────────────────────────────────────
  document.getElementById('calmaz-minimize-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    if (isMinimized) { openPlayer(); } else { minimizePlayer(); }
  });

  document.getElementById('calmaz-close-btn').addEventListener('click', function(e) {
    e.stopPropagation();
    closePlayer();
  });

  backAudioBtn.addEventListener('click', switchToAudio);

  // Click header to restore if minimized
  header.addEventListener('click', function() {
    if (isMinimized) openPlayer();
  });

  // ── Hook all Listen Live links ───────────────────────────────
  function hookListenLinks() {
    // Use delegation so dynamically-injected buttons (on-air bar) are caught too
    document.addEventListener('click', function(e) {
      // Watch Live button in on-air bar — skip audio, go straight to video
      var watchEl = e.target.closest('#watch-live-btn');
      if (watchEl) {
        e.preventDefault();
        // Read URL from attribute OR shared window ref (handles async race)
        var videoUrl = watchEl.getAttribute('data-video-url') || window.CALMAZ_CURRENT_VIDEO_URL || null;
        openPlayer(true); // skipAudio=true
        if (videoUrl) {
          switchToVideo(videoUrl);
        }
        if (pollTimer) clearInterval(pollTimer);
        pollTimer = setInterval(checkSchedule, POLL_INTERVAL);
        return;
      }
      // Listen Live buttons
      var el = e.target.closest('[data-listen], a[href*="streamguys"]');
      if (!el) return;
      e.preventDefault();
      openPlayer();
      checkSchedule();
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(checkSchedule, POLL_INTERVAL);
    });
  }

  // ── Init ─────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    hookListenLinks();

    // Resume if was open before navigation
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      openPlayer();
      checkSchedule();
      pollTimer = setInterval(checkSchedule, POLL_INTERVAL);
    }
  });

})();

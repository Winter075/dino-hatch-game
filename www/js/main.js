/**
 * main.js
 * Inisialisasi layar, konfigurasi sentuh, orientasi landscape, dan audio.
 * Semua suara disintesis dengan Web Audio + speechSynthesis sehingga game
 * langsung berfungsi tanpa file audio. Jika file audio asli tersedia di
 * DinoData.SFX, pemutaran file tersebut akan diprioritaskan.
 */
(function (global) {
  'use strict';

  const CONFIG = {
    tapsToHatch: 4,        // jumlah ketukan sebelum telur pecah
    nameDelayMs: 900,      // jeda sebelum narasi nama diputar
    afterRoarDelayMs: 1100 // jeda setelah auman sebelum makan muncul
  };

  /* ---------------- Orientasi & sentuh ---------------- */

  function lockLandscape() {
    // 1) Plugin Capacitor (paling diandalkan di APK)
    const plugin = global.ScreenOrientation;
    if (plugin && typeof plugin.lock === 'function') {
      plugin.lock({ orientation: 'landscape' }).catch(function () {});
      return;
    }
    // 2) Web API (browser / fallback)
    if (global.screen && screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(function () {});
    }
  }

  function configureTouch() {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    // Cegah double-tap zoom di iOS
    let lastTouch = 0;
    document.addEventListener('touchend', function (e) {
      const now = Date.now();
      if (now - lastTouch < 320) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }

  /* ---------------- Audio ---------------- */

  class AudioManager {
    constructor() {
      this.ctx = null;
      this.master = null;
      this.musicTimer = null;
      this.musicIndex = 0;
      this.musicPattern = [523.25, 659.25, 783.99, 659.25, 587.33, 783.99, 880.0, 783.99];
    }

    /** Harus dipanggil dari dalam event ketuk pengguna (autoplay policy). */
    unlock() {
      if (this.ctx) {
        if (this.ctx.state === 'suspended') this.ctx.resume();
        return;
      }
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);
    }

    _now() { return this.ctx ? this.ctx.currentTime : 0; }

    /** Osilator sederhana dengan envelope halus. */
    tone(freq, opts) {
      if (!this.ctx) return;
      opts = opts || {};
      const type = opts.type || 'sine';
      const dur = opts.duration || 0.2;
      const vol = opts.volume != null ? opts.volume : 0.2;
      const delay = opts.delay || 0;
      const t = this._now() + delay;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (opts.slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t + dur);
      }
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    }

    /** Suara derak/pecah dari noise putih yang difilter. */
    noise(dur, opts) {
      if (!this.ctx) return;
      opts = opts || {};
      const t = this._now() + (opts.delay || 0);
      const vol = opts.volume != null ? opts.volume : 0.15;
      const length = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = opts.filterType || 'highpass';
      filter.frequency.value = opts.filterFreq || 1000;
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      src.start(t);
      src.stop(t + dur + 0.02);
    }

    /** Mainkan file audio jika path tersedia, jika tidak pakai fungsi sintetis. */
    _fileOr(path, synthFn) {
      if (path) {
        try {
          const a = new Audio(path);
          a.volume = 0.9;
          a.play().catch(function () { synthFn(); });
          return;
        } catch (e) { /* jatuh ke sintetis */ }
      }
      synthFn();
    }

    playTap() {
      this._fileOr(global.DinoData.SFX.tap, () => {
        this.tone(880, { type: 'triangle', duration: 0.07, volume: 0.22 });
        this.tone(1400, { type: 'sine', duration: 0.04, volume: 0.1, delay: 0.01 });
      });
    }

    playCrack() {
      this._fileOr(global.DinoData.SFX.crack, () => {
        this.noise(0.11, { filterFreq: 1800, volume: 0.16 });
        this.tone(260, { type: 'square', duration: 0.08, volume: 0.08, slideTo: 130 });
      });
    }

    playShellBreak() {
      this._fileOr(global.DinoData.SFX.shellBreak, () => {
        this.noise(0.35, { filterFreq: 900, volume: 0.2 });
        this.tone(520, { type: 'triangle', duration: 0.3, volume: 0.14, slideTo: 120 });
        this.tone(1200, { type: 'sine', duration: 0.12, volume: 0.12, delay: 0.05, slideTo: 400 });
      });
    }

    playChew() {
      this._fileOr(global.DinoData.SFX.chew, () => {
        this.tone(180, { type: 'square', duration: 0.09, volume: 0.1, slideTo: 120 });
        this.tone(160, { type: 'square', duration: 0.09, volume: 0.1, delay: 0.14, slideTo: 110 });
      });
    }

    playHappy() {
      this._fileOr(global.DinoData.SFX.happy, () => {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          this.tone(f, { type: 'triangle', duration: 0.18, volume: 0.16, delay: i * 0.1 });
        });
      });
    }

    playWrong() {
      this._fileOr(global.DinoData.SFX.wrong, () => {
        // Pelan & ramah, tanpa nada kasar / penalti
        this.tone(250, { type: 'sine', duration: 0.22, volume: 0.1, slideTo: 200 });
      });
    }

    playRoar() {
      this._fileOr(global.DinoData.SFX.roar, () => {
        // "auman lucu": nada rendah bergelombang
        this.tone(150, { type: 'sawtooth', duration: 0.5, volume: 0.13, slideTo: 95 });
        this.tone(168, { type: 'square', duration: 0.45, volume: 0.05, slideTo: 110 });
        this.noise(0.3, { filterType: 'bandpass', filterFreq: 500, volume: 0.05, delay: 0.05 });
      });
    }

    /** Narasi nama Bahasa Indonesia, lalu panggil callback (auman). */
    narrate(name, done) {
      let called = false;
      const finish = () => {
        if (called) return;
        called = true;
        if (done) done();
      };

      if (!('speechSynthesis' in global)) { finish(); return; }
      try {
        const u = new SpeechSynthesisUtterance(name);
        u.lang = 'id-ID';
        u.rate = 0.8;
        u.pitch = 1.25;
        u.volume = 1;
        u.onend = finish;
        u.onerror = finish;
        global.speechSynthesis.cancel();
        global.speechSynthesis.speak(u);
        // Pengaman jika onend tidak pernah terpicu di WebView tertentu
        setTimeout(finish, 2600);
      } catch (e) {
        finish();
      }
    }

    startMusic() {
      if (!this.ctx || this.musicTimer) return;
      const step = () => {
        const f = this.musicPattern[this.musicIndex % this.musicPattern.length];
        this.tone(f, { type: 'triangle', duration: 0.22, volume: 0.05 });
        if (this.musicIndex % 4 === 0) {
          this.tone(f / 2, { type: 'sine', duration: 0.28, volume: 0.06 });
        }
        this.musicIndex++;
      };
      step();
      this.musicTimer = setInterval(step, 300);
    }

    stopMusic() {
      if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
    }
  }

  global.GameConfig = CONFIG;
  global.AudioManager = AudioManager;
  global.lockLandscape = lockLandscape;
  global.configureTouch = configureTouch;
})(window);

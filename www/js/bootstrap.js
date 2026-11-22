/**
 * bootstrap.js
 * Menyatukan konfigurasi, audio, dan scene saat halaman siap.
 */
(function () {
  'use strict';

  function boot() {
    globalThis.configureTouch();
    globalThis.lockLandscape();

    const audio = new globalThis.AudioManager();
    const scene = new globalThis.GameScene(audio);

    const startBtn = document.getElementById('start-btn');
    startBtn.addEventListener('click', function () {
      // Gestur pengguna pertama: izinkan audio & kunci orientasi
      audio.unlock();
      globalThis.lockLandscape();
      audio.startMusic();
      scene.start();
    }, { once: true });

    // Expose untuk debugging di konsol (opsional)
    globalThis.dinoGame = { audio, scene };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

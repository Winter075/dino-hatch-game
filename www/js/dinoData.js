/**
 * dinoData.js
 * Data nama dino, jenis makanan, dan path aset.
 *
 * CATATAN ASET:
 * File SVG di folder assets/images adalah placeholder vektor yang langsung
 * bisa dipakai. Untuk memakai aset final (PNG chibi / MP3/OGG asli),
 * cukup ganti nilai path di bawah ini dan taruh file di folder yang sama.
 */
(function (global) {
  'use strict';

  const ASSET_BASE = 'assets/';
  const IMG = ASSET_BASE + 'images/';
  const AUD = ASSET_BASE + 'audio/';

  // Tahap gambar telur: utuh -> retak kecil -> retak besar
  const EGG_STAGES = [
    IMG + 'egg-0.svg',
    IMG + 'egg-1.svg',
    IMG + 'egg-2.svg'
  ];

  const FOODS = {
    meat: {
      id: 'meat',
      label: 'Daging',
      image: IMG + 'food-meat.svg'
    },
    leaf: {
      id: 'leaf',
      label: 'Daun',
      image: IMG + 'food-leaf.svg'
    },
    fish: {
      id: 'fish',
      label: 'Ikan',
      image: IMG + 'food-fish.svg'
    }
  };

  const DINOS = [
    {
      id: 'trex',
      name: 'T-Rex',
      diet: 'meat',
      image: IMG + 'dino-trex.svg',
      // Opsional: narasi rekaman asli. Kosongkan untuk memakai speechSynthesis.
      narrationAudio: AUD + 'nama-trex.mp3',
      accent: '#43a047'
    },
    {
      id: 'triceratops',
      name: 'Triceratops',
      diet: 'leaf',
      image: IMG + 'dino-triceratops.svg',
      narrationAudio: AUD + 'nama-triceratops.mp3',
      accent: '#fb8c00'
    },
    {
      id: 'pteranodon',
      name: 'Pteranodon',
      diet: 'fish',
      image: IMG + 'dino-pteranodon.svg',
      narrationAudio: AUD + 'nama-pteranodon.mp3',
      accent: '#5e35b1'
    }
  ];

  // Efek suara opsional. Kosongkan (null) untuk memakai suara sintetis Web Audio.
  const SFX = {
    tap: null,        // AUD + 'ketuk-telur.mp3'
    crack: null,      // AUD + 'retak.mp3'
    shellBreak: null, // AUD + 'cangkang-pecah.mp3'
    chew: null,       // AUD + 'kunyah.mp3'
    happy: null,      // AUD + 'senang.mp3'
    wrong: null,      // AUD + 'salah.mp3'
    roar: null,       // AUD + 'auman.mp3'
    music: null       // AUD + 'musik-latar.mp3'
  };

  global.DinoData = {
    ASSET_BASE,
    IMG,
    AUD,
    EGG_STAGES,
    FOODS,
    DINOS,
    SFX
  };
})(window);

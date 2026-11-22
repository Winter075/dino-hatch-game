# 🦕 Dino Hatch — Game Edukasi Dinosaurus (Usia 3–5 Tahun)

Game edukasi menetas dinosaurus berbasis web (HTML/CSS/JS) yang dikemas sebagai
APK Android via **Capacitor**. Dirancang khusus untuk prasekolah: warna cerah
kontras tinggi, gaya Chibi 2D, orientasi landscape terkunci, dan kontrol ketuk
dengan area sentuh besar tanpa instruksi teks panjang.

## Alur permainan (core loop)

1. **Ketuk telur** — 4 ketukan membuat telur bergoyang → retak kecil → retak
   besar → pecah, lengkap dengan bunyi ketukan ringan.
2. **Menetas & perkenalan** — bayi dinosaurus chibi melompat masuk, narasi
   menyebut namanya (Bahasa Indonesia) diikuti auman lucu.
3. **Beri makan** — dua tombol makanan besar muncul (1 benar + 1 pengganggu
   acak). Benar → dinosaurus melompat senang + tombol "Lanjut". Salah →
   menggeleng pelan, tanpa penalti dan tanpa suara kasar.
4. **Ulangi** — "Lanjut" memunculkan telur berikutnya secara acak (tidak
   mengulang dino yang sama berturut-turut).

## Struktur proyek

```text
dino-hatch-game/
├── www/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js          # Inisialisasi layar, sentuh, orientasi & audio
│   │   ├── dinoData.js      # Data nama dino, makanan, & path aset
│   │   ├── gameScene.js     # Logika ketuk telur, menetas, & beri makan
│   │   └── bootstrap.js     # Menyatukan semua saat halaman siap
│   └── assets/
│       ├── images/          # Chibi PNG/SVG, telur, makanan, latar
│       └── audio/           # Efek suara & narasi (lihat README folder)
├── package.json
└── capacitor.config.json
```

## Menjalankan di browser

```bash
cd dino-hatch-game
npm run serve      # http://localhost:3000
```

> Buka di browser dengan lebar ≥ 800px atau gunakan device toolber mode
> landscape. Audio aktif setelah tombol **KETUK UNTUK MULAI** ditekan
> (kebijakan autoplay browser).

## Build APK Android

```bash
npm install
npm run add:android     # hanya pertama kali
npm run sync            # setiap kali mengubah file di www/
npm run open:android    # buka proyek di Android Studio
# atau langsung:
npm run build:apk       # menghasilkan android/app/build/outputs/apk/debug/
```

Prasyarat: Node.js 18+, Android Studio + Android SDK, Java JDK 17.

## Tentang aset (penting)

Karena repositori ini hanya berisi kode, aset dikirim dalam bentuk:

- **Gambar**: file **SVG vektor** di `www/assets/images/` — chibi T-Rex,
  Triceratops, Pteranodon; telur 3 tahap; daging/daun/ikan; latar prasejarah.
  SVG tajam di semua ukuran layar dan bisa langsung dipakai.
- **Audio**: disintesiskan via **Web Audio API**; narasi nama memakai
  **`speechSynthesis` dengan `lang="id-ID"`**. Tidak ada file MP3 yang
  diperlukan untuk menjalankan MVP.

Untuk memakai **PNG chibi dan MP3/OGG rekaman asli**, cukup:
1. Taruh file di `www/assets/images/` dan `www/assets/audio/`.
2. Ganti path di `www/js/dinoData.js` (`EGG_STAGES`, `image`, `SFX`,
   `narrationAudio`). File SFX akan otomatis diprioritaskan, dengan fallback
   sintetis jika gagal diputar.

Lihat `www/assets/audio/README.md` untuk daftar nama file yang diharapkan.

## Catatan teknis

- **Orientasi**: `ScreenOrientation.lock('landscape')` (plugin Capacitor) dengan
  fallback Web API, plus pesan "Putar perangkat ke samping" di mode portrait.
- **Sentuh**: `touch-action: none`, pencegah `contextmenu`/`gesturestart` dan
  double-tap zoom, target sentuh minimal ~132px.
- **State machine**: `EGG → HATCH → FEED → EGG`, dengan penjaga `busy` agar
  animasi tidak tumpang tindih saat anak mengetuk cepat.

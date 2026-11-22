# Folder Audio

Secara default game **tidak memerlukan file di folder ini** — semua efek suara
disintesiskan dengan Web Audio API dan narasi nama memakai `speechSynthesis`
(Bahasa Indonesia, `id-ID`) di `js/main.js`.

Jika ingin memakai rekaman asli (disarankan untuk kualitas final), taruh file
di folder ini lalu isi path-nya di `js/dinoData.js` (objek `SFX` dan field
`narrationAudio` pada tiap dino).

## Daftar file yang diharapkan

| Kunci di `dinoData.js`     | Nama file disarankan     | Fungsi                          |
|----------------------------|--------------------------|---------------------------------|
| `SFX.tap`                  | `ketuk-telur.mp3`        | Ketukan ringan saat telur diketuk |
| `SFX.crack`                | `retak.mp3`              | Suara retakan kecil             |
| `SFX.shellBreak`           | `cangkang-pecah.mp3`     | Cangkang pecah saat menetas     |
| `SFX.chew`                 | `kunyah.mp3`             | Suara mengunyah                 |
| `SFX.happy`                | `senang.mp3`             | Suara riang saat jawaban benar  |
| `SFX.wrong`                | `salah.mp3`              | Suara pelan saat jawaban salah  |
| `SFX.roar`                 | `auman.mp3`              | Auman lucu tiap dinosaurus      |
| `SFX.music`                | `musik-latar.mp3`        | Musik latar ceria (loop)        |
| `narrationAudio` (T-Rex)   | `nama-trex.mp3`          | "T-Rex"                         |
| `narrationAudio` (Trice.)  | `nama-triceratops.mp3`   | "Triceratops"                   |
| `narrationAudio` (Ptero.)  | `nama-pteranodon.mp3`    | "Pteranodon"                    |

Format `.ogg` juga didukung di Android WebView; bisa disediakan keduanya
dengan `<source>` jika diperlukan (saat ini `_fileOr()` memakai satu path).

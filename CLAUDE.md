# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Apa ini

Landing page satu halaman untuk "Dapur Rina", kelas masak online pemula. Satu tujuan konversi: pengunjung menekan tombol **Daftar Kelas** yang mengarah ke WhatsApp. Bahasa halaman: Indonesia.

Tidak ada build step, dependensi, package manager, framework, atau test suite. Isinya `index.html` (HTML + CSS inline dalam satu `<style>`, tanpa JavaScript) dan folder `assets/` berisi 5 JPEG.

## Menjalankan & memeriksa perubahan

```bash
open index.html                    # cukup untuk pemakaian normal — foto lokal tetap muncul
python3 -m http.server 8777        # perlu server hanya kalau menguji lewat headless Chrome
```

Screenshot regresi visual (satu-satunya "test" di repo ini):

```bash
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless --disable-gpu --hide-scrollbars --virtual-time-budget=5000 \
      --window-size=1440,4700 --screenshot=/tmp/desktop.png http://localhost:8777/index.html
```

Dua jebakan yang sudah pernah menyesatkan:

- **Chrome headless memaksa lebar jendela minimal 500 px.** `--window-size=390,...` tetap me-layout di 500 px lalu memotong gambar di 390 — terlihat seperti overflow horizontal padahal bukan. Untuk menguji lebar mobile sungguhan, buat halaman pembungkus berisi `<iframe src="index.html" style="width:375px;height:7200px">`, screenshot di jendela 500 px, lalu crop kolom iframe-nya.
- Screenshot headless hanya menangkap setinggi `--window-size`; halaman penuh ± 4.700 px (desktop) dan ± 6.500 px (375 px).

Untuk mengukur geometri elemen, salin `index.html` + `assets/` ke direktori sementara, tempelkan `<script>` pengukur di akhir salinan itu, dan screenshot salinannya — jangan menaruh kode debug di file asli. Skrip pengukur di halaman lain tidak bisa membaca iframe beda port (cross-origin).

## Struktur & konvensi

**Urutan section** (jangan diubah tanpa alasan, ini alur konversinya): header sticky → hero → 3 keunggulan (`#keunggulan`) → galeri video (`#video`) → 3 kartu kelas (`#kelas`) → 3 testimoni (`#testimoni`) → FAQ (`#faq`) → panel CTA penutup → footer → bar CTA melayang khusus mobile.

Alasan dua section terakhir ditaruh di situ: video adalah bukti atas klaim di bagian keunggulan, jadi harus dilihat **sebelum** harga; kalau ditaruh setelah kartu kelas, orang yang sudah siap mendaftar malah dibelokkan menonton. FAQ tugasnya membereskan keraguan terakhir, jadi tempatnya persis **sebelum** ajakan penutup — bukan di atas, yang justru menanam keraguan sebelum orang tertarik.

Latar section berselang-seling supaya batasnya terbaca: putih (`.keunggulan`) → pita gradasi pasir (`.galeri`) → krem → putih (`.testimoni`) → krem. Kalau menambah section, ikuti pergantian ini.

Nav header maksimal 4 item — lima item mulai berdesakan di lebar 900–1000px.

**Semua CTA memakai teks "Daftar Kelas"** dan menuju `wa.me`. Nomornya adalah placeholder `6281234567890` yang tersebar di **8 tautan** — kalau menggantinya, ganti semuanya (`grep -c "wa.me/6281234567890" index.html`). Tiap kartu kelas membawa pesan `?text=` berbeda supaya Bu Rina tahu kelas mana yang dimaksud; pertahankan pola itu saat menambah kelas. Teks pesan di-URL-encode manual di dalam `href`.

**CSS** memakai custom property di `:root` (`--terracotta`, `--cream`, `--sand`, `--ink`, `--radius`, dst.) — ubah palet dari situ, bukan dari nilai hex yang tersebar. Mobile-first dengan hanya dua breakpoint: `600px` (grid 2 kolom) dan `900px` (grid 3 kolom, nav desktop muncul, bar CTA mobile disembunyikan bersama `body{padding-bottom}`-nya). Judul memakai Georgia serif, isi memakai font sistem — tidak ada font atau CDN eksternal, dan jangan menambahkannya.

**Galeri video sengaja bukan `<iframe>` YouTube.** Tiga embed asli menarik ±1,5 MB skrip pihak ketiga dan merusak satu-satunya keunggulan teknis halaman ini. Polanya: kartu berisi thumbnail JPEG lokal + tombol play CSS, dibungkus `<a target="_blank" rel="noopener">` ke `youtube.com/watch?v=…`. Durasi videonya ditulis manual di `.durasi`. Kalau menambah video: ambil thumbnail dari `i.ytimg.com/vi/<ID>/maxresdefault.jpg`, dan verifikasi ID-nya hidup lewat `youtube.com/oembed?url=…&format=json` (sekalian dapat judul dan nama kanal untuk kredit).

**FAQ memakai `<details>`/`<summary>` bawaan HTML** — buka-tutup tanpa JavaScript dan sudah aksesibel dari sananya. Panah dibalik dengan `details[open] .chev{transform:rotate(180deg)}`, penanda bawaan disembunyikan lewat `summary{list-style:none}` + `::-webkit-details-marker`. Satu item dibiarkan `open` supaya bagian itu tidak terlihat seperti daftar tautan mati.

**Gotcha `<img>`:** setiap gambar punya atribut `width`/`height` untuk mencegah layout shift. Atribut `height` itu menjadi presentational hint yang **mengalahkan `aspect-ratio`**, jadi aturan global `img{height:auto}` wajib dipertahankan — pernah menghilang dan membuat foto kartu kelas memanjang mengikuti tinggi kartu.

## Aset & lisensi

Semua foto di `assets/` diambil dari Wikimedia Commons, bukan stok bebas pakai. Lisensinya CC BY 2.0 / CC BY 4.0 / CC BY-SA 4.0, yang **mewajibkan atribusi** — baris kredit di `.footer-bottom` bukan hiasan, jangan dihapus selama file aslinya masih dipakai. Kalau pemilik situs mengganti foto dengan miliknya sendiri (timpa file dengan nama sama), baris kredit itu baru boleh ikut dihapus.

Alur menambah foto baru: unduh via `commons.wikimedia.org/w/api.php` (Unsplash memblokir unduhan otomatis; endpoint `napi` Wikimedia butuh URL thumb persis dari API — lebar sembarang membalas HTTP 400), lalu potong dan kompres dengan Pillow, sekitar 900×675 untuk kartu, 1600×1067 untuk hero, dan 800×450 untuk thumbnail video, JPEG kualitas 82 progresif. Total `assets/` sekarang ± 1,0 MB; jaga di kisaran itu.

Tiga file `video-*.jpg` beda status: itu thumbnail milik kanal YouTube masing-masing (Devina Hermawan, Ceceromed Kitchen, PAP COOK), dipakai sementara sebagai contoh dan **bukan** berlisensi bebas. Begitu pemilik situs punya video sendiri, ganti thumbnail sekaligus `href`-nya.

## Isi yang masih contoh

Harga, jumlah sesi, nama & kutipan testimoni, "sisa 6 kursi", rating 4,9 dari 512 murid, seluruh jawaban FAQ (jadwal Zoom, biaya belanja Rp30.000, janji uang kembali setelah sesi pertama), dan alamat `halo@dapurrina.id` semuanya karangan untuk demo. Perlakukan sebagai placeholder, bukan fakta yang harus dipertahankan konsisten.

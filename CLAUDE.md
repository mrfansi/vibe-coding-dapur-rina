# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Apa ini

Landing page satu halaman untuk "Dapur Rina", kelas masak online pemula. Satu tujuan konversi: pengunjung menekan tombol **Daftar Kelas** yang mengarah ke WhatsApp. Bahasa halaman: Indonesia.

Tidak ada build step, dependensi, package manager, framework, atau test suite. Isinya:

| Berkas | Isi |
|---|---|
| `index.html` | landing page utama, satu-satunya halaman dengan alur konversi penuh |
| `menu-favorit.html` | daftar 12 masakan favorit — halaman referensi, memancing balik ke CTA |
| `style.css` | seluruh gaya kedua halaman |
| `app.js` | seluruh interaksi kedua halaman |
| `assets/` | 20 JPEG, ± 1,6 MB |

**CSS dan JS sengaja di file terpisah, bukan inline.** Dulu inline waktu halamannya masih satu; dipisah begitu halaman kedua lahir supaya satu perubahan desain tidak perlu dikerjakan dua kali. Satu-satunya yang masih inline adalah pendeteksi `IntersectionObserver` di `<head>` — itu harus jalan sebelum halaman digambar supaya tidak ada kedipan, jadi jangan dipindah ke `app.js`.

Waktu memindahkannya, hasil render dibandingkan piksel demi piksel dan hasilnya nol beda. Kalau nanti mengubah struktur berkas lagi, pakai cara yang sama — dan wajib menambahkan `--force-prefers-reduced-motion`, karena tanpa itu animasi muncul-saat-scroll tertangkap di fase berbeda dan diff-nya jadi jutaan piksel padahal tidak ada yang berubah.

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

**Screenshot headless tidak cukup untuk menguji apa pun yang bergantung pada scroll.** Headless lama tidak benar-benar men-scroll: `window.scrollTo()` dijalankan tapi `scrollY` tetap 0, sehingga IntersectionObserver tidak pernah terpicu dan seluruh efek muncul-saat-scroll terbaca "rusak" padahal normal. Pakai Chrome sungguhan lewat CDP:

```bash
"$CH" --headless=new --disable-gpu --remote-debugging-port=9333 \
      --user-data-dir=/tmp/cdp-dapur --no-first-run about:blank &
# buat tab: HTTP PUT (bukan GET) ke /json/new?<url>, lalu sambung ke webSocketDebuggerUrl
# python3 punya modul `websockets`; Runtime.evaluate untuk scroll + baca state,
# Emulation.setDeviceMetricsOverride untuk layar mobile sungguhan (375px),
# Emulation.setScriptExecutionDisabled untuk menguji halaman tanpa JS.
```

Yang wajib dicek ulang setiap kali menyentuh JS: setelah digulir sampai dasar, `document.querySelectorAll('.reveal:not(.tampil)').length` harus **0** — kalau ada sisa, berarti ada bagian halaman yang tidak pernah terlihat pengunjung.

Untuk mengukur geometri elemen, salin `index.html` + `assets/` ke direktori sementara, tempelkan `<script>` pengukur di akhir salinan itu, dan screenshot salinannya — jangan menaruh kode debug di file asli. Skrip pengukur di halaman lain tidak bisa membaca iframe beda port (cross-origin).

## Struktur & konvensi

**Urutan section** (jangan diubah tanpa alasan, ini alur konversinya): header sticky → hero → 3 keunggulan (`#keunggulan`) → galeri video (`#video`) → 3 kartu kelas (`#kelas`) → 3 testimoni (`#testimoni`) → FAQ (`#faq`) → panel CTA penutup → footer → bar CTA melayang khusus mobile.

Alasan dua section terakhir ditaruh di situ: video adalah bukti atas klaim di bagian keunggulan, jadi harus dilihat **sebelum** harga; kalau ditaruh setelah kartu kelas, orang yang sudah siap mendaftar malah dibelokkan menonton. FAQ tugasnya membereskan keraguan terakhir, jadi tempatnya persis **sebelum** ajakan penutup — bukan di atas, yang justru menanam keraguan sebelum orang tertarik.

Latar section berselang-seling supaya batasnya terbaca: putih (`.keunggulan`) → pita gradasi pasir (`.galeri`) → krem → putih (`.testimoni`) → krem. Kalau menambah section, ikuti pergantian ini.

Nav header maksimal 4 item — lima item mulai berdesakan di lebar 900–1000px. Karena batas itu, "Cerita Murid" dikeluarkan dari nav waktu `menu-favorit.html` masuk; testimoni toh tetap terlewati saat scroll, sedangkan halaman terpisah tidak akan ketemu kalau tidak ditautkan. Nav `menu-favorit.html` isinya berbeda (Beranda · Menu Kelas · FAQ) dan semua tautannya lintas halaman.

## Halaman menu favorit

Isinya 12 masakan bernomor, lalu satu bagian pembanding "biasa dimasak sendiri" versus "biasanya lebih enak beli" yang berakhir di CTA. Aturannya:

- **Urutan 1–12 adalah pilihan redaksi dan dinyatakan begitu di halamannya**, di dalam kotak `.catatan`. Jangan pernah menambahkan persentase, jumlah responden, atau klaim "peringkat resmi" tanpa sumber yang benar-benar bisa ditautkan — mengarang angka survei jauh lebih berbahaya daripada mengarang harga kelas.
- Asal daerah tiap masakan adalah fakta, bukan placeholder seperti isi contoh lainnya. Kalau menambah menu, pastikan asalnya benar.
- Kredit foto ditulis per halaman: `menu-favorit.html` hanya mencantumkan 12 fotonya sendiri, `index.html` hanya mencantumkan miliknya. Jangan digabung.

**Semua CTA memakai teks "Daftar Kelas"** dan menuju `wa.me`. Nomornya adalah placeholder `6281234567890` yang tersebar di **8 tautan** — kalau menggantinya, ganti semuanya (`grep -c "wa.me/6281234567890" index.html`). Tiap kartu kelas membawa pesan `?text=` berbeda supaya Bu Rina tahu kelas mana yang dimaksud; pertahankan pola itu saat menambah kelas. Teks pesan di-URL-encode manual di dalam `href`.

**CSS** memakai custom property di `:root` (`--terracotta`, `--cream`, `--sand`, `--ink`, `--radius`, dst.) — ubah palet dari situ, bukan dari nilai hex yang tersebar. Mobile-first dengan hanya dua breakpoint: `600px` (grid 2 kolom) dan `900px` (grid 3 kolom, nav desktop muncul, bar CTA mobile disembunyikan bersama `body{padding-bottom}`-nya). Judul memakai Georgia serif, isi memakai font sistem — tidak ada font atau CDN eksternal, dan jangan menambahkannya.

**Galeri video sengaja bukan `<iframe>` YouTube yang dimuat di awal.** Tiga embed asli menarik ±1,5 MB skrip pihak ketiga dan merusak satu-satunya keunggulan teknis halaman ini. Polanya: kartu berisi thumbnail JPEG lokal + tombol play CSS, dibungkus `<a href="youtube.com/watch?v=…" data-yt="<ID>" target="_blank">`. Iframe `youtube-nocookie.com` baru dibuat saat kartunya diklik, lalu dibuang lagi di event `close` supaya suaranya benar-benar berhenti. Durasi ditulis manual di `.durasi`. Kalau menambah video: ambil thumbnail dari `i.ytimg.com/vi/<ID>/maxresdefault.jpg`, dan verifikasi ID-nya hidup lewat `youtube.com/oembed?url=…&format=json` (sekalian dapat judul dan nama kanal untuk kredit).

**FAQ memakai `<details>`/`<summary>` bawaan HTML** — buka-tutup tanpa JavaScript dan sudah aksesibel dari sananya. Semua `<details>` memakai `name="faq"` yang sama, jadi akordeonnya eksklusif (buka satu, yang lain menutup sendiri) tanpa satu baris JS pun; di browser lama atribut itu diabaikan dan perilakunya kembali jadi buka-tutup bebas. Panah dibalik dengan `details[open] .chev`, penanda bawaan disembunyikan lewat `summary{list-style:none}` + `::-webkit-details-marker`. Satu item dibiarkan `open` supaya bagian itu tidak terlihat seperti daftar tautan mati.

## Aturan JavaScript

Semua JS bersifat *progressive enhancement* dan wajib tetap begitu — halaman harus utuh dan bisa dipakai kalau skripnya mati. Ada empat fungsi: isi muncul saat di-scroll, menu header menyorot section yang sedang dibaca, pemutar video di dalam halaman, dan bar CTA mobile yang tahu kapan harus menyingkir.

Tiga aturan yang menjaga sifat itu, jangan dilanggar:

- **Yang menyembunyikan elemen adalah kelas `.siap`, dan `.siap` hanya dipasang oleh JS** tepat sebelum elemennya dipantau. Kalau CSS yang menyembunyikan (`.js .reveal{opacity:0}`), satu error kecil di skrip membuat sebagian isi halaman tidak pernah muncul. Karena itu blok `catch` juga mencabut `.siap` dari semua elemen, bukan cuma kelas `.js`.
- **Sorotan menu dihitung dari geometri** (`getBoundingClientRect` terhadap garis 42% tinggi layar, di-throttle `requestAnimationFrame`), **bukan dari urutan callback IntersectionObserver.** Versi IO sempat dipakai dan salah: waktu scroll melompat — persis yang terjadi saat menu anchor diklik — beberapa section melintas dalam satu callback dan yang terakhir di DOM ikut menang, sehingga menu menyorot bagian yang keliru.
- **Pemutar video memakai `<dialog>`** dan hanya mengambil alih klik kalau `showModal` benar-benar ada. Tanpa itu, `href` aslinya dibiarkan bekerja dan video tetap terbuka di YouTube seperti versi lama.

**Gotcha `<img>`:** setiap gambar punya atribut `width`/`height` untuk mencegah layout shift. Atribut `height` itu menjadi presentational hint yang **mengalahkan `aspect-ratio`**, jadi aturan global `img{height:auto}` wajib dipertahankan — pernah menghilang dan membuat foto kartu kelas memanjang mengikuti tinggi kartu.

## Aset & lisensi

Semua foto di `assets/` diambil dari Wikimedia Commons, bukan stok bebas pakai. Lisensinya CC BY 2.0 / CC BY 4.0 / CC BY-SA 4.0, yang **mewajibkan atribusi** — baris kredit di `.footer-bottom` bukan hiasan, jangan dihapus selama file aslinya masih dipakai. Kalau pemilik situs mengganti foto dengan miliknya sendiri (timpa file dengan nama sama), baris kredit itu baru boleh ikut dihapus.

Alur menambah foto baru: unduh via `commons.wikimedia.org/w/api.php` (Unsplash memblokir unduhan otomatis; endpoint `napi` Wikimedia butuh URL thumb persis dari API — lebar sembarang membalas HTTP 400), lalu potong dan kompres dengan Pillow, sekitar 900×675 untuk kartu, 1600×1067 untuk hero, dan 800×450 untuk thumbnail video, JPEG kualitas 82 progresif. Total `assets/` sekarang ± 1,6 MB (foto halaman menu favorit dibuat 600×450, kualitas 78, ± 45 KB per foto). Kalau menambah menu lagi, jaga jangan sampai lewat 2 MB.

Tiga file `video-*.jpg` beda status: itu thumbnail milik kanal YouTube masing-masing (Devina Hermawan, Ceceromed Kitchen, PAP COOK), dipakai sementara sebagai contoh dan **bukan** berlisensi bebas. Begitu pemilik situs punya video sendiri, ganti thumbnail sekaligus `href`-nya.

## Isi yang masih contoh

Harga, jumlah sesi, nama & kutipan testimoni, "sisa 6 kursi", rating 4,9 dari 512 murid, seluruh jawaban FAQ (jadwal Zoom, biaya belanja Rp30.000, janji uang kembali setelah sesi pertama), dan alamat `halo@dapurrina.id` semuanya karangan untuk demo. Perlakukan sebagai placeholder, bukan fakta yang harus dipertahankan konsisten.

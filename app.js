/* Dapur Rina — interaksi bersama untuk semua halaman.
   Semuanya progressive enhancement: kalau file ini gagal dimuat,
   halaman tetap utuh dan bisa dipakai. */

(function(){
  var akar = document.documentElement;
  if (!akar.classList.contains('js')) return;

  try {

    /* 1. Isi halaman muncul perlahan saat masuk layar, berurutan
          per kartu supaya matanya sempat mengikuti. */
    var pemantau = new IntersectionObserver(function(masuk){
      masuk.forEach(function(en){
        if (!en.isIntersecting) return;
        var el = en.target;
        var urutan = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(urutan, 4) * 90 + 'ms';
        el.classList.add('tampil');
        pemantau.unobserve(el);
      });
    }, { threshold: .12, rootMargin: '0px 0px -10% 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){
      el.classList.add('siap');
      pemantau.observe(el);
    });

    /* 2. Menu header menyorot section yang sedang dibaca. */
    var tautan = {};
    document.querySelectorAll('.nav a[href^="#"]').forEach(function(a){
      tautan[a.getAttribute('href').slice(1)] = a;
    });
    /* Sengaja dihitung dari geometri, bukan dari urutan callback
       IntersectionObserver: waktu scroll melompat (misalnya karena
       menu anchor diklik) beberapa section melintas sekaligus dan
       yang terakhir di DOM ikut menang, sehingga menu menyorot
       bagian yang salah. */
    var bagianDipantau = [];
    for (var id in tautan) {
      var bagian = document.getElementById(id);
      if (bagian) bagianDipantau.push(bagian);
    }
    var menunggu = false;
    function segarkanMenu(){
      menunggu = false;
      var garis = window.innerHeight * .42, aktif = null;
      bagianDipantau.forEach(function(s){
        var kotak = s.getBoundingClientRect();
        if (kotak.top <= garis && kotak.bottom > garis) aktif = s;
      });
      for (var k in tautan) tautan[k].removeAttribute('aria-current');
      if (aktif && tautan[aktif.id]) tautan[aktif.id].setAttribute('aria-current', 'true');
    }
    addEventListener('scroll', function(){
      if (menunggu) return;
      menunggu = true;
      requestAnimationFrame(segarkanMenu);
    }, { passive: true });
    addEventListener('resize', segarkanMenu, { passive: true });
    segarkanMenu();

    /* 3. Video diputar di dalam halaman, bukan dilempar ke YouTube.
          Kalau <dialog> tidak didukung, klik dibiarkan apa adanya
          sehingga tetap membuka YouTube di tab baru seperti semula. */
    var modal = document.getElementById('video-modal');
    var bingkai = modal && modal.querySelector('.modal-frame');
    var judulModal = modal && modal.querySelector('.modal-judul');

    if (modal && typeof modal.showModal === 'function') {
      document.querySelectorAll('.video-card').forEach(function(kartu){
        kartu.addEventListener('click', function(e){
          var kode = kartu.getAttribute('data-yt');
          if (!kode) return;
          e.preventDefault();

          var judul = kartu.querySelector('h3') ? kartu.querySelector('h3').textContent : 'Video';
          var iframe = document.createElement('iframe');
          iframe.src = 'https://www.youtube-nocookie.com/embed/' + kode + '?autoplay=1&rel=0';
          iframe.title = judul;
          iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
          iframe.setAttribute('allowfullscreen', '');
          bingkai.appendChild(iframe);
          judulModal.textContent = judul;
          modal.showModal();
        });
      });

      /* Esc sudah ditangani <dialog> sendiri; sisanya tinggal
         membuang iframe supaya suaranya benar-benar berhenti. */
      modal.addEventListener('close', function(){
        var iframe = bingkai.querySelector('iframe');
        if (iframe) iframe.remove();
        judulModal.textContent = '';
      });
      modal.querySelector('.modal-close').addEventListener('click', function(){ modal.close(); });
      modal.addEventListener('click', function(e){ if (e.target === modal) modal.close(); });
    }

    /* 4. Bar CTA mobile: diam saat hero masih terlihat, lalu naik.
          Menyingkir waktu panel CTA penutup muncul biar tidak dobel. */
    var bar = document.querySelector('.bar');
    var hero = document.querySelector('.hero');
    var ctaPenutup = document.querySelector('.cta-panel');
    if (bar && hero) {
      var heroLewat = false, penutupTerlihat = false;
      var perbarui = function(){ bar.classList.toggle('tampil', heroLewat && !penutupTerlihat); };
      new IntersectionObserver(function(en){
        heroLewat = !en[0].isIntersecting; perbarui();
      }, { threshold: 0 }).observe(hero);
      if (ctaPenutup) new IntersectionObserver(function(en){
        penutupTerlihat = en[0].isIntersecting; perbarui();
      }, { threshold: .25 }).observe(ctaPenutup);
    }

  } catch (e) {
    /* Kalau ada yang meleset, matikan semua efek dan kembalikan
       halaman ke versi statisnya. Kelas .siap wajib ikut dicabut:
       dialah yang menyembunyikan isi, jadi kalau ditinggal begitu
       saja bisa ada bagian yang tidak pernah muncul. */
    akar.classList.remove('js');
    document.querySelectorAll('.reveal.siap').forEach(function(el){
      el.classList.remove('siap');
    });
  }
})();

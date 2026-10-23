/* Photo backdrop shared by both survey formats.
   Photos are from Pexels (free under the Pexels License, no attribution required),
   loaded from their CDN. Page: https://www.pexels.com/photo/<id>/
     5940830  Black students and teacher sitting at conference in university
     6147160  Multiethnic students walking near entrance with books and backpacks
     5940713  Attentive young black groupmates using laptop while preparing for exams
     5965612  Serious young black female student using laptop near university building
     6146978  Cheerful multiethnic students with books sitting near university
     5940829  Group of multiracial students studying in library with teacher
   Usage: const bg = Backdrop(document.getElementById("bgMove"), { scroll: true });
          bg.set(photoIndex, step); */
(function(){
  var PHOTOS = ["5940830","6147160","5940713","5965612","6146978","5940829"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  window.Backdrop = function(host, opts){
    opts = opts || {};
    var els = PHOTOS.map(function(){
      var el = document.createElement("div");
      el.className = "photo";
      el.innerHTML = '<div class="photo-img"></div>';
      host.appendChild(el);
      return el;
    });

    function url(id){
      var w = Math.min(2400, Math.round(window.innerWidth * (window.devicePixelRatio || 1) * 1.15));
      return "https://images.pexels.com/photos/" + id + "/pexels-photo-" + id + ".jpeg?auto=compress&cs=tinysrgb&w=" + w;
    }
    function load(n){
      var el = els[n];
      if (!el || el.dataset.loaded) return;
      el.dataset.loaded = "1";
      el.firstChild.style.backgroundImage = 'url("' + url(PHOTOS[n]) + '")';
    }
    var now = -1;
    function set(n, step){
      n = Math.max(0, Math.min(PHOTOS.length - 1, n));
      load(n); load(n + 1);                       /* fetch the next one early */
      if (n !== now){
        els.forEach(function(el, k){
          el.classList.toggle("is-on", k === n);
          el.classList.toggle("is-off", k < n);
        });
        now = n;
      }
      els[n].style.setProperty("--step", step || 0);
    }

    if (!reduce){
      var raf = 0, mx = 0, my = 0, sy = 0;
      function paint(){
        raf = 0;
        host.style.setProperty("--mx", mx.toFixed(3));
        host.style.setProperty("--my", my.toFixed(3));
        host.style.setProperty("--sy", sy.toFixed(3));
      }
      function queue(){ if (!raf) raf = requestAnimationFrame(paint); }
      /* pointer parallax on devices with a mouse */
      if (window.matchMedia("(pointer: fine)").matches){
        window.addEventListener("pointermove", function(e){
          mx = (e.clientX / window.innerWidth) * 2 - 1;
          my = (e.clientY / window.innerHeight) * 2 - 1;
          queue();
        });
      }
      /* scroll parallax: the photo moves a fraction of the page's travel */
      if (opts.scroll){
        window.addEventListener("scroll", function(){
          var max = document.documentElement.scrollHeight - window.innerHeight;
          sy = max > 0 ? window.scrollY / max : 0;
          queue();
        }, { passive: true });
      }
    }

    return { set: set, count: PHOTOS.length };
  };
})();

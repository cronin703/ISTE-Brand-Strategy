/* Required-answer checks shared by both survey formats.
   SurveyValidate.check(root)  marks every unanswered question inside root and
                               returns the first control to focus, or null.
   SurveyValidate.watch(root)  clears a question's note as soon as it is answered. */
(function(){
  var MSG = {
    text:   "Add an answer to continue.",
    email:  "Enter an email address, like name@example.org.",
    rating: "Choose a number from 1 to 5.",
    choice: "Choose Yes or No."
  };
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var n = 0;

  function units(root){
    var out = [], seen = {};
    root.querySelectorAll("input[type=text], input[type=email], textarea, input[type=radio]").forEach(function(el){
      if (el.type === "radio"){
        if (seen[el.name]) return;
        seen[el.name] = 1;
        var group = [].slice.call(root.querySelectorAll('input[type=radio][name="' + el.name + '"]'));
        out.push({ els: group, kind: el.closest(".ramp") ? "rating" : "choice", host: el.closest("fieldset") });
      } else {
        out.push({ els: [el], kind: el.type === "email" ? "email" : "text", after: el });
      }
    });
    return out;
  }
  function ok(u){
    if (u.kind === "text") return u.els[0].value.trim() !== "";
    if (u.kind === "email") return EMAIL.test(u.els[0].value.trim());
    return u.els.some(function(e){ return e.checked; });
  }
  function message(u){
    if (u.kind === "email" && !u.els[0].value.trim()) return MSG.text;
    return MSG[u.kind];
  }
  function clear(u){
    u.els.forEach(function(e){ e.removeAttribute("aria-invalid"); });
    if (u.note){ u.note.remove(); u.note = null; }
    var host = u.host || u.after.parentNode;
    var old = host.querySelector(":scope > .err[data-for='" + u.els[0].name + "']");
    if (old) old.remove();
    u.els.forEach(function(e){
      var d = (e.getAttribute("aria-describedby") || "").split(" ").filter(function(x){ return x && x.indexOf("err-") !== 0; }).join(" ");
      if (d) e.setAttribute("aria-describedby", d); else e.removeAttribute("aria-describedby");
    });
  }
  function mark(u){
    clear(u);
    var p = document.createElement("p");
    p.className = "err"; p.id = "err-" + (++n); p.textContent = message(u);
    p.setAttribute("data-for", u.els[0].name);
    if (u.host) u.host.appendChild(p); else u.after.insertAdjacentElement("afterend", p);
    u.els.forEach(function(e){
      e.setAttribute("aria-invalid", "true");
      e.setAttribute("aria-describedby", ((e.getAttribute("aria-describedby") || "") + " " + p.id).trim());
    });
    u.note = p;
  }

  window.SurveyValidate = {
    check: function(root){
      var first = null;
      units(root).forEach(function(u){
        if (ok(u)) { clear(u); return; }
        mark(u);
        if (!first) first = u.els[0];
      });
      return first;
    },
    watch: function(root){
      function onChange(e){
        var t = e.target;
        if (!t.matches || !t.matches("input, textarea")) return;
        units(root).forEach(function(u){ if (u.els.indexOf(t) !== -1 && ok(u)) clear(u); });
      }
      root.addEventListener("input", onChange);
      root.addEventListener("change", onChange);
    }
  };
})();

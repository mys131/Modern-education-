/* إحصاءات مجهولة للمنصة (لا تبدأ إلا بعد موافقة الزائر أو وليّ أمره): لا اسم ولا IP ولا إيميل. معرّف عشوائي + الصفحة + النتيجة + الدولة من المنطقة الزمنية + نوع الجهاز. */
(function () {
  window.track = function () {};
  var cfg = window.FIREBASE_CONFIG;
  if (!cfg || !/^AIza/.test(cfg.apiKey || "")) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  function start() {
  var TZ = {
    "Africa/Cairo": "EG", "Asia/Riyadh": "SA", "Asia/Muscat": "OM", "Asia/Dubai": "AE", "Asia/Kuwait": "KW",
    "Asia/Qatar": "QA", "Asia/Bahrain": "BH", "Asia/Baghdad": "IQ", "Asia/Amman": "JO", "Asia/Beirut": "LB",
    "Asia/Damascus": "SY", "Asia/Gaza": "PS", "Asia/Hebron": "PS", "Asia/Aden": "YE", "Africa/Khartoum": "SD",
    "Africa/Tripoli": "LY", "Africa/Tunis": "TN", "Africa/Algiers": "DZ", "Africa/Casablanca": "MA"
  };
  var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  var country = TZ[tz] || (tz ? "XX" : "?");
  var ua = navigator.userAgent || "";
  var dev = /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  var br = /Edg\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Other";

  function sid() {
    try {
      var s = localStorage.getItem("mp_sid");
      if (!s) {
        var a = new Uint8Array(8); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
        s = Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
        localStorage.setItem("mp_sid", s);
      }
      return s;
    } catch (e) { return "anon" + Math.floor(Math.random() * 1e6); }
  }
  var SID = sid();

  var SDK = "https://www.gstatic.com/firebasejs/10.12.5/";
  function load(src) { return new Promise(function (res, rej) { var s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  var dbp = load(SDK + "firebase-app-compat.js").then(function () { return load(SDK + "firebase-firestore-compat.js"); })
    .then(function () { firebase.initializeApp(cfg); return firebase.firestore(); });
  dbp.catch(function () {});

  function overlay(title, text) {
    var d = document.createElement("div");
    d.style.cssText = "position:fixed;inset:0;z-index:9999;background:#f4f7ff;color:#14213d;display:grid;place-items:center;text-align:center;padding:24px;font-family:Tajawal,sans-serif";
    d.innerHTML = '<div><h1 style="font-family:Cairo,Tajawal,sans-serif;font-weight:900;margin:0 0 8px"></h1><p style="margin:0;color:#4a5878;line-height:1.8"></p></div>';
    d.querySelector("h1").textContent = title; d.querySelector("p").textContent = text;
    document.body.appendChild(d);
  }

  var lastKey = "", lastAt = 0;
  window.track = function (type, data) {
    data = data || {};
    var key = type + "|" + (data.path || "") + "|" + (data.lesson || "") + "|" + (data.level || "");
    var now = Date.now();
    if (key === lastKey && now - lastAt < 2000) return;
    lastKey = key; lastAt = now;
    dbp.then(function (db) {
      var ev = { t: firebase.firestore.FieldValue.serverTimestamp(), type: type, sid: SID, tz: tz.slice(0, 40), country: country, dev: dev, br: br };
      ["path", "lesson", "level", "kind", "msg"].forEach(function (k) { if (data[k] != null) ev[k] = String(data[k]).slice(0, 120); });
      ["score", "total"].forEach(function (k) { if (typeof data[k] === "number") ev[k] = data[k]; });
      return db.collection("events").add(ev);
    }).catch(function () {});
  };
  window.addEventListener("error", function (e) { window.track("error", { msg: e.message }); });

  dbp.then(function (db) {
    return Promise.all([db.doc("settings/site").get(), db.collection("blocked").doc(SID).get()]);
  }).then(function (r) {
    var s = r[0].exists ? r[0].data() : {};
    window.SITE_SETTINGS = s;
    if (typeof window.onSettings === "function") window.onSettings(s);
    if (r[1].exists) overlay("تم تعليق الوصول", "تم إيقاف الوصول من هذا الجهاز. تواصل مع المسؤول إن كان هذا بالخطأ.");
    else if (s.maintenance) overlay("نعود قريبًا", "الموقع تحت الصيانة الآن. شكرًا لصبرك.");
  }).catch(function () {});
  }

  var consent = null; try { consent = localStorage.getItem("mp_consent"); } catch (e) {}
  window.mpConsentState = function () { return consent === "yes" ? "yes" : consent === "no" ? "no" : "ask"; };
  window.mpConsentReset = function () { try { localStorage.removeItem("mp_consent"); localStorage.removeItem("mp_sid"); } catch (e) {} location.reload(); };

  function banner() {
    var st = document.createElement("style");
    st.textContent = "#mpc{position:fixed;inset-inline:12px;bottom:12px;z-index:9998;max-width:640px;margin-inline:auto;background:#fff;color:#14213d;border:2px solid #2457d6;border-radius:18px;padding:14px 16px;font:15px/1.7 Tajawal,sans-serif;box-shadow:0 12px 32px rgba(10,20,60,.3)}" +
      "#mpc p{margin:0 0 10px}#mpc a{color:#2457d6;font-weight:700}#mpc .r{display:flex;gap:8px;flex-wrap:wrap}" +
      "#mpc button{font:700 15px Tajawal,sans-serif;padding:9px 18px;border-radius:999px;border:2px solid #2457d6;cursor:pointer;background:#2457d6;color:#fff}#mpc button.no{background:transparent;color:#2457d6}" +
      "@media (prefers-color-scheme:dark){#mpc{background:#18204a;color:#eef1ff;border-color:#9db6ff}#mpc a{color:#9db6ff}#mpc button{background:#9db6ff;color:#0e1430;border-color:#9db6ff}#mpc button.no{background:transparent;color:#9db6ff}}";
    document.head.appendChild(st);
    var d = document.createElement("div"); d.id = "mpc"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "موافقة على الإحصاءات");
    d.innerHTML = '<p>نسجّل زيارتك بشكل مجهول (معرّف عشوائي، الدولة التقريبية، نوع الجهاز، نتائج الأنشطة) لتحسين الدروس. تُخزَّن هذه البيانات على خوادم Google خارج سلطنة عُمان. إن كان عمرك أقل من ١٨ سنة فاطلب موافقة وليّ أمرك قبل أن تضغط «أوافق». <a href="#/privacy">سياسة الخصوصية</a></p><div class="r"><button type="button" class="ok">أوافق</button><button type="button" class="no">لا أوافق</button></div>';
    document.body.appendChild(d);
    d.querySelector(".ok").onclick = function () { try { localStorage.setItem("mp_consent", "yes"); } catch (e) {} consent = "yes"; d.remove(); start(); };
    d.querySelector(".no").onclick = function () { try { localStorage.setItem("mp_consent", "no"); localStorage.removeItem("mp_sid"); } catch (e) {} consent = "no"; d.remove(); };
  }

  if (consent === "yes") start();
  else if (consent !== "no") { if (document.body) banner(); else document.addEventListener("DOMContentLoaded", banner); }
})();

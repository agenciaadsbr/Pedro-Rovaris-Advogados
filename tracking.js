/* Carrega Meta Pixel, GA4 e GTM somente quando os IDs estiverem em config.js
   e expõe window.prTrack(evento, params) para toda a página. */
(function () {
  var C = window.PR_CONFIG || {};
  window.dataLayer = window.dataLayer || [];

  if (C.GTM_ID) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var g = document.createElement('script');
    g.async = true; g.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(C.GTM_ID);
    document.head.appendChild(g);
  }

  if (C.GA4_ID) {
    var ga = document.createElement('script');
    ga.async = true; ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(C.GA4_ID);
    document.head.appendChild(ga);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', C.GA4_ID);
  }

  if (C.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', C.META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  window.prTrack = function (eventName, params) {
    params = params || {};
    try {
      window.dataLayer.push(Object.assign({ event: eventName }, params));
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
      if (typeof window.fbq === 'function') {
        if (eventName === 'generate_lead') window.fbq('track', 'Lead', params);
        else if (eventName === 'whatsapp_click') window.fbq('track', 'Contact', params);
        else window.fbq('trackCustom', eventName, params);
      }
    } catch (e) {}
  };

  /* UTMs: guardadas na sessão para irem junto com o lead */
  try {
    var q = new URLSearchParams(location.search), utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid'].forEach(function (k) { var v = q.get(k); if (v) utm[k] = v; });
    if (Object.keys(utm).length) sessionStorage.setItem('pr_utm', JSON.stringify(utm));
    if (!sessionStorage.getItem('pr_ref')) sessionStorage.setItem('pr_ref', document.referrer || '');
  } catch (e) {}
})();

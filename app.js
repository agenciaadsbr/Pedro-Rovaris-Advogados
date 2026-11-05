(function () {
  var C = window.PR_CONFIG;
  var track = window.prTrack || function () {};
  var area = '';

  function sb(table, row) {
    return fetch(C.SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        apikey: C.SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + C.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(row),
      keepalive: true
    });
  }

  function getUtm() {
    try { return JSON.parse(sessionStorage.getItem('pr_utm') || '{}'); } catch (e) { return {}; }
  }

  function origem() {
    var u = getUtm();
    if (u.utm_source) return [u.utm_source, u.utm_medium, u.utm_campaign].filter(Boolean).join(' / ');
    if (u.gclid) return 'google / cpc';
    if (u.fbclid) return 'meta';
    var ref = '';
    try { ref = sessionStorage.getItem('pr_ref') || ''; } catch (e) {}
    if (ref) { try { return new URL(ref).hostname; } catch (e) { return ref; } }
    return 'direto';
  }

  /* 1 visita por carregamento */
  try {
    sb('lp_visits', { site: C.SITE, referrer: document.referrer || null, path: location.pathname + location.search }).catch(function () {});
  } catch (e) {}

  /* Menu mobile */
  var menuBtn = document.getElementById('pr-menu-btn');
  var mnav = document.getElementById('pr-mnav');
  function setMenu(open) {
    if (!mnav) return;
    mnav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { setMenu(mnav.hidden); });
  document.querySelectorAll('[data-close-menu]').forEach(function (el) { el.addEventListener('click', function () { setMenu(false); }); });

  /* CTAs: todos levam ao formulário; Família/ACT marcam a área */
  var positions = { ctaHeader: 'header', ctaHero: 'hero', ctaSteps: 'como_funciona', ctaAbout: 'escritorio', ctaFloat: 'flutuante', presetFamilia: 'secao_familia', presetServidor: 'secao_servidor' };
  document.querySelectorAll('[data-cta]').forEach(function (el) {
    el.addEventListener('click', function () {
      var k = el.getAttribute('data-cta');
      if (k === 'presetFamilia') area = 'familia';
      if (k === 'presetServidor') area = 'servidor';
      track('cta_click', { position: positions[k] || k, lead_area: area || 'geral' });
      setTimeout(function () { var n = document.getElementById('pr-nome'); if (n) n.focus({ preventScroll: true }); }, 600);
    });
  });

  /* Formulário */
  var form = document.getElementById('pr-form');
  if (!form) return;
  var nome = document.getElementById('pr-nome');
  var whats = document.getElementById('pr-whats');
  var honey = document.getElementById('pr-site');
  var err = document.getElementById('pr-err');
  var btn = document.getElementById('pr-submit');
  var label = document.getElementById('pr-submit-label');
  var loadedAt = Date.now();
  var sending = false;

  function mask(v) {
    var d = String(v || '').replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function validPhone(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.length !== 10 && d.length !== 11) return false;
    var ddd = parseInt(d.slice(0, 2), 10);
    if (ddd < 11 || ddd > 99) return false;
    if (d.length === 11 && d.charAt(2) !== '9') return false;
    if (/^(\d)\1+$/.test(d)) return false;
    return true;
  }
  function showErr(msg) { err.textContent = msg; err.hidden = false; }

  whats.addEventListener('input', function () { whats.value = mask(whats.value); err.hidden = true; });
  nome.addEventListener('input', function () { err.hidden = true; });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    var n = nome.value.trim().replace(/\s+/g, ' ');
    var w = whats.value;

    /* anti-spam: honeypot ou envio rápido demais */
    if (honey.value || Date.now() - loadedAt < 1500) { location.href = 'obrigado.html'; return; }
    if (n.length < 3) return showErr('Informe seu nome completo.');
    if (!validPhone(w)) return showErr('Informe um WhatsApp válido com DDD, por exemplo (48) 99999-9999.');

    var digits = w.replace(/\D/g, '');
    /* anti-duplicado: mesmo número na mesma sessão não grava de novo */
    var dupKey = 'pr_sent_' + digits, isDup = false;
    try { isDup = !!sessionStorage.getItem(dupKey); } catch (e2) {}

    sending = true; btn.disabled = true; label.textContent = 'Enviando…';

    var servico = area === 'familia' ? 'Direito de Família' : area === 'servidor' ? 'FGTS / ACT' : null;
    try { sessionStorage.setItem('pr_lead', JSON.stringify({ nome: n.split(' ')[0], area: area })); } catch (e3) {}

    track('generate_lead', { lead_area: area || 'geral', content_category: servico || 'Geral' });
    if (area) track(area === 'familia' ? 'lead_familia' : 'lead_servidor', { lead_area: area });

    var go = function () { location.href = 'obrigado.html'; };
    if (isDup) return go();
    var t = setTimeout(go, 4000);
    sb('lp_leads', { site: C.SITE, nome: n, whatsapp: digits, origem: origem(), servico: servico })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        try { sessionStorage.setItem(dupKey, '1'); } catch (e4) {}
        clearTimeout(t); go();
      })
      .catch(function () {
        clearTimeout(t);
        sending = false; btn.disabled = false; label.textContent = 'Enviar e falar com a equipe';
        showErr('Não conseguimos enviar agora. Tente novamente ou fale direto pelo WhatsApp (48) 99107-0385.');
      });
  });
})();

# LP Pedro Rovaris Advogados Associados

Landing page estática (Direito de Família + FGTS para ACT) publicada no Vercel.

- `index.html` — LP (formulário nome + WhatsApp, grava em `lp_leads`, visita em `lp_visits`)
- `obrigado.html` — confirmação com redirecionamento de 3s para o WhatsApp (URL de conversão `/obrigado`)
- `dashboard.html` — painel de leads com login (Supabase Auth, RLS por `site`)
- `config.js` — WhatsApp, Supabase (projeto ADS BR CLIENTES), `site = pedro-rovaris`, IDs de Pixel/GA4/GTM
- `tracking.js` — Pixel/GA4/GTM (carregam só se o ID estiver preenchido) + UTMs

Eventos: `cta_click`, `generate_lead` (Pixel: Lead), `lead_familia` / `lead_servidor`, `page_obrigado`, `whatsapp_click` (Pixel: Contact).

# LP Pedro Rovaris Advogados Associados

Landing page estática (Direito de Família + FGTS para ACT) publicada no Vercel.

- `familia.html` — LP Direito de Família (`site = pedro-rovaris-familia`) → `/obrigado-familia`
- `servidor.html` — LP Servidor Público / FGTS ACT (`site = pedro-rovaris-servidor`) → `/obrigado-servidor`
- `obrigado-familia.html` / `obrigado-servidor.html` — confirmação com redirecionamento de 3s para o WhatsApp (URLs de conversão)
- `dashboard.html` — painel de leads das duas LPs com login (Supabase Auth, RLS por `site`)
- `/` redireciona para `/familia`
- `config.js` — WhatsApp, Supabase (projeto ADS BR CLIENTES), `site = pedro-rovaris`, IDs de Pixel/GA4/GTM
- `tracking.js` — Pixel/GA4/GTM (carregam só se o ID estiver preenchido) + UTMs

Eventos: `cta_click`, `generate_lead` (Pixel: Lead), `lead_familia` / `lead_servidor`, `page_obrigado`, `whatsapp_click` (Pixel: Contact).

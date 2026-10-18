<div align="center">
  <img src="src/assets/logorvs.webp" alt="RVSolutions" width="180" />
  <h1>Roberto J. Vargas: Portfolio</h1>
</div>

Personal site of Roberto J. Vargas, Technology Solutions Architect: AI and Full Stack development. Bilingual (ES/EN), light and dark theme, and an AI assistant that answers questions about his work and books consultations.

Live: [https://rvargas.dev](https://rvargas.dev)

## Stack

React 19 · React Router 8 · TypeScript (strict) · Vite 8 · Tailwind CSS 4 · Motion · i18next (ES/EN) · EmailJS for the contact form · a Cloudflare Pages Function (`functions/api/chat.ts`) for the AI assistant.

## Run it

Requires Node 24 (see `.nvmrc`) and pnpm.

```sh
pnpm install
cp .env.example .env   # fill in the variables below
pnpm run dev           # http://localhost:5173, also serves /api/chat
```

| Command | What it does |
| --- | --- |
| `pnpm run typecheck` | `tsc -b` over app, tooling, API and tests |
| `pnpm run lint` | ESLint |
| `pnpm test` | Node test runner (API, services, SEO) |
| `pnpm run build` | Typecheck, then production build into `dist/` |

## Environment variables

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_EMAIL_USER_ID` | client | EmailJS public key (public by design) |
| `VITE_EMAIL_SERVICE_ID` | client | EmailJS service (public by design) |
| `VITE_EMAIL_TEMPLATE_ID` | client | EmailJS template (public by design) |
| `GEMINI_API_KEY` | server only | Model provider key for the assistant |
| `GEMINI_MODEL` | server only | Optional model override |
| `GEMINI_DAILY_CAP` | server only | Optional global daily cap on model calls |
| `ALLOWED_HOSTS` | server only | Hostnames allowed to use `/api/chat`. Fails closed: empty means `rvargas.dev`, `www.rvargas.dev`, `localhost`, `127.0.0.1` and `[::1]`. `*` lifts the restriction (Preview only). A new custom domain (IDN in punycode) must be added to the list |
| `ALLOWED_ORIGINS` | server only | Optional comma-separated origins allowed to call `/api/chat` besides the request's own origin |

Never give a secret the `VITE_` prefix: it would end up in the public bundle.

## Contact form (EmailJS)

Inquiries (contact page and the assistant's scheduling form) are sent with EmailJS and handled as tickets in RVDesk. The destination is set only in the EmailJS template; the client never sends a recipient.

Template configuration:

| Template field | Value |
| --- | --- |
| To Email | `soporte@rvdesk.app` (fixed, not a variable) |
| Reply-To | `{{reply_to}}` |
| Subject | `{{subject}}` |
| From Name | `{{from_name}}` |
| Body | `{{name}}`, `{{email}}`, `{{phone}}`, `{{message}}`, `{{source}}` |

- Use double braces (`{{ }}`, escaped) for every field; never triple braces (raw HTML).
- No auto-reply to the visitor.
- In the EmailJS dashboard, restrict the allowed domains to the site's origins and set the usage limits.
- RVDesk: the email account connected to the EmailJS service (the sender) must be a verified contact in the RVDesk workspace, or the message goes to quarantine for manual triage.

## Deploy (Cloudflare Pages)

1. Connect the repo in Workers & Pages. Framework preset: none. Build command `pnpm run build`, output directory `dist`. Set `NODE_VERSION=24` (the build also reads `.nvmrc`).
2. In Settings > Variables and Secrets, for Production and Preview: `GEMINI_API_KEY` as a Secret (a separate, low-quota key for Preview), and the optional `GEMINI_MODEL`, `GEMINI_DAILY_CAP`, `ALLOWED_ORIGINS`. Production does not need `ALLOWED_HOSTS` (the default is `rvargas.dev,www.rvargas.dev` plus localhost; it closes `*.pages.dev`, since the WAF/Rate Limiting rule only covers the custom domain). Preview MUST set `ALLOWED_HOSTS=*` to test the chat. A new custom domain (IDN in punycode) must be added to `ALLOWED_HOSTS`. The `VITE_EMAIL_*` variables are read at build time.
3. `functions/` is deployed as the `/api/chat` function; `public/_headers` sets the security and cache headers and `public/_redirects` sends `/` to `/aboutme` (302).
4. Add a Rate Limiting (WAF) rule for `POST /api/chat` and a spending cap or quota at the model provider. The in-memory limiter in the code is per isolate, only a first barrier.

## Structure

```
api/_lib/         /api/chat logic (Web Request/Response), shared by the Pages Function and the dev server
functions/        Cloudflare Pages Function (api/chat.ts)
public/           static files, theme-init.js (theme before first paint), _headers and _redirects
src/pages/        aboutme, projects, resume, contact
src/components/   UI, sidebar and the assistant (virtualassistant/)
src/data/         portfolio content
src/traducciones/ es/ and en/ strings
src/hooks, lib, services, context/
seo-html.ts       per-route metadata injected at build time
vite.config.ts    build, SEO pages and local /api/chat
```

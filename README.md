<div align="center">
  <img src="src/assets/logorvs.webp" alt="RVSolutions" width="180" />
  <h1>Roberto J. Vargas: Portfolio</h1>
</div>

Personal site of Roberto J. Vargas, Technology Solutions Architect: AI and Full Stack development. Bilingual (ES/EN), light and dark theme, and an AI assistant that answers questions about his work and books consultations.

Live: [https://rvargas.dev](https://rvargas.dev)

## Stack

React 19 · React Router 8 · TypeScript (strict) · Vite 8 · Tailwind CSS 4 · Motion · i18next (ES/EN) · EmailJS for the contact form · a Vercel serverless function (`api/chat.ts`) for the AI assistant.

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
| `ALLOWED_ORIGINS` | server only | Optional comma-separated origins allowed to call `/api/chat` |

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

## Deploy (Vercel)

1. Import the repo and set the variables above for Production (use a separate, low-quota key for Previews).
2. The build runs `pnpm run build`, so a type error fails the deploy.
3. Add a rate-limit rule in the Vercel Firewall for `POST /api/chat`, and set a spending cap or quota at the model provider. The in-memory limiter in the code is only a first barrier.

## Structure

```
api/              Vercel function (chat.ts) and its logic in _lib/
public/           static files, including theme-init.js (theme before first paint)
src/pages/        aboutme, projects, resume, contact
src/components/   UI, sidebar and the assistant (virtualassistant/)
src/data/         portfolio content
src/traducciones/ es/ and en/ strings
src/hooks, lib, services, context/
seo-html.ts       per-route metadata injected at build time
vite.config.ts    build, SEO pages and local /api/chat
```

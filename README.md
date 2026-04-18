<div align="center">

# Roberto J. Vargas — Portfolio v1.1.0

### Full Stack Developer & Tech Lead · RVSolutions Plus

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite_5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwind-css&logoColor=38BDF8)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-6D28D9?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Pro-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

**[Live Demo →](https://rvargas.dev)** · **[GitHub](https://github.com/RVSolutionsplus507/rvargas-portfolio-v2)**

<!-- Add a screenshot here: ![Preview](./src/assets/preview.png) -->

</div>

---

## Features

- **Dark / Light Mode** — seamless theme toggle with system preference detection
- **Bilingual (ES / EN)** — full i18next internationalization, instant switch
- **AI Virtual Assistant** — powered by Google Gemini 2.5 Pro, with consultation scheduling
- **Contact Form** — EmailJS integration, zero backend required
- **WhatsApp Widget** — one-tap direct messaging
- **Fluid Animations** — Framer Motion transitions + Canvas Confetti on key interactions
- **Experience Timeline** — visual career journey with animated entries
- **Tech Carousel** — auto-scrolling brand/stack showcase
- **Responsive** — mobile-first, tested across all breakpoints

---

## Quick Start

```sh
git clone https://github.com/RVSolutionsplus507/rvargas-portfolio-v2.git
cd rvargas-portfolio-v2
npm install
cp .env.example .env.local   # fill in your keys (see table below)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

```sh
npm run build    # production build
npm run preview  # preview production build locally
```

---

## Environment Variables

Create `.env.local` in the project root:

| Variable                   | Description                                   |
| -------------------------- | --------------------------------------------- |
| `VITE_EMAIL_USER_ID`     | EmailJS — your account User ID               |
| `VITE_EMAIL_SERVICE_ID`  | EmailJS — service ID for your email provider |
| `VITE_EMAIL_TEMPLATE_ID` | EmailJS — template ID for contact messages   |
| `VITE_GEMINI_API_KEY`    | Google AI Studio — Gemini 2.5 Pro API key    |

---

## Tech Stack

| Layer      | Technology                       |
| ---------- | -------------------------------- |
| UI Library | React 18                         |
| Build Tool | Vite 5                           |
| Styling    | Tailwind CSS + Shadcn UI         |
| Animations | Framer Motion · Canvas Confetti |
| i18n       | i18next · react-i18next         |
| AI         | Google Gemini 2.5 Pro            |
| Contact    | EmailJS                          |
| Forms      | React Hook Form                  |
| Deployment | Vercel                           |

---

## Deployment

1. Push to GitHub and connect the repository to Vercel
2. Add environment variables in **Project → Settings → Environment Variables**
3. Deploy — Vercel handles the rest automatically on every push to `main`

---

## Contact

| Channel  | Details                                                   |
| -------- | --------------------------------------------------------- |
| Email    | rvargas@rv-solutions.net                                  |
| LinkedIn | [Roberto J. Vargas](https://linkedin.com/in/rvsolutionsplus) |
| GitHub   | [@RVSolutionsplus507](https://github.com/RVSolutionsplus507) |
| WhatsApp | Via widget on the live site                               |

---

<div align="center">
  <sub>© 2026 Roberto J. Vargas · RVSolutions Plus · All rights reserved</sub>
</div>

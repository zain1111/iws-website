# Integrated Web Solutions — Website

Custom React + TypeScript + Tailwind CSS v4 build for the IWS marketing site.

## Stack
- **React 19 + TypeScript** — component architecture
- **Vite** — build tool / dev server
- **Tailwind CSS v4** — design tokens defined in `src/index.css` under `@theme`
- **Framer Motion** — all scroll/entrance animation

## Getting started
```bash
npm install
npm run dev       # local dev server
npm run build     # production build -> /dist
npm run preview   # preview the production build locally
```

## Project structure
```
src/
  assets/            # logo files (from client-supplied brand assets)
  components/
    Nav.tsx          # sticky header
    Hero.tsx         # signature "Assembly" hero - faceted shard motif + headline reveal
    TrustStrip.tsx   # stats + auto-scrolling stack marquee
    Services.tsx     # 6-item services grid
    Process.tsx      # 4-step process timeline
    Work.tsx         # portfolio preview grid (placeholder projects - swap in real case studies)
    Testimonials.tsx # client quotes (placeholder copy - swap before launch)
    CtaBand.tsx       # closing conversion band
    Footer.tsx        # footer + sitemap
    Reveal.tsx        # shared scroll-reveal wrapper (keeps motion consistent)
  index.css          # design tokens: color, type, motion keyframes
  App.tsx            # page composition
  main.tsx           # entry point
```

## Before launch — replace placeholders
1. `Work.tsx` — swap the 4 placeholder project tiles for real case studies with screenshots.
2. `Testimonials.tsx` — swap sample quotes for real client testimonials.
3. `CtaBand.tsx` / `Footer.tsx` — swap the `mailto:` and social links for real ones.
4. Wire the "Book a call" CTA to a real scheduler (Calendly/Cal.com embed recommended — see the strategy doc).
5. Add real `/privacy` and `/terms` pages if collecting lead form data.

See the accompanying **IWS Brand & Launch Strategy** document for the full design system reference, content for additional pages, SEO plan, analytics setup, deployment steps, and maintenance plan.

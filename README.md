# threadworksoftware.com

Corporate site for Threadwork Software, Inc.

Its job is credibility: OpenSCORM buyers who want to know whether there is a real company behind the product should be
able to answer that in under a minute.

## Stack

Same toolchain as `openscorm/www`, without the blog machinery.

- Astro 6, static output, `trailingSlash: 'always'`
- Tailwind CSS v4 through `@tailwindcss/vite` (no `tailwind.config.js`, tokens live in `src/assets/styles/tailwind.css`)
- Inter Variable via `@fontsource-variable/inter`
- `astro-icon` with the Tabler set, `astro-seo`, `@astrojs/sitemap`, `astro-compress`
- ESLint 10, Prettier, `astro check`, all three behind `npm run check`
- Deployed to GitHub Pages by `.github/workflows/deploy.yml`

Dark mode follows `prefers-color-scheme`. There is no toggle, so there is no theme script and no flash to guard against.

## Commands

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Dev server on http://localhost:4321                 |
| `npm run build`   | Production build to `dist/`                         |
| `npm run preview` | Serve the built output                              |
| `npm run check`   | `astro check`, then ESLint, then Prettier (CI gate) |
| `npm run fix`     | ESLint `--fix` then Prettier `-w`                   |

## Editing content

Company facts (legal name, founding year, email, product dates, nav) live in `src/config.ts`. Change them there, not in
components.

The accent color is five custom properties at the top of `src/assets/styles/tailwind.css`. Changing `--color-brand` and
its four companions restyles the whole site.

Section copy lives in the component that renders it: `Hero`, `WhatWeDo`, `Sectors`, `Timeline`, `Provenance`, `Product`,
`Contact`, `Footer`.

## The Verify section

This is the part of the page that does the real work, so it deserves an explanation before anyone edits it.

The site claims the company dates to 2006. A reader who doubts that runs a WHOIS on the domain, gets January 2026, and
needs somewhere to go next. The `Verify` section is that somewhere: the legal entity, the jurisdiction, the incorporation
year, the date the current name was adopted, and the register the whole thing sits in.

Two rules for it.

**The register number is the point.** `ENTITY.registryNumber` in `src/config.ts` is the one token that lets a reader
confirm the incorporation date without trusting the site. It renders only when it holds a real value, and the row
disappears when it is empty rather than printing a placeholder, because a visible placeholder in this block reads worse
than an omission.

**Answers render once.** `PROVENANCE_FAQ` in `src/config.ts` is both the visible copy in the section and the source of
the `FAQPage` structured data emitted by `src/pages/index.astro`. Editing the array changes both. Never hand-write the
JSON-LD text separately, or the two will disagree and the disagreement is exactly what a skeptical reader is looking for.

The site does not link to any former company domain. That is deliberate, not an oversight: the corroboration runs the
other way, from the older domain into this one.

## Before first deploy

1. Confirm the contact address in `src/config.ts` (currently an assumption).
2. Create `public/og.png` at 1200x630. `Layout.astro` already points at `/og.png`.
3. Point DNS at GitHub Pages and confirm `public/CNAME` matches the hostname you settle on.
4. Stand up the one-page notice on the older company domain pointing here, so its registration date corroborates the
   2006 claim from its own side.

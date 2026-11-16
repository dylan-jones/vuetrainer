# VueTrainer

A personal learning platform for getting ready for a Vue.js job. It tracks progress through:

1. **Udemy: Vue.js course** (in progress)
2. **Modern CSS**: `@layer`, advanced Grid, `@container`
3. **Vue in depth**: fundamentals, advanced slots, component `v-model`, publishing components
4. **Vuetify 4 styling**: Sass variables, custom CSS layers, component defaults

Each lesson has notes, a checklist, an exercise, resources, personal notes and (where useful) a live demo.
The app itself is the example: it is built with Vue 3, Vite, TypeScript, Pinia, Vue Router and Vuetify 4, and it
uses the techniques it teaches (see `src/styles/`, `src/plugins/vuetify.ts`, `src/demos/`).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run build
```

With no Firebase config the app runs in **local mode**: progress is stored in this browser only.

## Turn on login + cloud sync (Google or email/password)

1. Create a project at <https://console.firebase.google.com>.
2. **Authentication → Sign-in method**: enable **Google** and **Email/Password**.
3. **Firestore Database**: create a database, then publish the rules in `firestore.rules`
   (each user can only read/write `users/{their uid}`).
4. **Project settings → Your apps → Web app**: copy the config values into `.env`
   (see `.env.example`). They are public identifiers, not secrets.
5. **Authentication → Settings → Authorized domains**: add `localhost` and your Cloudflare domain
   (e.g. `vuetrainer.pages.dev`).

## Deploy to Cloudflare Pages

Option A, Git integration (recommended, auto-deploys on every push):

1. Push this repo to GitHub (below).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick the repo.
3. Build command `npm run build`, output directory `dist`.
4. Add the four `VITE_FIREBASE_*` variables under **Settings → Variables and secrets**.

Option B, CLI: `npx wrangler login`, then `npm run deploy`
(builds with your local `.env` and runs `wrangler pages deploy dist --project-name vuetrainer`).

`public/_redirects` makes deep links like `/lesson/css-layers` work as a single-page app.

## Push to GitHub

```bash
git remote add origin git@github.com:dylan-jones/vuetrainer.git
git push -u origin main
```

## Adding or editing lessons

Lessons are markdown files in `src/content/lessons/`. The filename is the lesson id.

```md
---
title: My lesson
track: vue            # udemy | css | vue | vuetify (see src/content/tracks.ts)
order: 5
minutes: 30
summary: One line.
demo: MyDemo          # optional, register in src/demos/index.ts
objectives:
  - Checklist item
resources:
  - Link title | https://example.com
---

Body in markdown.

## Exercise

Everything after this heading becomes the exercise box.
```

Set your real start date in `src/config.ts` (drives the countdown and the daily-minutes suggestion).

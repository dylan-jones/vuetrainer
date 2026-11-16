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

Login uses **Firebase Auth**; progress is stored in a **Cloudflare D1** database through a small Worker
(`worker/index.ts`, routes `GET/PUT /api/progress`). The Worker verifies the user's Firebase ID token and only
ever reads or writes the row for that user's uid.

1. In the Firebase console: **Authentication → Sign-in method**: enable **Google** and **Email/Password**.
2. **Project settings → Your apps → Web app**: copy the config values into `.env`
   (see `.env.example`). They are public identifiers, not secrets. Firestore is not used.
3. **Authentication → Settings → Authorized domains**: add `localhost` and your production hostname.
4. Set `FIREBASE_PROJECT_ID` in `wrangler.jsonc` to your Firebase project id.

## Deploy to Cloudflare (Workers + static assets + D1)

One-time:

```bash
npx wrangler login
npx wrangler d1 create vuetrainer          # put the database_id in wrangler.jsonc
npm run db:migrate                         # creates the progress table in the remote database
```

Deploy with Git integration (auto-deploys on every push): connect the repo under **Workers & Pages**, build
command `npm run build`, deploy command `npx wrangler deploy`, and add the four `VITE_FIREBASE_*` values as
build variables (or commit them in `.env.production`; they are public identifiers).
Or deploy from your machine: `npm run deploy` (uses your local `.env`).

Run `npm run db:migrate` again whenever you add a file to `migrations/`.

`not_found_handling: single-page-application` in `wrangler.jsonc` makes deep links like `/lesson/css-layers`
work, and `run_worker_first: ["/api/*"]` sends only API calls to the Worker.

Local API testing: `npm run build && npm run db:migrate:local && npm run dev:api`, then `npm run dev`
(the dev server proxies `/api` to the Worker on port 8787).


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

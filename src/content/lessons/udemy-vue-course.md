---
title: Finish the Udemy Vue.js course
track: udemy
order: 1
minutes: 600
summary: Work through the course, then use it as the baseline for everything else here.
objectives:
  - Reached 25% of the course
  - Reached 50% of the course
  - Reached 75% of the course
  - Finished all lectures
  - Built and understood the course's final project
resources:
  - Udemy Vue.js course | https://www.udemy.com/course/vue-js-course/
  - Vue official guide | https://vuejs.org/guide/introduction.html
---

This is the course you are currently working through. Everything else in VueTrainer builds on it, so treat it as the foundation.

## How to get the most out of it

- **Code along, never just watch.** Pause, type it yourself, then break it on purpose and fix it.
- **Prefer `<script setup>` and the Composition API.** That is what new code at work will almost certainly use. If the course teaches the Options API, understand it (you'll meet it in older code) but translate examples into `<script setup>`.
- **Keep a "things I didn't know" list** in the notes box on this page. Review it weekly.
- **Time-box.** Aim for a steady daily amount (the dashboard tells you how many minutes a day keeps you on track for January).

## Self-check before moving on

You should be able to explain, without looking:

1. The difference between `ref`, `reactive` and `computed`.
2. How props go down and events come up.
3. What `v-if` vs `v-show` does, and why `:key` matters on `v-for`.
4. How Vue Router and Pinia fit into an app.
5. Component lifecycle hooks and when to use `watch` vs `watchEffect`.

## Exercise

Without copying from the course, build a small "reading list" app: add, remove and mark items as read, persist to `localStorage`, filter by status. Use `<script setup>`, one child component with props and emits, and one composable.

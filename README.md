# top-performance-todo

A blazing-fast, persistent **Top Performance** Todo experience.

> Built with **Next.js 14** (App Router) · **React 18** · **Redux Toolkit** · **redux-persist** · **TypeScript (strict)** · **Tailwind CSS**

---

## ✨ Features

- ✅ Add / toggle / edit (double-click) / delete tasks
- 🚦 Priority levels (Low · Medium · High) — click the dot to cycle
- 🔍 Filters: All · Active · Completed with live counts
- 📊 Stats card with animated progress bar
- 🧹 Clear completed (`Ctrl/⌘ + Shift + C`)
- ⌨️ Keyboard shortcuts: `/` focus input · `Enter` add · `Esc` cancel
- 💾 State persisted to `localStorage` via `redux-persist`
- ♿ Accessible, responsive, reduced-motion aware

---

## 🚀 Performance choices

- **ID-list rendering** — `TodoList` re-renders only when the visible **ID array** changes; each `TodoItem` uses a per-instance `makeSelectTodoById` factory selector, so toggling one item re-renders only that row.
- **`createSelector`** memoization across visible-todos, stats, and IDs.
- **`React.memo`** on every prop-receiving component.
- **Code-split client bundle** — `TodoApp` is `next/dynamic` with `ssr: false` to keep the SSR shell tiny and dodge `localStorage` rehydration on the server.
- **`optimizePackageImports`** for `@reduxjs/toolkit` and `react-redux`.
- **Self-hosted Inter** via `next/font` with `display: swap` — zero CLS, no third-party request.

---

## 🧱 Project layout

```
src/
├── app/
│   ├── layout.tsx        # Inter font, ReduxProvider, metadata
│   ├── page.tsx          # Server shell + dynamic client island
│   └── globals.css       # Glass + gradients + reduced-motion
├── components/
│   ├── Header.tsx
│   ├── TodoApp.tsx       # Composition + global keybinds
│   ├── TodoInput.tsx
│   ├── FilterBar.tsx
│   ├── StatsBar.tsx
│   ├── TodoList.tsx
│   └── TodoItem.tsx
└── lib/redux/
    ├── store.ts          # configureStore + redux-persist
    ├── slices/todosSlice.ts
    ├── selectors.ts      # createSelector
    ├── hooks.ts          # Typed Redux hooks
    └── Provider.tsx      # PersistGate-wrapped Provider
```

---

## 🛠️ Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve production build
npm run type-check   # tsc --noEmit
```

---

## 📦 Scripts

| Script              | Description                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Start the Next.js dev server      |
| `npm run build`     | Build for production              |
| `npm run start`     | Run the production build          |
| `npm run lint`      | Lint with `next lint`             |
| `npm run type-check`| Strict TypeScript verification    |



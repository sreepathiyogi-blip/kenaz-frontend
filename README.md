# Kenaz Ad Studio v2 — React + Vite

Live: https://sreepathiyogi-blip.github.io/kenaz-frontend/

## What changed from v1

| Issue | Fix |
|---|---|
| Meta "reduce data" rate-limit crash | Insights fetched 5 ads at a time with 500ms delay |
| All 249 DOM nodes rendered at once | `@tanstack/react-virtual` — only renders visible cards |
| Global state in plain JS variables | Zustand store — predictable, React-friendly |
| Single 2000-line HTML file | Split into components, hooks, api, store |
| Manual deploy | GitHub Actions auto-deploys on every push to `main` |

## Local dev

```bash
npm install
npm run dev
# → http://localhost:5173/kenaz-frontend/
```

## Deploy to GitHub Pages

1. Push this repo to GitHub (repo name must match `base` in `vite.config.js`)
2. Go to repo **Settings → Pages → Source** → set to **GitHub Actions**
3. Push to `main` — the workflow builds and deploys automatically

If your repo name is different from `kenaz-frontend`, update `base` in `vite.config.js`:
```js
base: '/YOUR-REPO-NAME/',
```

## Adding your credentials

Open Settings in the app (⚙ button) and paste:
- **Access Token** — your Meta Graph API token
- **Ad Account IDs** — `act_1820431671907314` etc., one per line

Credentials are saved to `localStorage` — never committed to the repo.

## Project structure

```
src/
├── api/
│   └── meta.js          # All Meta Graph API calls
├── hooks/
│   └── useLoadAds.js    # Orchestrates the full load flow
├── components/
│   ├── AdCard.jsx       # Single ad card
│   ├── VirtualGrid.jsx  # Virtualized card grid
│   ├── Sidebar.jsx      # Settings panel
│   └── SummaryBar.jsx   # KPI summary row
├── store/
│   └── useStore.js      # Zustand global state + normalizeAd()
├── utils/
│   ├── fmt.js           # Number/currency formatters
│   └── export.js        # Excel export
├── App.jsx
└── main.jsx
```

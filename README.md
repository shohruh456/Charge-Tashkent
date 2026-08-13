# Charge Tashkent

A production-ready Demo Day application for discovering and managing EV charging infrastructure in Tashkent, Uzbekistan. Drivers can search the city, filter local charging networks and connector standards, inspect live availability, save favorites, and open a detailed station view.

## Highlights

- Responsive map/search dashboard with mobile list and map modes
- Tashkent districts and deterministic geo-positioning around `41.2995, 69.2401`
- Local networks: Tokbor, Voltauto, K Watt, and NRG
- Connector filtering: GB/T, CCS2, GIBRID, and Type 2
- Live states: Available, In use, and Offline
- Full client-side CRUD with a Fetch-based data bootstrap and localStorage persistence
- Validated station form with React Hook Form, Zod, and clear field errors
- Station detail pages with directions, pricing, port availability, and status updates
- Persistent driver reviews with 1–5 star ratings and live average score updates
- Zustand global state for stations, filters, selected station, search, and favorites
- TanStack Query caching and mutation invalidation
- English, Russian, and Uzbek using i18next
- Persistent light/dark themes
- Loading skeletons, empty/error states, reduced-motion support, and toast notifications
- Headless UI component library: accessible animated `Dialog` and keyboard-friendly `Listbox`
- Custom 404 page

## Tech stack

React 19, Vite 8, React Router, Tailwind CSS 4, Headless UI, Zustand, TanStack Query, React Hook Form, Zod, i18next, and Lucide React.

## Routes

| Route | View |
| --- | --- |
| `/` | Interactive map and search dashboard |
| `/stations/:stationId` | Charging station detail and status update |
| `/manage` | Add, list, and delete stations |
| `*` | Custom not-found page |

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite. To make a production bundle:

```bash
npm run lint
npm run build
npm run preview
```

## Project structure

```text
public/
  stations.json             Seed data for Tashkent stations
src/
  components/               Header, filters, map, station cards, badges, toast UI
  hooks/useStations.js      Query-to-store synchronization
  pages/                    Dashboard, details, management, and 404 views
  services/                 Station CRUD API adapter and toast service
  store/                    Zustand station and preference store
  App.jsx                   Application routes and shell
  i18n.js                   EN/RU/UZ translations
  index.css                 Tailwind theme and map visuals
  main.jsx                  Query client and React entry point
```

## Data and persistence

On first load, `public/stations.json` is read through `fetch()` and copied to the browser under `charge-tashkent-stations`. All create, update, and delete operations update that local dataset. Favorites, theme, and language are persisted separately. To restore the original seed data, remove those keys from the browser's localStorage.

The `stationApi` adapter intentionally presents an async API boundary. It can be replaced with REST endpoints without changing the page components or the Zustand store contract.

## Deployment

The app builds to the static `dist/` directory and can be deployed to Vercel, Netlify, Cloudflare Pages, or any static host. Configure the host to rewrite unknown routes to `index.html` so React Router routes work after refresh.

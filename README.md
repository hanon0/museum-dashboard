# Museum Dashboard

A museum administration dashboard built with React, Vite, and Tailwind CSS.

## Features

- Collection, employee, visitor, and museum table views
- Search, sorting, column controls, and CSV export
- Add, edit, delete, and relationship drawer workflows
- Collection gallery and loan timeline
- Data integrity alerts
- Dark mode and accent color controls

## Project structure

- `src/data/museumSeed.json`: sample data used while no backend is connected
- `src/data/museumSchema.js`: table fields, primary keys, and relationships
- `src/components/`: dashboard views, forms, tables, and dialogs
- `src/utils/museum.js`: shared formatting and data-integrity helpers
- `src/MuseumDashboard.jsx`: application state and page layout

When connecting a backend, replace the JSON seed with API requests and send
create, update, and delete operations to the corresponding API endpoints.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

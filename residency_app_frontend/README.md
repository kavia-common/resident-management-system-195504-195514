# Residency Manager (React, Local-only)

A lightweight React frontend for a residency management app. There is **no backend**—all resident data is stored locally on the user's device.

## Features

- Dashboard list with search and status filter
- Pagination (10 per page)
- Add/Edit resident via modal form with validation
- Resident detail page (routing)
- Delete confirmation dialog
- Toast notifications for user feedback
- Local persistence:
  - Uses **IndexedDB** when available
  - Falls back to **localStorage** otherwise
- Seeds a few sample residents on first run if storage is empty

## Project structure

- `src/pages/` – Screens (Dashboard, Resident Detail)
- `src/components/` – Reusable UI components (Button, Modal, Form, etc.)
- `src/hooks/` – Reusable hooks (toasts, residents)
- `src/services/` – Storage/repository layer (IndexedDB + fallback)
- `src/types/` – Data shape documentation (Resident type)

## How data is stored

All resident records are stored locally in your browser:

- IndexedDB database: `residency_app_db`
- Object store: `residents`

Fallback localStorage key: `residency_app_residents_v1`

No backend URLs are used.

## Getting started

In this directory:

- `npm start` – start dev server
- `npm run build` – build for production
- `npm test` – run tests

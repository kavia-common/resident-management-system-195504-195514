# resident-management-system-195504-195514

## Residency Management App (Local-only)

This project contains a React frontend (`residency_app_frontend/`) for managing residents (add/edit/delete, search/filter, and detail view). There is **no backend**—all data is stored locally in the browser on the user’s device.

### How the UI works

- **Dashboard (`/`)**
  - Lists residents with columns: name, age, unit/room, status, contact.
  - Search and status filter.
  - Pagination (10 per page).
  - Add/Edit via modal form with validation.
  - Delete requires confirmation.

- **Resident Detail (`/residents/:id`)**
  - Click a row from the dashboard to view full details.
  - Edit/Delete available from the detail page (edit uses modal).

- **User feedback**
  - Toast notifications for create/update/delete and errors.

### Local data storage

A small repository layer (`src/services/residentRepository.js`) abstracts storage:

- Prefers **IndexedDB** (if available in the browser)
- Falls back to **localStorage** if IndexedDB is not available

On first run, if storage is empty, the app seeds a small set of sample residents (`src/services/seedResidents.js`).

No environment variables or backend URLs are required for this app to function.

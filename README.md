# Hotel Management System

A browser-based hotel operations demo built with plain HTML, CSS and JavaScript. It provides simple screens for managing rooms, bookings, guest check-ins and billing records.

## Features in the current frontend

- Dashboard with room and booking summaries
- Add, view and edit room records
- Create and view bookings
- Guest check-in workflow
- Add and view billing charges
- Section-based navigation

## Tech stack

- HTML
- CSS
- Vanilla JavaScript
- Browser `localStorage` for persistence

## Run locally

No package manager or backend server is required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Asjadpathan31/hotel-management-project.git
   cd hotel-management-project
   ```
2. Open `index.html` in a modern browser.

For a local static server, you can also run:
```bash
python -m http.server 8000
```
Then open http://localhost:8000.

## Data and project limitations

- Records are stored in the current browser's `localStorage`; they are not shared between devices or users.
- There is no backend API or database in the current repository.
- This is a learning/demo project, not a production hotel-management system. Do not enter real guest payment details or sensitive personal information.
- Clearing browser storage will remove locally saved demo records.

## Repository files

- `index.html` — page structure and application sections
- `styles.css` — visual styling
- `script.js` — room, booking, check-in, billing and local-storage logic

## Author

Asjad Pathan · [GitHub](https://github.com/Asjadpathan31) · [Portfolio](https://asjadpathan31.github.io/portfolio/)

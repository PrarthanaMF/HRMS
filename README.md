# Marutiflex HRMS (frontend)

## Running with the backend

The app talks to the HRMS backend (Node/Express, repo `hrms-backend`) for login and, step by step, for its data.

1. Start the backend on port 8000 (`npm run dev` in the backend folder).
2. Start this app: `npm install`, then `npm run dev`. It opens on http://localhost:4500.
3. Sign in with a backend login (email and password). Logins are created by an admin in the backend.

In development Vite forwards every `/api` call to http://localhost:8000 (`vite.config.js`), so the login cookie works without CORS set-up. Use `VITE_API_PROXY` for a backend on another address, and `VITE_API_BASE` for the API URL in a production build.

All calls go through `src/api/client.js`. Endpoints are documented in the backend's `docs/API.md`.

Attendance (calendar, summary, leave / WFH / missed punch / comp-off, web punch, approvals, holidays, month lock, import) and the notification bell use the backend. `src/api/attendance.js` turns the backend responses into the shapes the attendance screens use.

Web punch: the first punch from a browser registers it as that employee's punch device (one per employee; HR can reset it), and each punch sends the browser's location, so location access must be allowed.

Workforce (employee list, form with documents, detail view) and HR Set-up (`/master`: users, branches, leave types, leave balances, week-off policies, employee and holiday imports) use the backend too.

Screens not yet connected (recruitment, exit process, dashboard figures) still use the mock data in `src/Utils/mock*.js`. `src/Mocks/attendanceFixture.json` is no longer used.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
<!-- sneha branch  -->
//sneha

//trying to push

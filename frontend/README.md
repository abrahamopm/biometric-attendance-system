# Biometric Attendance System – Frontend

Project notes (concise)

- Overview: React + Vite app for hosts and students; talks to a Django REST backend at http://127.0.0.1:8000/api.
- Auth: JWT via SimpleJWT; optional TOTP 2FA. If 2FA is enabled, login returns `2fa_required` + `challenge_id`, then the UI prompts for a 6‑digit code to complete sign‑in.
- Key features: Live attendance, host dashboards, student face enrollment, reports, profile and security (password + 2FA).
- Config: API base URL is set in [frontend/src/api/axios.js](frontend/src/api/axios.js).

Quick start

```bash
# Backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

2FA basics

- Enable: POST `/api/users/enable_2fa/` after signing in; scan `otpauth_url` in an authenticator app.
- Login: enter username/password → if prompted, enter the 6‑digit code → tokens are stored and the profile is fetched.

Structure highlights

- Core pages: `src/pages/host` (host views), `src/pages/student` (student views), `src/pages/common` (profile, live attendance).
- Auth context: [frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx) handles login, 2FA verify, profile fetch, and logout.
- Attendance UI: `src/pages/common/LiveAttendance.jsx` and student features under `src/components/student`.

Notes

- Face recognition is handled by the backend; this frontend submits base64 images to mark attendance.
- For production, consider environment‑based API URLs and adding a UI to enable/disable 2FA from the profile.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

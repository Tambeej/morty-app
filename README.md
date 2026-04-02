# Morty 🏠

AI-powered mortgage analysis SaaS for Israeli users.

## Tech Stack

- **Framework**: React 18 (Create React App)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS v3
- **Forms**: React Hook Form + Zod validation
- **HTTP**: Axios with JWT interceptors
- **Charts**: Recharts
- **PWA**: Workbox service worker (Cache-First assets, Network-First API)

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and set your backend URL:

```bash
cp .env.example .env.local
```

```env
REACT_APP_API_URL=http://localhost:5000/api/v1
```

### Development

```bash
npm start
```

Opens [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

Outputs to `./build`.

### Tests

```bash
npm test
```

## Project Structure

```
src/
  App.js                    # Root component with routing
  index.js                  # Entry point + service worker registration
  service-worker.js         # Workbox PWA service worker
  serviceWorkerRegistration.js
  context/
    AuthContext.jsx          # Auth state: login, register, logout
    ToastContext.jsx         # Unified toast notifications: addToast
  components/
    common/
      Button.jsx
      Card.jsx
      Input.jsx
      Spinner.jsx
      Skeleton.jsx
      ProgressBar.jsx
    layout/
      Sidebar.jsx
      Navbar.jsx
      PageLayout.jsx
  pages/
    LoginPage.jsx
    RegisterPage.jsx
    DashboardPage.jsx
    FinancialProfilePage.jsx
    UploadPage.jsx
    AnalysisPage.jsx
  services/
    api.js                   # Axios instance with token refresh
  styles/
    globals.css              # Tailwind directives + global styles
```

## API Integration

All API calls go through `src/services/api.js` which:
- Attaches `Authorization: Bearer <token>` header automatically
- Handles 401 responses by refreshing the token
- Redirects to `/login` if refresh fails

Base URL is configured via `REACT_APP_API_URL` environment variable.

## Authentication

- JWT access tokens (24h) stored in `localStorage`
- Refresh tokens (7d) stored in `localStorage`
- Auto-refresh on 401 responses
- `useAuth()` hook exposes: `{ user, token, loading, login, register, logout }`

## PWA Features

- Offline support via Workbox service worker
- Cache-First strategy for static assets
- Network-First strategy for API calls
- Installable on mobile and desktop

## Deployment

Deployed to GitHub Pages. The `homepage` field in `package.json` is set to
`https://Tambeej.github.io/morty-app`.

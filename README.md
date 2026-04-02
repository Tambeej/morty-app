# Morty — AI-Powered Mortgage Analysis

A React SPA (PWA-enabled) for Israeli users to analyze mortgage offers using AI.

## Tech Stack

- **React 18** + **Vite 5** (build tool)
- **React Router v6** (client-side routing)
- **React Hook Form** + **Zod** (form validation)
- **Axios** (API client with JWT interceptors)
- **Recharts** (data visualization)
- **Tailwind CSS** (styling)
- **react-hot-toast** (notifications)
- **vite-plugin-pwa** (PWA / service worker)

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```
VITE_API_URL=https://morty-backend.onrender.com/api/v1
```

## Project Structure

```
src/
  components/
    common/       # Button, Input, Card, Spinner, ProgressBar, Skeleton
    layout/       # Sidebar, Navbar, PageLayout
  context/        # AuthContext (JWT auth state)
  pages/          # LoginPage, RegisterPage, DashboardPage, FinancialProfilePage, UploadPage, AnalysisPage
  services/       # api.js (Axios instance + all API calls)
  styles/         # globals.css (Tailwind + CSS vars)
  test/           # Unit and component tests (Vitest)
```

## PWA

The app is PWA-ready with:
- Service worker (via `vite-plugin-pwa` / Workbox)
- Cache-First strategy for static assets
- Network-First strategy for API calls
- Offline fallback
- Installable on mobile and desktop

## Deployment

Deployed to GitHub Pages at `https://tambeej.github.io/morty-app/`.

The Vite config sets `base: '/morty-app/'` for correct asset paths.

# Morty - AI-Powered Mortgage Analysis

Morty is a SaaS platform for Israeli users to analyze mortgage offers using AI.

## Features

- 🔐 Secure JWT authentication
- 📊 Financial profile management
- 📄 Mortgage offer upload (PDF/PNG/JPG)
- 🤖 AI-powered analysis with recommendations
- 📈 Interactive comparison charts
- 🌐 Hebrew/English RTL support
- 📱 PWA-ready (offline support)

## Tech Stack

- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **React Hook Form** + Zod for validation
- **Recharts** for data visualization
- **Axios** with JWT interceptors
- **react-i18next** for internationalization
- **Workbox** for PWA/service worker

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
REACT_APP_API_URL=https://your-backend.onrender.com/api/v1
```

## Project Structure

```
src/
  components/
    common/       # Reusable UI components
    layout/       # Sidebar, Navbar, PageLayout
  context/        # AuthContext, ToastContext
  hooks/          # useAuth
  i18n/           # Translations (EN/HE)
  pages/          # Route-level page components
  services/       # API service layer
  styles/         # Global CSS
```

## Deployment

This app is configured for GitHub Pages deployment.

```bash
npm run deploy
```

## License

MIT

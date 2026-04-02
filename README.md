# Morty - AI-Powered Mortgage Analysis

> SaaS platform for Israeli users to analyze and optimize their mortgage offers using AI.

## Features

- Secure Authentication (JWT)
- Financial Dashboard
- File Upload (PDF/image)
- AI Analysis (OpenAI)
- PWA Support
- RTL/Hebrew Support
- Accessible (WCAG 2.1 AA)

## Tech Stack

- React 18 + Vite 5
- React Router v6
- Tailwind CSS 3
- Axios (JWT interceptors)
- React Hook Form + Zod
- Recharts
- vite-plugin-pwa
- Vitest + React Testing Library

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Scripts

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run tests
npm run test:coverage # Tests with coverage
```

## Routes

| Route | Page | Auth |
|---|---|---|
| `/` | Redirect to dashboard | Yes |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard | Yes |
| `/profile` | Financial Profile | Yes |
| `/upload` | Upload Offer | Yes |
| `/analysis/:id` | Analysis Results | Yes |

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api/v1` |

## Deployment

Deployed to GitHub Pages: **https://tambeej.github.io/morty-app**

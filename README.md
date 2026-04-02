# Morty - AI-Powered Mortgage Analysis

Morty is a React SPA that helps Israeli users analyze their mortgage offers using AI.

## Features

- 🔐 **Secure Authentication** - JWT-based login and registration
- 📊 **Financial Profile** - Input and track your financial data
- 📄 **Document Upload** - Upload mortgage offer PDFs/images
- 🤖 **AI Analysis** - Get AI-powered mortgage analysis and recommendations
- 📱 **PWA Support** - Works offline with service worker caching
- 🇮🇱 **RTL Support** - Hebrew language support

## Tech Stack

- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **React Hook Form** + **Zod** for form validation
- **Axios** for API communication
- **Recharts** for data visualization
- **Workbox** for PWA/service worker

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/Tambeej/morty-app.git
cd morty-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your backend URL
# REACT_APP_API_URL=https://your-backend.onrender.com/api/v1

# Start development server
npm start
```

### Build for Production

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |

## Project Structure

```
src/
  components/
    common/          # Reusable UI components
    layout/          # Layout components (Sidebar, Navbar)
  context/           # React Context (Auth, Toast)
  pages/             # Page components
  services/          # API service layer
  styles/            # Global CSS
```

## API Integration

The frontend connects to the Morty backend API at `REACT_APP_API_URL`.

See the [Architecture Design](../morty-backend/README.md) for full API documentation.

## License

MIT

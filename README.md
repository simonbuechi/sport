# BJJ Amigo

**BJJ Amigo** is a modern, light-weight PWA (Progressive Web App) designed for Brazilian Jiu-Jitsu practitioners to track their training journey, techniques, and progress.

## Features

- **Personal Journal**: Log your training sessions, focus areas, and notes from every roll.
- **Technique Library**: Organize and search your techniques by category, position, and belt level.
- **Progress Tracking**: Keep tabs on your promotions, training frequency, and overall consistency.
- **PWA Ready**: Install BJJ Amigo on your mobile device for a native app-like experience, even offline.
- **Real-time Sync**: Powered by Firebase for seamless data synchronization across all your devices.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Material UI (MUI) with Emotion
- **Backend/Database**: Firebase (Firestore, Authentication)
- **PWA**: `vite-plugin-pwa` for offline capabilities and installation
- **Routing**: React Router 7

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/simonbuechi/bjj.git
   cd bjj
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the application for production.
- `npm run lint`: Runs ESLint for code quality checks.
- `npm run preview`: Previews the production build locally.

## Mobile Installation

BJJ Amigo is a PWA. When visiting the app URL on your mobile browser, look for the "Add to Home Screen" or "Install App" prompt to get the best experience.

---

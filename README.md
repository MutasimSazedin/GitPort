# GitPort

A one-page portfolio application built with React and Vite.

## What It Includes

- a streamlined landing page with light and dark themes
- sections for `Projects`, `Achievements`, and `Certificates`
- a contact form
- an admin sign-in area for managing live content
- Firebase-backed content loading when external services are configured

The app can still run locally without live services. In that case, it behaves like a local preview and uses fallback content where available.

## Tech Stack

- React
- Vite
- Firebase
- EmailJS

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env`.

3. Start the development server:

```bash
npm run dev
```

4. Open the local URL shown by Vite, usually:

```txt
http://localhost:5173/GitPort/
```

## Environment Setup

The project includes an `.env.example` file that shows the optional environment values used for live integrations.

- Firebase powers the live content sections and admin sign-in
- EmailJS powers the contact form

If those services are not configured, the app can still be launched locally, but some live features will be unavailable or fall back to preview behavior.

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run build
```

Creates the production build.

```bash
npm run preview
```

Previews the production build locally.

```bash
npm run deploy
```

Publishes the built app to GitHub Pages.

## Project Structure

```txt
src/
  components/
  data/
  hooks/
  lib/
  App.jsx
  App.css
```

- `components/` contains reusable UI pieces
- `data/` contains local seed content
- `hooks/` contains app-level state and data logic
- `lib/` contains service setup such as Firebase

## Notes

- The GitHub Pages base path is already configured for this repository.
- Firestore and Storage rule templates are included in `firestore.rules` and `storage.rules`.
- `.env` is ignored by git and should stay local to the machine running the app.

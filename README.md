# Mutasim Sazedin Portfolio

A one-page portfolio built with React + Vite, with:

- a redesigned viewer page
- light and dark themes
- an admin sign-in button
- live Firebase-backed sections for `Projects`, `Achievements`, and `Certificates`
- a working contact form through EmailJS with email fallback

`Projects` can show starter local data before Firebase is connected. `Achievements` and `Certificates` stay empty until you add them from the admin panel.

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env`.

3. Start the dev server:

```bash
npm run dev
```

4. Open the Vite URL, usually:

```txt
http://localhost:5173/GitPort/
```

## Environment variables

Add these to `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_ADMIN_EMAIL=

VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=

VITE_CONTACT_EMAIL=
```

`VITE_CONTACT_EMAIL` is recommended even if EmailJS is configured, because the site can still fall back to `mailto:`.

Important: this is a client-side app. Any `VITE_...` value used by the browser is bundled into the frontend and is therefore publicly visible after deployment. Firebase web config and the EmailJS public key are designed for this, but truly secret keys must never be put in `VITE_` variables.

## Full setup

### 1. Create a Firebase project

1. Open the Firebase console.
2. Create a project.
3. Add a Web App.
4. Copy the Firebase config values into `.env`.

### 2. Enable authentication

1. In Firebase, open `Authentication`.
2. Enable `Email/Password`.
3. Create your admin user in Firebase Auth with the exact same email you put in `VITE_ADMIN_EMAIL`.

### 3. Add authorized domains

In Firebase Authentication, add these domains if needed:

- `localhost`
- `MutasimSazedin.github.io`

If GitHub Pages is already serving the site from another custom domain, add that too.

### 4. Create Firestore

1. Open `Firestore Database`.
2. Create the database in production mode.
3. Create these collections:
   - `projects`
   - `achievements`
   - `certificates`

You do not need to add documents manually. The admin panel will create them.

### 5. Create Storage

1. Open `Storage`.
2. Create the bucket.
3. This is only needed if you later re-enable file uploads or need Firebase Storage for other assets.

### 6. Apply security rules

Use the contents of [firestore.rules](./firestore.rules) in Firestore Rules, replacing `YOUR_ADMIN_EMAIL` with your real admin email.

Use the contents of [storage.rules](./storage.rules) in Storage Rules, replacing `YOUR_ADMIN_EMAIL` with your real admin email.

### 7. Configure EmailJS

1. Create an EmailJS account.
2. Add an email service.
3. Create a template.
4. Put the Service ID, Template ID, and Public Key into `.env`.

The template should accept these variables:

- `from_name`
- `from_email`
- `reply_to`
- `subject`
- `message`

If EmailJS is not configured, the contact section still shows the fallback contact email from `VITE_CONTACT_EMAIL`.

## Deploy

This repo is already configured for GitHub Pages.

```bash
npm run deploy
```

The Vite base path is set for the `GitPort` repository, so the built app deploys correctly to GitHub Pages.

## Recommended first-time flow

1. Fill in `.env`.
2. Set up Firebase Auth, Firestore, and Storage.
3. Paste the rules from `firestore.rules` and `storage.rules`.
4. Run `npm run dev`.
5. Sign in from the `Admin` button on the page.
6. Add your real projects, achievements, and certificates.
7. Test the contact form.
8. Run `npm run deploy`.

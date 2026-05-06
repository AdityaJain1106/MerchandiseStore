# ACOOKIEGOD Merchandise Store

A modern full-stack ecommerce merchandise store built using React, Vite, Tailwind CSS, Firebase, Framer Motion, and Three.js.

## Features

* Modern responsive ecommerce UI
* Dynamic product rendering
* Product categories and filters
* Add to cart functionality
* Persistent cart system
* Firebase Authentication
* Firestore cart sync
* Guest cart persistence using localStorage
* Cart restoration after login
* Wishlist system
* Responsive navigation
* Smooth animations using Framer Motion
* Premium modern design
* Reusable component architecture
* Optimized scalable codebase

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Three.js

### Backend & Database

* Firebase Authentication
* Firebase Firestore

### State Management

* Zustand

---

## Project Structure

```bash
src/
 ├── components/
 ├── data/
 ├── firebase/
 ├── layouts/
 ├── pages/
 ├── store/
 ├── utils/
 ├── App.jsx
 ├── main.jsx
 └── index.css
```

---

## Environment Variables

Create a `.env` file in the root directory and add:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

---

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
```

Navigate into the project:

```bash
cd store-main
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

---

## Firebase Setup

1. Create a Firebase project
2. Enable Authentication
3. Enable Firestore Database
4. Add your Firebase credentials in `.env`
5. Configure Firestore rules

---

## Firestore Rules

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null
                           && request.auth.uid == userId;
    }

  }
}
```

---

## Cart Persistence Logic

* Guest users → cart stored in localStorage
* Logged-in users → cart synced with Firestore
* Cart automatically restores on login
* Cart clears locally on logout
* Firestore cart remains saved for future logins

---

## Future Improvements

* Payment Gateway Integration
* Order History
* Admin Dashboard
* Product Reviews
* Inventory Management
* Email Verification
* Google Authentication
* Checkout System

---

## Author

Aditya Jain

Built with ❤️ using React and Firebase.

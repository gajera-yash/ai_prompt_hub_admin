# Firebase Setup Guide — Step by Step

This guide explains exactly where to find every value for your `.env` file.

---

## Step 1: Go to Firebase Console

1. Open your browser and go to: **https://console.firebase.google.com**
2. Sign in with your Google account
3. Click on your existing project (or create a new one by clicking "Add project")

---

## Step 2: Create (or open) your Firebase project

- If creating a new project:
  - Enter project name (e.g., `prompt-hub`)
  - Disable Google Analytics (optional)
  - Click **Create Project**
  - Wait for the project to be ready, then click **Continue**

---

## Step 3: Register a Web App (if not already done)

1. In your Firebase project, click the **⚙️ Gear icon** (top-left next to "Project Overview")
2. Click **Project settings**
3. Scroll down to **Your apps** section
4. If you don't see a Web app listed:
   - Click the **Web** icon ( `</>` ) to add a new web app
   - Enter app nickname: `prompt-hub-admin`
   - (Optional) Check "Also set up Firebase Hosting" — not needed
   - Click **Register app**
5. After registering, you'll see your Firebase config object

---

## Step 4: Copy values from Firebase to .env

The Firebase config looks like this in the console:

```js
const firebaseConfig = {
  apiKey: "AIzaSyB7...",
  authDomain: "prompt-hub.firebaseapp.com",
  projectId: "prompt-hub",
  storageBucket: "prompt-hub.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

Here is exactly what to copy:

| .env Variable | Firebase Config Field | Where to find it |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` | Project Settings → Your apps → Web app → `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` | Same place, the `authDomain` field |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` | Same place, the `projectId` field |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` | Same place, the `storageBucket` field |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` | Same place, the `messagingSenderId` field |
| `VITE_FIREBASE_APP_ID` | `appId` | Same place, the `appId` field |

**Example `.env` file after filling in:**

```
VITE_FIREBASE_API_KEY=AIzaSyB7Xk3J9z2F8vR5mQpL6nW1cD4gH0tY3eU
VITE_FIREBASE_AUTH_DOMAIN=prompt-hub.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=prompt-hub
VITE_FIREBASE_STORAGE_BUCKET=prompt-hub.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> Note: If your Firebase project already exists and you don't remember registering a Web app, the config is still in **Project Settings → Your apps → Web app (SDK setup and configuration)**.

---

## Step 5: Enable Email/Password Authentication

1. In Firebase Console, go to **Authentication** (left sidebar)
2. Click **Sign-in method** tab
3. Find **Email/Password** provider, click it
4. Toggle **Enable** ON
5. Click **Save**

---

## Step 6: Create a Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Click **Next**, choose a location close to you
5. Click **Enable**

---

## Step 7: Enable Firebase Storage

1. In Firebase Console, go to **Storage** (left sidebar)
2. Click **Get started**
3. Choose **Start in test mode**
4. Click **Done**

---

## Step 8: Add an authorized admin user

1. In Firebase Console → **Authentication** → **Users** tab
2. Click **Add user**
3. Enter your admin email (e.g., `admin@yourdomain.com`) and a password
4. Click **Add user** — this is the email/password you'll use to log into the Admin Panel

---

## Done! Now test the app

1. Create the `.env` file inside `prompt_hub_admin/` with the values you copied
2. Restart the dev server:
   ```
   cd prompt_hub_admin\prompt_hub_admin
   npm run dev
   ```
3. Open **http://localhost:5174** in your browser
4. Log in with the email/password you just created in Step 8
# 🔥 Firebase Setup Guide

This guide will help you configure Firebase for local development and contribution to this project.

---

## 📦 Prerequisites

Make sure you have the following before you begin:

- Node.js v16+
- Firebase project (you can use an existing one or create a new one at https://console.firebase.google.com/)
- Firebase CLI (optional but recommended)

---

## ⚙️ Firebase Configuration Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Give your project a name and follow the steps (you can disable Google Analytics for the project)

---

### 2. Enable Firestore

1. In the Firebase Console, go to **Build > Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development only)
4. Select a location and click **Enable**

---

### 3. Enable Authentication

1. Go to **Build > Authentication > Sign-in method**
2. Enable the following:
   - **Email/Password**
   - **Google** (for Google Sign-in)
     - Provide a project support email
     - Set **Authorized domains** to include `localhost`

---

### 4. Create Web App

1. In Firebase Console, go to **Project settings > General**
2. Under **Your apps**, click `</>` to add a web app
3. Register your app (no need to enable Firebase Hosting unless needed)
4. Copy the Firebase config snippet:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

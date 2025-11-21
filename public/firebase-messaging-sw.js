// public/firebase-messaging-sw.js

// This file is required to handle background notifications

// Import and initialize the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

// --- IMPORTANT ---
// You must copy your *exact* firebaseConfig object here
// from src/firebase.ts
const firebaseConfig = {
  apiKey: "AIzaSyD_2iiZsTcdUZB6i7zG_5ZLYu-K6IP6u8A",
  authDomain: "subminder-a485f.firebaseapp.com",
  projectId: "subminder-a485f",
  storageBucket: "subminder-a485f.firebasestorage.app",
  messagingSenderId: "665141089622",
  appId: "1:665141089622:web:673132da5bc67d1a6b32f7",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get the messaging service
const messaging = firebase.messaging();

// Handle background messages
// (This is a simple handler that just logs to the console)
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // Or your app's icon
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
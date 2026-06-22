import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Central Firebase configuration used across login/signup pages.
// Make sure this is the exact Web app config from your Firebase Console,
// and that the API key is not restricted to the wrong referrer/origin.
  const firebaseConfig = {
    apiKey: "AIzaSyCyBGC5fk4KoJy9tRgjQ9om2gaAZ2sfCUA",
    authDomain: "gamify-c3cf0.firebaseapp.com",
    databaseURL: "https://gamify-c3cf0-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "gamify-c3cf0",
    storageBucket: "gamify-c3cf0.firebasestorage.app",
    messagingSenderId: "1037420990963",
    appId: "1:1037420990963:web:c3d60458f60764d6a2c286",
    measurementId: "G-ZPKZ5YRT6V"
  };

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

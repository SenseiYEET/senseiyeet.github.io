// ============================================================================
// Centralized Firebase configuration
// ============================================================================
// IMPORTANT — READ BEFORE DEPLOYING:
//
// 1. This file used to be duplicated (with the key inline) across FOUR
//    separate files: login.js, register.js, article-db.js and
//    article-manager.js. That made it very easy for the key to drift out of
//    sync, and meant a leaked key was 4x more likely to be missed. It is now
//    defined ONCE here and imported everywhere else.
//
// 2. The Firebase "apiKey" below is NOT a secret in the traditional sense —
//    it identifies your project, it does not authorize access on its own.
//    Real protection comes from your Firebase Realtime Database / Firestore
//    "Rules", which you must configure in the Firebase console. Right now,
//    if your rules are still in test mode (the default), ANYONE with this
//    key can read and write your entire database.
//
//    Go to Firebase Console -> Realtime Database -> Rules, and set something
//    like this as a starting point:
//
//    {
//      "rules": {
//        "articles": {
//          ".read": true,
//          "$articleId": {
//            ".write": "auth != null && (!data.exists() || data.child('authorId').val() === auth.uid)"
//          }
//        }
//      }
//    }
//
//    This allows anyone to READ articles (since it's a public wiki) but only
//    lets a signed-in user create an article, or edit/delete an article they
//    themselves created.
//
// 3. If this code has ever been pushed to a public GitHub repo or deployed
//    live, rotate this key in the Firebase console (Project settings ->
//    General -> your web app -> regenerate), then update it here.
// ============================================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCyBGC5fk4KoJy9tRgjQ9om2gaAZ2sfCUA",
  authDomain: "gamify-c3cf0.firebaseapp.com",
  projectId: "gamify-c3cf0",
  storageBucket: "gamify-c3cf0.firebasestorage.app",
  messagingSenderId: "1037420990963",
  appId: "1:1037420990963:web:c3d60458f60764d6a2c286",
  measurementId: "G-ZPKZ5YRT6V",
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

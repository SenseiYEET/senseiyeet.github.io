import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

// Making sure that the user's always authenticated
export function watchAuthState(onReady) {
  onAuthStateChanged(auth, (user) => {
    onReady(user);
  });
}

// Checks if the user needs to login in before accessing the web page
export function requireLogin(loginPath, onLoggedIn) {
  watchAuthState((user) => {
    if (!user) {
      window.location.href = loginPath;
      return;
    }
    onLoggedIn(user);
  });
}

// Allows user to logout from the website
export function wireLogoutButton(buttonId, redirectPath) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      window.location.href = redirectPath;
    } catch (error) {
      alert("Couldn't log out: " + error.message);
    }
  });
}

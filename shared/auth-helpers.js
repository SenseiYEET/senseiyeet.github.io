// ============================================================================
// Shared authentication helpers
// ============================================================================
// Used by any page that needs to know who's logged in, redirect guests away
// from protected pages, or provide a working logout button.
// ============================================================================

import { auth } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/**
 * Calls onReady(user) once Firebase has resolved the current auth state.
 * user will be null if no one is logged in.
 */
export function watchAuthState(onReady) {
  onAuthStateChanged(auth, (user) => {
    onReady(user);
  });
}

/**
 * Redirects to the login page if no one is logged in.
 * Call this at the top of any page that requires a logged-in user.
 * loginPath should be a relative path to login-page.html from the calling page.
 */
export function requireLogin(loginPath, onLoggedIn) {
  watchAuthState((user) => {
    if (!user) {
      window.location.href = loginPath;
      return;
    }
    onLoggedIn(user);
  });
}

/**
 * Wires up a logout button by id. Redirects to redirectPath after signing out.
 */
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

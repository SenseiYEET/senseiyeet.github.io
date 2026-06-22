import { auth } from "../shared/firebase-config.js";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const form = document.querySelector("form");
const submit = document.getElementById("submit");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorEl = document.getElementById("form-error");

// If someone's already logged in, skip the login page entirely
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "account-section/account_menu.html";
  }
});

// Login in with email and password
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError("");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  submit.disabled = true;
  submit.textContent = "Logging in…";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "account-section/account_menu.html";
  } catch (error) {
    setError(friendlyError(error));
  } finally {
    submit.disabled = false;
    submit.textContent = "Log In";
  }
});

function setError(message) {
  if (!errorEl) return;
  errorEl.textContent = message;
}

// Sends out a friendly error when your email or password is wrong
function friendlyError(error) {
  switch (error.code) {
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
      return "We couldn't find an account with those details.";
    case "auth/wrong-password":
      return "That password doesn't match this account.";
    case "auth/too-many-requests":
      return "Too many attempts — please wait a moment and try again.";
    default:
      return error.message;
  }
}

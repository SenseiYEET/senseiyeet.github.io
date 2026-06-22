import { auth } from "../shared/firebase-config.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const form = document.querySelector("form");
const submit = document.getElementById("submit");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorEl = document.getElementById("form-error");

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "account-section/account_menu.html";
  }
});

// Creating the password for the account
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setError("");

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (password.length < 6) {
    setError("Password should be at least 6 characters.");
    return;
  }

  submit.disabled = true;
  submit.textContent = "Creating account…";

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    window.location.href = "account-section/account_menu.html";
  } catch (error) {
    setError(friendlyError(error));
  } finally {
    submit.disabled = false;
    submit.textContent = "Sign Up";
  }
});

function setError(message) {
  if (!errorEl) return;
  errorEl.textContent = message;
}

function friendlyError(error) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account with that email already exists — try logging in instead.";
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    default:
      return error.message;
  }
}

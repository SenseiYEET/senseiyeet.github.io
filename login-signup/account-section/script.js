import {requireLogin, wireLogoutButton} from "../../shared/auth-helpers.js";

    requireLogin("../login-page.html", (user) => {
      document.querySelector("#user-email").textContent = user.email || "";
    });

    wireLogoutButton("logout-btn", "../login-page.html");
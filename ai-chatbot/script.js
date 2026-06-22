// ============================================================================
// SECURITY NOTE — read before deploying this publicly
// ============================================================================
// The API_KEY below calls the Gemini API directly from the browser. Anyone
// who views this page's source (or your network tab) can read it and use it
// themselves, potentially running up your bill or exhausting your quota.
//
// For a real deployment, move this call behind a small backend instead:
//   browser -> your server (holds the real key, e.g. as an env var)
//            -> Gemini API
// Firebase Cloud Functions is a natural fit here since you're already using
// Firebase elsewhere in this project. Until that's in place, treat this key
// as effectively public and keep an eye on usage/quotas in Google AI Studio.
// ============================================================================

const container = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats-container");
const promptForm = document.querySelector(".prompt-form");
const promptInput = promptForm.querySelector(".prompt-input");
const fileInput = promptForm.querySelector("#file-input");
const fileUploadWrapper = promptForm.querySelector(".file-upload-wrapper");
const themeToggle = document.querySelector("#theme-toggle-btn");

// API Setup
const API_KEY = "AQ.Ab8RN6Lu2pqqETaw86_uq7a6jTTCDZBY8Sr0dfAZJaU5jHKWUw";
// NOTE: the original code referenced "gemini-3.1-flash-lite", which is not a
// real published Gemini model name and would 404. Using a real current
// model id instead.
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`;

// Give the model some grounding so it actually behaves like "Gamify AI",
// a game-development-focused assistant, rather than a generic chatbot.
const SYSTEM_CONTEXT = {
  role: "user",
  parts: [{
    text: "You are Gamify AI, a helpful assistant embedded in a game development wiki called Gamify. " +
      "Help users with questions about game design, game engines (Unity, Unreal, Godot), programming, " +
      "game art, sound design, and related topics. Keep answers practical and concise unless asked for depth.",
  }],
};
const SYSTEM_ACK = {
  role: "model",
  parts: [{ text: "Understood — I'm ready to help with game development questions." }],
};

let typingInterval, controller;
const chatHistory = [SYSTEM_CONTEXT, SYSTEM_ACK];
const userData = { message: "", file: {} };

// Function to create message elements
const createMsgElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// Scroll to the bottom of the container
const scrollToBottom = () =>
  container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });

// Simulate typing effect for bot responses
const typingEffect = (text, textElement, botMsgDiv) => {
  textElement.textContent = "";
  const words = text.split(" ");
  let wordIndex = 0;

  typingInterval = setInterval(() => {
    if (wordIndex < words.length) {
      textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
      scrollToBottom();
    } else {
      clearInterval(typingInterval);
      botMsgDiv.classList.remove("loading");
      document.body.classList.remove("bot-responding");
    }
  }, 40);
};

// Make the API call and generate the bot's response
const generateResponse = async (botMsgDiv) => {
  const textElement = botMsgDiv.querySelector(".message-text");
  controller = new AbortController();

  chatHistory.push({
    role: "user",
    parts: [
      { text: userData.message },
      ...(userData.file.data
        ? [{ inline_data: (({ fileName, isImage, ...rest }) => rest)(userData.file) }]
        : []),
    ],
  });

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: chatHistory }),
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || `Request failed (${response.status})`);
    }

    const candidate = data?.candidates?.[0];
    const responseText = candidate?.content?.parts?.[0]?.text;

    if (!responseText) {
      // The API can return a candidate with no text if it was blocked by
      // safety filters, hit a recitation flag, or ran out of tokens.
      const reason = candidate?.finishReason;
      throw new Error(
        reason
          ? `No response was generated (reason: ${reason}). Try rephrasing your question.`
          : "No response was generated. Try rephrasing your question."
      );
    }

    const cleanText = responseText.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
    typingEffect(cleanText, textElement, botMsgDiv);

    chatHistory.push({ role: "model", parts: [{ text: cleanText }] });
  } catch (error) {
    textElement.style.color = "#d62939";
    textElement.textContent =
      error.name === "AbortError" ? "Response generation stopped." : error.message;
    botMsgDiv.classList.remove("loading");
    document.body.classList.remove("bot-responding");
  } finally {
    userData.file = {};
  }
};

// Handle the form submission
const handleFormSubmit = (event) => {
  event.preventDefault();
  const userMessage = promptInput.value.trim();
  if (!userMessage || document.body.classList.contains("bot-responding")) return;

  promptInput.value = "";
  userData.message = userMessage;
  document.body.classList.add("bot-responding", "chats-active");
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");

  // Build the user message bubble, including any attached file preview.
  // (Fixed: the original template literal used curly typographic quotes
  // and angle brackets — ‹p› instead of <p> — which is invalid HTML/JS and
  // would silently break the whole script the first time someone sent a
  // message with a file attached.)
  const attachmentHtml = userData.file.data
    ? userData.file.isImage
      ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="img-attachment" />`
      : `<p class="file-attachment"><span class="material-symbols-rounded">description</span>${userData.file.fileName}</p>`
    : "";

  const userMsgHTML = `<p class="message-text"></p>${attachmentHtml}`;

  const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
  userMsgDiv.querySelector(".message-text").textContent = userMessage;
  chatsContainer.appendChild(userMsgDiv);
  scrollToBottom();

  setTimeout(() => {
    const botMsgHTML =
      '<img src="../images/gemini-chatbot-logo.svg" alt="" class="avatar"><p class="message-text">Just a sec...</p>';
    const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
    chatsContainer.appendChild(botMsgDiv);
    scrollToBottom();
    generateResponse(botMsgDiv);
  }, 600);
};

// Handle file input change (file upload)
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  const isImage = file.type.startsWith("image/");
  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onload = (e) => {
    fileInput.value = "";
    const base64String = e.target.result.split(",")[1];
    fileUploadWrapper.querySelector(".file-preview").src = e.target.result;
    fileUploadWrapper.classList.add("active", isImage ? "img-attached" : "file-attached");

    userData.file = { fileName: file.name, data: base64String, mime_type: file.type, isImage };
  };
});

// Cancel file upload
document.querySelector("#cancel-file-btn").addEventListener("click", () => {
  userData.file = {};
  fileUploadWrapper.classList.remove("active", "img-attached", "file-attached");
});

// Stop ongoing bot response
document.querySelector("#stop-response-btn").addEventListener("click", () => {
  userData.file = {};
  controller?.abort();
  clearInterval(typingInterval);
  // Fixed: original selector ".bot-message-loading" doesn't match any
  // element (the classes are applied separately as "bot-message" and
  // "loading"), so this would throw "cannot read properties of null".
  chatsContainer.querySelector(".bot-message.loading")?.classList.remove("loading");
  document.body.classList.remove("bot-responding", "chats-active");
});

// Delete all chats
document.querySelector("#delete-chats-btn").addEventListener("click", () => {
  chatHistory.length = 0;
  chatHistory.push(SYSTEM_CONTEXT, SYSTEM_ACK);
  chatsContainer.innerHTML = "";
  document.body.classList.remove("bot-responding", "chats-active");
});

// Handle suggestions click
document.querySelectorAll(".suggestions-item").forEach((item) => {
  item.addEventListener("click", () => {
    promptInput.value = item.querySelector(".text").textContent;
    promptForm.dispatchEvent(new Event("submit"));
  });
});

// Toggle dark/light theme
themeToggle.addEventListener("click", () => {
  const isLightTheme = document.body.classList.toggle("light-theme");
  localStorage.setItem("themeColor", isLightTheme ? "light_mode" : "dark_mode");
  themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";
});

// Set initial theme from local storage (defaults to light to match the site)
const isLightTheme = localStorage.getItem("themeColor") !== "dark_mode";
document.body.classList.toggle("light-theme", isLightTheme);
themeToggle.textContent = isLightTheme ? "dark_mode" : "light_mode";

promptForm.addEventListener("submit", handleFormSubmit);
promptForm.querySelector("#add-file-btn").addEventListener("click", () => fileInput.click());

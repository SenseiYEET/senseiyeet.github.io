import { requireLogin } from "../../shared/auth-helpers.js";
import {
  createArticleWithFallback,
  updateArticleWithFallback,
  getArticle,
  deleteArticle,
} from "../../shared/article-service.js";


const titleInput = document.querySelector("#article-title");
const categorySelect = document.querySelector("#article-category");
const previewBtn = document.querySelector("#preview-btn");
const saveBtn = document.querySelector("#save-btn");
const deleteBtn = document.querySelector("#delete-btn");
const statusEl = document.querySelector("#editor-status");

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"],
  ["blockquote", "code-block"],
  ["link", "image", "video", "formula"],
  [{ header: 1 }, { header: 2 }],
  [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
  [{ script: "sub" }, { script: "super" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
  ["clean"],
];

const quill = new Quill("#editor", {
  modules: { toolbar: toolbarOptions },
  theme: "snow",
});

// Figure out whether we're editing an existing article or creating a new one
const params = new URLSearchParams(window.location.search);
const editingId = params.get("id");

let currentUser = null;

// This page requires login. ../../ because article-editor.html lives in /articles/
requireLogin("../login-signup/login-page.html", async (user) => {
  currentUser = user;

  if (editingId) {
    await loadExistingArticle(editingId);
  } else {
    deleteBtn.style.display = "none"; // nothing to delete yet for a brand new article
    setStatus("");
  }
});

async function loadExistingArticle(id) {
  setStatus("Loading article…");
  try {
    const article = await getArticle(id);
    if (!article) {
      setStatus("That article no longer exists.", true);
      return;
    }
    if (article.authorId !== currentUser.uid) {
      setStatus("You can only edit articles you created.", true);
      saveBtn.disabled = true;
      deleteBtn.disabled = true;
      quill.disable();
      return;
    }

    titleInput.value = article.title || "";
    if (categorySelect) categorySelect.value = article.category || "Uncategorised";

    if (article.contentDelta) {
      try {
        quill.setContents(JSON.parse(article.contentDelta));
      } catch {
        // fall back to raw HTML if the delta is somehow malformed
        quill.root.innerHTML = article.contentHtml || "";
      }
    }
    setStatus("Editing \u201c" + article.title + "\u201d");
  } catch (error) {
    setStatus("Couldn't load article: " + error.message, true);
  }
}

function setStatus(text, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.style.color = isError ? "#d62939" : "";
}

function getArticleData() {
  return {
    title: titleInput.value.trim(),
    category: categorySelect ? categorySelect.value : "Uncategorised",
    contentDelta: quill.getContents(),
    contentHtml: quill.getSemanticHTML(),
  };
}

// Save (create or update depending on whether we're editing)
saveBtn.addEventListener("click", async () => {
  const data = getArticleData();

  if (!data.title) {
    setStatus("Please give your article a title before saving.", true);
    titleInput.focus();
    return;
  }
  if (!quill.getText().trim()) {
    setStatus("Your article looks empty — add some content before saving.", true);
    return;
  }

  saveBtn.disabled = true;
  setStatus("Saving…");

  try {
    if (editingId) {
      await updateArticleWithFallback(editingId, data);
      setStatus("Saved!");
    } else {
      const newId = await createArticleWithFallback(data);
      setStatus("Published! Redirecting to search so you can find your article…");
      const q = encodeURIComponent(data.title || "");
      window.location.href = `article-search.html?q=${q}`;
      return;
    }
  } catch (error) {
    setStatus("Couldn't save: " + error.message, true);
  } finally {
    saveBtn.disabled = false;
  }
});

// Delete (only available when editing an existing article)
deleteBtn.addEventListener("click", async () => {
  if (!editingId) return;
  const sure = confirm("Delete this article permanently? This can't be undone.");
  if (!sure) return;

  try {
    await deleteArticle(editingId);
    window.location.href = "../login-signup/account-section/article/article-manager.html";
  } catch (error) {
    setStatus("Couldn't delete: " + error.message, true);
  }
});

// Preview in a new tab without saving, using the same read-only renderer as
// the real article displayer so what you see is what gets published.
previewBtn.addEventListener("click", () => {
  const data = getArticleData();
  sessionStorage.setItem("article-preview", JSON.stringify(data));
  window.open("displayer/article-displayer.html?preview=1", "_blank");
});

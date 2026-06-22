// NOTE: article-service.js and auth-helpers.js both import Firebase, which
// is itself loaded from https://www.gstatic.com. A static top-level import
// would fail this entire module — leaving the page stuck on "Loading
// article…" forever — if that network request can't complete (offline,
// ad-blocker, CORS hiccup, regional block, outage, etc.). Loading them
// dynamically inside try/catch lets the page fall back to local dummy
// article data instead, the same way articles/js/article-search.js does.
import { getDummyArticle } from "./article-displayer-fallback.js";

const loading = document.querySelector("#loading");
const wrapper = document.querySelector("#article-wrapper");
const notFound = document.querySelector("#not-found");
const categoryEl = document.querySelector("#article-category");
const titleEl = document.querySelector("#article-title");
const metaEl = document.querySelector("#article-meta");
const contentEl = document.querySelector("#article-content");
const ownerActions = document.querySelector("#owner-actions");
const editLink = document.querySelector("#edit-link");

const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");
const isPreview = params.get("preview") === "1";

async function init() {
  if (isPreview) {
    showPreview();
    return;
  }

  if (!articleId) {
    showNotFound();
    return;
  }

  let article = null;
  let authHelpers = null;

  try {
    const service = await import("../../shared/article-service.js");
    article = await service.getArticle(articleId);
    authHelpers = await import("../../shared/auth-helpers.js");
  } catch (error) {
    // Firebase-backed lookup failed (or never had this id) — fall back to
    // the local dummy data so known sample articles still render.
    console.warn("Falling back to local dummy article:", error);
    article = getDummyArticle(articleId);
  }

  if (!article) {
    showNotFound();
    return;
  }
  renderArticle(article);

  // Only show the "Edit this article" link to the article's own author.
  // Skipped entirely if Firebase auth couldn't load — there's no signed-in
  // user to check against anyway in that case.
  if (authHelpers) {
    authHelpers.watchAuthState((user) => {
      if (user && user.uid === article.authorId) {
        editLink.href = `../article-editor.html?id=${articleId}`;
        ownerActions.style.display = "block";
      }
    });
  }
}

function showPreview() {
  const raw = sessionStorage.getItem("article-preview");
  if (!raw) {
    showNotFound();
    return;
  }
  const data = JSON.parse(raw);
  renderArticle({
    title: data.title || "Untitled (preview)",
    category: data.category || "Uncategorised",
    contentHtml: data.contentHtml || "",
    authorEmail: "Preview",
    updatedAt: Date.now(),
  });
}

function renderArticle(article) {
  loading.style.display = "none";
  wrapper.style.display = "block";

  categoryEl.textContent = article.category || "Uncategorised";
  titleEl.textContent = article.title || "Untitled article";

  const date = article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "";
  metaEl.textContent = `By ${article.authorEmail || "Unknown"} · ${date}`;

  contentEl.innerHTML = article.contentHtml || "<p>No content.</p>";
}

function showNotFound() {
  loading.style.display = "none";
  notFound.style.display = "block";
}

init();

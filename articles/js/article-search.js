// NOTE: article-service.js (and the firebase-config.js it imports) is loaded
// dynamically below, inside a try/catch, rather than via a static top-level
// import. A static import would fail the *entire* module — including all the
// search/render logic in this file — if Firebase's SDK can't be reached
// (offline, ad-blocker, CORS hiccup, regional block, outage, etc.), with no
// way to recover. A dynamic import() rejects like a normal promise instead,
// so the page can fall back to local dummy articles and still work.
import { filterArticles as localFilterArticles, getDummyArticles as localGetDummyArticles } from "./article-search-fallback.js";

const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const grid = document.querySelector("#article-grid");
const loading = document.querySelector("#loading");
const empty = document.querySelector("#empty");
const resultCount = document.querySelector("#result-count");

let allArticles = [];
let filterArticles = localFilterArticles;

async function init() {
  try {
    const service = await import("../../shared/article-service.js");
    // Use the real service's filter so behaviour matches the rest of the
    // app whenever the module loaded successfully.
    filterArticles = service.filterArticles;
    allArticles = await service.getAllArticles();
    if (allArticles.length === 0) {
      allArticles = service.getDummyArticles();
    }
  } catch (error) {
    // Either the module failed to load (e.g. Firebase SDK unreachable) or a
    // call inside it threw. Either way, fall back to local dummy data so the
    // page still renders something useful instead of spinning forever.
    console.warn("Falling back to local dummy articles:", error);
    allArticles = localGetDummyArticles();
  }

  loading.style.display = "none";
  // If a `q` parameter was provided (e.g. after publishing), prefill the
  // search input so the newly-saved article appears immediately.
  try {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) searchInput.value = q;
  } catch {}

  render();
}

function render() {
  const text = searchInput.value;
  const category = categoryFilter.value;

  let results = filterArticles(allArticles, text);
  if (category) {
    results = results.filter((a) => a.category === category);
  }

  resultCount.textContent = `${results.length} article${results.length === 1 ? "" : "s"} found`;

  grid.innerHTML = "";
  if (results.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  for (const article of results) {
    grid.appendChild(renderCard(article));
  }
}

function renderCard(article) {
  const card = document.createElement("a");
  card.className = "article-card";
  // Sample/dummy articles live entirely in the static article-template.html
  // (no Firebase needed). Real, user-published articles still go through
  // the dynamic displayer, which looks them up by id.
  card.href = article.id.startsWith("dummy-")
    ? `article-template.html?id=${article.id}`
    : `displayer/article-displayer.html?id=${article.id}`;

  const category = document.createElement("span");
  category.className = "article-card-category";
  category.textContent = article.category || "Uncategorised";

  const title = document.createElement("h3");
  title.textContent = article.title || "Untitled article";

  const excerpt = document.createElement("p");
  excerpt.textContent = stripHtml(article.contentHtml || "").slice(0, 140);

  const meta = document.createElement("div");
  meta.className = "article-card-meta";
  const date = article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "";
  meta.textContent = `By ${article.authorEmail || "Unknown"} · ${date}`;

  card.append(category, title, excerpt, meta);
  return card;
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

searchInput.addEventListener("input", render);
categoryFilter.addEventListener("change", render);

init();

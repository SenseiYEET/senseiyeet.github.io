import { requireLogin, wireLogoutButton } from "../../../shared/auth-helpers.js";
import { getArticlesByAuthor, deleteArticle } from "../../../shared/article-service.js";

const listEl = document.querySelector("#article-list");
const statusEl = document.querySelector("#manager-status");
const emailEl = document.querySelector("#user-email");

// account-section/article/ -> need ../../ to reach login-signup/login-page.html
requireLogin("../../login-page.html", async (user) => {
  emailEl.textContent = user.email || "";
  await loadArticles(user.uid);
});

wireLogoutButton("logout-btn", "../../login-page.html");

async function loadArticles(uid) {
  statusEl.textContent = "Loading your articles…";
  try {
    const articles = await getArticlesByAuthor(uid);
    statusEl.textContent = "";
    render(articles, uid);
  } catch (error) {
    statusEl.textContent = "Couldn't load your articles: " + error.message;
  }
}

function render(articles, uid) {
  listEl.innerHTML = "";

  if (articles.length === 0) {
    listEl.innerHTML = `
      <div class="col-12">
        <p class="text-muted">You haven't written any articles yet.
        <a href="../../../articles/article-editor.html">Create your first one</a>.</p>
      </div>`;
    return;
  }

  for (const article of articles) {
    listEl.appendChild(renderCard(article));
  }
}

function renderCard(article) {
  const col = document.createElement("div");
  col.className = "col-sm-6 col-lg-4 article-row-card";

  const updated = article.updatedAt ? new Date(article.updatedAt).toLocaleDateString() : "";
  const excerpt = stripHtml(article.contentHtml || "").slice(0, 110);

  col.innerHTML = `
    <div class="card h-100">
      <div class="card-body d-flex flex-column">
        <span class="badge text-bg-light align-self-start mb-2">${escapeHtml(article.category || "Uncategorised")}</span>
        <h5 class="card-title">${escapeHtml(article.title || "Untitled article")}</h5>
        <p class="card-text text-muted flex-grow-1">${escapeHtml(excerpt)}</p>
        <p class="card-text"><small class="text-muted">Last updated ${updated}</small></p>
        <div class="d-flex gap-2 mt-2">
          <a href="../../../articles/displayer/article-displayer.html?id=${article.id}" class="btn btn-outline-secondary btn-sm">View</a>
          <a href="../../../articles/article-editor.html?id=${article.id}" class="btn btn-primary btn-sm">Edit</a>
          <button type="button" class="btn btn-outline-danger btn-sm delete-btn">Delete</button>
        </div>
      </div>
    </div>
  `;

  col.querySelector(".delete-btn").addEventListener("click", async () => {
    const sure = confirm(`Delete "${article.title}"? This can't be undone.`);
    if (!sure) return;
    try {
      await deleteArticle(article.id);
      col.remove();
    } catch (error) {
      alert("Couldn't delete: " + error.message);
    }
  });

  return col;
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

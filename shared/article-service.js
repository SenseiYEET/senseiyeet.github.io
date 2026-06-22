// ============================================================================
// Article data access layer
// ============================================================================
// All reading and writing of articles goes through these functions so the
// rest of the app never talks to Firebase directly. This replaces the old
// article-db.js, which always saved the same hardcoded fake article
// regardless of what was actually typed into the editor.
// ============================================================================

import { db, auth } from "./firebase-config.js";
import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// Local storage fallback key
const LOCAL_KEY = "ec_gamify_local_articles";

function readLocalArticlesMap() {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeLocalArticlesMap(map) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    // ignore storage failures
  }
}

function getLocalArticlesArray() {
  const map = readLocalArticlesMap();
  return Object.keys(map).map((k) => ({ id: k, ...map[k] }));
}

const DUMMY_ARTICLES = [
  {
    id: "dummy-1",
    title: "Building a Clean Game Loop in JavaScript",
    category: "Programming",
    externalUrl: "https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame",
    contentHtml:
      "<p>Learn how to structure a performant game loop, manage updates, and render frames smoothly in browser-based games.</p>",
    contentDelta: JSON.stringify({}),
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "dummy-2",
    title: "Designing Player Feedback That Feels Rewarding",
    category: "Design",
    externalUrl: "https://www.gamasutra.com/",
    contentHtml:
      "<p>Explore how to use audio, visuals, and progression systems to make every interaction in your game feel meaningful.</p>",
    contentDelta: JSON.stringify({}),
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "dummy-3",
    title: "Creating Expressive Character Art for Indie Games",
    category: "Art",
    externalUrl: "https://www.youtube.com/channel/UCfzlCWGWYyIQ0aLC5w48gBQ",
    contentHtml:
      "<p>Simple art routines and palette tips for creating memorable pixel art and concept visuals on a small team.</p>",
    contentDelta: JSON.stringify({}),
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "dummy-4",
    title: "Getting Started with Unity's Input System",
    category: "Engine: Unity",
    externalUrl: "https://unity.com/learn",
    contentHtml:
      "<p>Step through how to configure Unity's modern input package for controllers, keyboard, and touch controls.</p>",
    contentDelta: JSON.stringify({}),
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "dummy-5",
    title: "Best Practices for Audio Implementation in Indie Games",
    category: "Sound",
    externalUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API",
    contentHtml:
      "<p>Discover how to balance music, sound effects, and interface audio for a polished player experience.</p>",
    contentDelta: JSON.stringify({}),
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "dummy-6",
    title: "Using Color Theory to Guide Game UI Design",
    category: "Design",
    externalUrl: "https://www.smashingmagazine.com/",
    contentHtml:
      "<p>Learn how to choose palettes, contrast, and hierarchy so your game UI feels intuitive and visually consistent.</p>",
    contentDelta: JSON.stringify({}),
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

export function getDummyArticles() {
  return DUMMY_ARTICLES.map((article) => ({ ...article }));
}

/**
 * Creates a new article and returns its generated id.
 * @param {{title: string, contentDelta: object, contentHtml: string, category: string}} data
 */
export async function createArticle(data) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to publish an article.");

  const articlesRef = ref(db, "articles");
  const newArticleRef = push(articlesRef);

  const article = {
    title: data.title || "Untitled article",
    category: data.category || "Uncategorised",
    contentDelta: JSON.stringify(data.contentDelta || {}),
    contentHtml: data.contentHtml || "",
    authorId: user.uid,
    authorEmail: user.email || "Unknown",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await set(newArticleRef, article);
  return newArticleRef.key;
}

// Fallback-friendly create: tries DB first, falls back to localStorage on error
export async function createArticleWithFallback(data) {
  try {
    return await createArticle(data);
  } catch (err) {
    // create local article
    const user = auth.currentUser || { uid: "local", email: "Local" };
    const id = `local-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const article = {
      title: data.title || "Untitled article",
      category: data.category || "Uncategorised",
      contentDelta: JSON.stringify(data.contentDelta || {}),
      contentHtml: data.contentHtml || "",
      authorId: user.uid,
      authorEmail: user.email || "Local Storage",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const map = readLocalArticlesMap();
    map[id] = article;
    writeLocalArticlesMap(map);
    return id;
  }
}

/**
 * Updates an existing article. Only the original author should call this —
 * the database rules should also enforce this server-side (see
 * firebase-config.js for the recommended rules).
 */
export async function updateArticle(articleId, data) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to edit an article.");

  const updates = {
    title: data.title,
    category: data.category,
    contentDelta: JSON.stringify(data.contentDelta || {}),
    contentHtml: data.contentHtml || "",
    updatedAt: Date.now(),
  };

  await update(ref(db, `articles/${articleId}`), updates);
}

// Fallback-friendly update
export async function updateArticleWithFallback(articleId, data) {
  try {
    return await updateArticle(articleId, data);
  } catch (err) {
    const map = readLocalArticlesMap();
    if (map[articleId]) {
      map[articleId] = {
        ...map[articleId],
        title: data.title,
        category: data.category,
        contentDelta: JSON.stringify(data.contentDelta || {}),
        contentHtml: data.contentHtml || "",
        updatedAt: Date.now(),
      };
      writeLocalArticlesMap(map);
      return;
    }
    throw err; // not a local article, rethrow
  }
}

/**
 * Fetches a single article by id.
 */
export async function getArticle(articleId) {
  try {
    const snapshot = await get(ref(db, `articles/${articleId}`));
    if (snapshot.exists()) {
      return { id: articleId, ...snapshot.val() };
    }
  } catch (err) {
    // fall through to local
  }

  const map = readLocalArticlesMap();
  if (map[articleId]) return { id: articleId, ...map[articleId] };

  const dummy = DUMMY_ARTICLES.find((article) => article.id === articleId);
  return dummy ? { ...dummy } : null;
}

/**
 * Fetches all articles, newest first.
 */
export async function getAllArticles() {
  try {
    const articlesQuery = query(ref(db, "articles"), orderByChild("createdAt"));
    const snapshot = await get(articlesQuery);
    if (!snapshot.exists()) return [...getLocalArticlesArray(), ...getDummyArticles()];

    const articles = [];
    snapshot.forEach((child) => {
      articles.push({ id: child.key, ...child.val() });
    });

    const dbArticles = articles.reverse(); // newest first
    // merge local articles (local ones should appear before dummy but after DB newest)
    const local = getLocalArticlesArray().sort((a, b) => b.createdAt - a.createdAt);
    // avoid id collisions
    const ids = new Set(dbArticles.map((a) => a.id));
    const filteredLocal = local.filter((a) => !ids.has(a.id));
    return [...dbArticles, ...filteredLocal, ...getDummyArticles()];
  } catch (err) {
    // fallback to local + dummy
    const local = getLocalArticlesArray().sort((a, b) => b.createdAt - a.createdAt);
    return [...local, ...getDummyArticles()];
  }
}

/**
 * Fetches only the articles created by a given user (for "My Articles").
 */
export async function getArticlesByAuthor(authorId) {
  const all = await getAllArticles();
  return all.filter((a) => a.authorId === authorId);
}

/**
 * Deletes an article by id.
 */
export async function deleteArticle(articleId) {
  try {
    await remove(ref(db, `articles/${articleId}`));
  } catch (err) {
    const map = readLocalArticlesMap();
    if (map[articleId]) {
      delete map[articleId];
      writeLocalArticlesMap(map);
      return;
    }
    throw err;
  }
}

/**
 * Very simple client-side search across title + category + plain text content.
 * Fine for a small-to-medium article set; if the wiki grows large, swap this
 * out for a proper search index (e.g. Algolia or Elasticsearch) instead of
 * filtering every article in the browser.
 */
export function filterArticles(articles, queryText) {
  if (!queryText || !queryText.trim()) return articles;
  const needle = queryText.trim().toLowerCase();
  return articles.filter((a) => {
    const haystack = `${a.title || ""} ${a.category || ""} ${stripHtml(a.contentHtml || "")}`.toLowerCase();
    return haystack.includes(needle);
  });
}

function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

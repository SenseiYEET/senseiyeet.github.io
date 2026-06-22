// ============================================================================
// Local fallback data for the article search page
// ============================================================================
// This module has NO external dependencies (no Firebase) so it can never be
// the thing that fails. article-search.js imports this directly and uses it
// whenever the real shared/article-service.js can't be loaded.
//
// Keep this in sync with the DUMMY_ARTICLES list in shared/article-service.js
// if that list changes.
// ============================================================================

const DUMMY_ARTICLES = [
  {
    id: "dummy-1",
    title: "Building a Clean Game Loop in JavaScript",
    category: "Programming",
    contentHtml:
      "<p>Learn how to structure a performant game loop, manage updates, and render frames smoothly in browser-based games.</p>",
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "dummy-2",
    title: "Designing Player Feedback That Feels Rewarding",
    category: "Design",
    contentHtml:
      "<p>Explore how to use audio, visuals, and progression systems to make every interaction in your game feel meaningful.</p>",
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "dummy-3",
    title: "Creating Expressive Character Art for Indie Games",
    category: "Art",
    contentHtml:
      "<p>Simple art routines and palette tips for creating memorable pixel art and concept visuals on a small team.</p>",
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "dummy-4",
    title: "Getting Started with Unity's Input System",
    category: "Engine: Unity",
    contentHtml:
      "<p>Step through how to configure Unity's modern input package for controllers, keyboard, and touch controls.</p>",
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "dummy-5",
    title: "Best Practices for Audio Implementation in Indie Games",
    category: "Sound",
    contentHtml:
      "<p>Discover how to balance music, sound effects, and interface audio for a polished player experience.</p>",
    authorId: "dummy",
    authorEmail: "Gamify Team",
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "dummy-6",
    title: "Using Color Theory to Guide Game UI Design",
    category: "Design",
    contentHtml:
      "<p>Learn how to choose palettes, contrast, and hierarchy so your game UI feels intuitive and visually consistent.</p>",
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
 * Same simple client-side search as shared/article-service.js: matches
 * against title + category + plain-text content.
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

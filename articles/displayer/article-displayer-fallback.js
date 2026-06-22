// ============================================================================
// Local fallback data for the article displayer template
// ============================================================================
// No external dependencies (no Firebase) so it can never itself be the
// thing that fails. article-displayer.js uses this whenever the real
// shared/article-service.js can't be loaded (e.g. Firebase SDK unreachable).
//
// Keep this in sync with DUMMY_ARTICLES in shared/article-service.js and
// articles/js/article-search-fallback.js if that list changes.
// ============================================================================

const DUMMY_ARTICLES = [
  {
    id: "dummy-1",
    title: "Building a Clean Game Loop in JavaScript",
    category: "Programming",
    contentHtml:
      "<p>Learn how to structure a performant game loop, manage updates, and render frames smoothly in browser-based games.</p>" +
      "<p>A game loop is the heartbeat of any interactive application. At its simplest, it's a cycle that repeatedly processes input, updates game state, and renders a frame — over and over, many times per second.</p>" +
      "<p>In the browser, <code>requestAnimationFrame</code> is the right tool for this: it syncs your loop to the display's refresh rate and pauses automatically when the tab isn't visible, saving battery and CPU.</p>" +
      "<p>To keep updates consistent regardless of frame rate, track the time elapsed since the last frame (delta time) and use it to scale movement and physics calculations. This prevents your game from running differently on a 60Hz monitor versus a 144Hz one.</p>",
    authorEmail: "Gamify Team",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
  },
  {
    id: "dummy-2",
    title: "Designing Player Feedback That Feels Rewarding",
    category: "Design",
    contentHtml:
      "<p>Explore how to use audio, visuals, and progression systems to make every interaction in your game feel meaningful.</p>" +
      "<p>Good feedback tells the player, instantly and unambiguously, what just happened as a result of their action. A satisfying hit needs a sound, a flash, a screen shake — something that registers in under a tenth of a second.</p>" +
      "<p>Layer your feedback: small actions get small cues, big achievements get bigger, more elaborate ones. This creates a sense of escalation and keeps minor feedback from feeling exhausting over a long play session.</p>" +
      "<p>Don't underestimate restraint — feedback that's always maximal stops feeling special. Save your biggest effects for the moments that matter most.</p>",
    authorEmail: "Gamify Team",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
  {
    id: "dummy-3",
    title: "Creating Expressive Character Art for Indie Games",
    category: "Art",
    contentHtml:
      "<p>Simple art routines and palette tips for creating memorable pixel art and concept visuals on a small team.</p>" +
      "<p>Limited time and a small team don't have to mean limited expressiveness. A tight, well-chosen color palette can do more for visual identity than a huge sprite sheet ever will.</p>" +
      "<p>Silhouette is king: if a character reads clearly as a flat black shape, the details you add on top will only make it stronger. Test your designs this way before refining them further.</p>" +
      "<p>Reuse base rigs and proportions across characters where you can — consistency reads as intentional style, not as a shortcut, when it's applied thoughtfully.</p>",
    authorEmail: "Gamify Team",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
  },
  {
    id: "dummy-4",
    title: "Getting Started with Unity's Input System",
    category: "Engine: Unity",
    contentHtml:
      "<p>Step through how to configure Unity's modern input package for controllers, keyboard, and touch controls.</p>" +
      "<p>Unity's Input System package replaces the old Input Manager with a more flexible, action-based model. Instead of polling raw keys, you define abstract \"actions\" like Jump or Move, then bind whatever physical inputs you like to them.</p>" +
      "<p>This separation makes supporting multiple control schemes — keyboard and mouse, gamepad, touch — much simpler, since your gameplay code only ever talks to the action, never the specific device.</p>" +
      "<p>Use Input Action Assets to keep all your bindings organized in one place, and take advantage of control schemes to let players (or your game) swap input devices on the fly.</p>",
    authorEmail: "Gamify Team",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "dummy-5",
    title: "Best Practices for Audio Implementation in Indie Games",
    category: "Sound",
    contentHtml:
      "<p>Discover how to balance music, sound effects, and interface audio for a polished player experience.</p>" +
      "<p>Mix your audio in layers: music, ambient sound, sound effects, and UI feedback should each occupy their own loudness range so nothing gets buried during intense moments.</p>" +
      "<p>Vary repeated sound effects slightly in pitch and volume — even a tiny random offset stops a frequently-triggered sound, like a footstep or a gunshot, from becoming grating over a long session.</p>" +
      "<p>Always give players independent volume sliders for music, effects, and dialogue. It's a small addition that goes a long way for accessibility and personal comfort.</p>",
    authorEmail: "Gamify Team",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
  {
    id: "dummy-6",
    title: "Using Color Theory to Guide Game UI Design",
    category: "Design",
    contentHtml:
      "<p>Learn how to choose palettes, contrast, and hierarchy so your game UI feels intuitive and visually consistent.</p>" +
      "<p>Color is one of the fastest ways to communicate meaning: reserve red consistently for danger or damage, green for success or healing, and don't dilute those associations elsewhere in your UI.</p>" +
      "<p>Contrast drives hierarchy. The most important element on screen — a health bar, a critical warning — should have the highest contrast against its background, while secondary information can recede.</p>" +
      "<p>Test your palette in grayscale. If you can still tell every element apart by contrast alone, your design will hold up for colorblind players too.</p>",
    authorEmail: "Gamify Team",
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 1,
  },
];

export function getDummyArticle(articleId) {
  const dummy = DUMMY_ARTICLES.find((article) => article.id === articleId);
  return dummy ? { ...dummy } : null;
}

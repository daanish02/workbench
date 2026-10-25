// Chat settings, shared by the panel (browser) and the chat scripts (scripts/chat-*.mjs), so evals test what ships.
// The prompt text is in src/prompts/, the suggestion chips in chat-suggestions.ts.
/** answer models offered in the panel: `label` is what the UI shows, `effort` is pinned (reasoning effort sent to OpenRouter) */
export const CHAT_MODELS = [
  { key: 'deepseek', label: 'DeepSeek 4.1', id: 'deepseek/deepseek-v4.1-flash-1017', effort: 'low' },
  { key: 'haiku', label: 'Haiku 5.5', id: 'anthropic/claude-haiku-5.5', effort: 'low' },
] as const;
/** the default: first in the list */
export const CHAT_MODEL = CHAT_MODELS[0].id;
export const EMBED_MODEL = 'openai/text-embedding-3-small';
/** text-embedding-3 vectors cut to their first dims and renormalised */
export const DIMS = 512;
/** sections sent to the model */
export const TOP = 6;
/** top similarity below this means the notes do not cover the question: no model call (scripts/chat-redteam.mjs) */
export const GATE = 0.2;
export const MAX_QUESTION = 500;
/** earlier messages kept for follow-up questions */
export const HISTORY_TURNS = 3;
/** characters per second the answer is revealed at; the model writes faster than anyone reads */
export const REVEAL_CPS = 220;
/** PBKDF2-SHA256 rounds that turn the password into the key that unlocks the shared OpenRouter key */
export const KEY_ITERS = 600_000;
/** limits for the shared key only (a reader's own key is their own budget); client-side, so a courtesy not a guarantee */
export const SHARED_COOLDOWN_MS = 4000;
export const SHARED_DAILY_CAP = 40;

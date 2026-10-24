// Seals the shared OpenRouter key under the chat password: public/chat/key.json holds only ciphertext.
//   bun scripts/chat-key.mjs        needs OPENROUTER_KEY and CHAT_PASSWORD (.env.local locally, repo secrets in CI)
// PBKDF2-SHA256 turns the password into an AES-GCM key. The panel (chat-client.ts) does the same steps to unlock.
// Anyone with the password can recover the key, and the file can be guessed against offline, so use a long random password.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { webcrypto as crypto } from 'node:crypto';
import { KEY_ITERS } from '../src/data/chat-config.ts';

const b64 = (bytes) => Buffer.from(bytes).toString('base64');

export async function seal(key, password, iters = KEY_ITERS) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const aes = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iters, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aes, new TextEncoder().encode(key));
  return { v: 1, iters, salt: b64(salt), iv: b64(iv), ct: b64(new Uint8Array(ct)) };
}

if (import.meta.main) {
  // a secret pasted into GitHub often carries a trailing newline or space; the reader never types one, so drop it
  const key = process.env.OPENROUTER_KEY?.trim();
  const password = process.env.CHAT_PASSWORD?.trim();
  if (!key || !password) {
    console.log('OPENROUTER_KEY or CHAT_PASSWORD is not set: password unlock stays off (no key.json written).');
    process.exit(0);
  }
  // a short password usually means a .env parser cut it at a "#" or expanded a "$": quote the value, CHAT_PASSWORD='...'
  if (password.length < 12) {
    console.error(`CHAT_PASSWORD is only ${password.length} characters. Refusing to seal the key with it.\nIn .env.local wrap the value in single quotes: CHAT_PASSWORD='...'`);
    process.exit(1);
  }
  const dir = resolve(import.meta.dirname, '..', 'public', 'chat');
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/key.json`, JSON.stringify(await seal(key, password)));
  // lengths only, never the values: compare the password length with the one you chose
  console.log(`wrote public/chat/key.json (password ${password.length} characters, key ${key.length} characters)`);
}

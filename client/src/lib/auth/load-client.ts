/** `crypto.randomUUID` only exists in secure contexts (https or localhost). Neon's client calls it while loading, which would crash pages opened over a plain-http LAN address. */
function ensureRandomUUID() {
  if (typeof crypto === 'undefined' || typeof crypto.randomUUID === 'function') return;
  Object.defineProperty(crypto, 'randomUUID', {
    configurable: true,
    value: () => '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c => (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16)) as `${string}-${string}-${string}-${string}-${string}`,
  });
}

/** Load the Neon Auth browser client only when needed (Google button), after the polyfill. */
export async function loadNeonAuthClient() {
  ensureRandomUUID();
  return (await import('./client')).neonAuthClient;
}

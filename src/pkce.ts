// src/pkce.ts
function base64URLEncode(str: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function generatePKCE() {
  const verifier = base64URLEncode(crypto.getRandomValues(new Uint8Array(32)));
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  const challenge = base64URLEncode(digest);
  return { verifier, challenge };
}


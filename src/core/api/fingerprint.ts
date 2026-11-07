/**
 * Client Browser Fingerprint Generator
 * Generates privacy-preserving SHA-256 hash from browser characteristics
 * Used for session hijacking protection (X-Fingerprint header)
 */

async function sha256(message: string): Promise<string> {
  // Use crypto.subtle if available in browser
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Simple fallback hash if crypto.subtle is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback-${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

export async function generateFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'ssr-environment-fingerprint';
  }

  try {
    const components: string[] = [
      navigator.userAgent || '',
      navigator.language || '',
      (navigator as any).platform || '',
      `${window.screen?.width || 0}x${window.screen?.height || 0}x${window.screen?.colorDepth || 0}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      String(navigator.hardwareConcurrency || 2),
      String((navigator as any).deviceMemory || 4),
    ];

    // Optional canvas fingerprinting snippet
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#0f172a';
        ctx.fillText('Al-Adalah Security', 2, 2);
        components.push(canvas.toDataURL().slice(-50));
      }
    } catch {
      // Ignore canvas errors
    }

    const rawString = components.join('###');
    return await sha256(rawString);
  } catch (err) {
    console.warn('[Fingerprint] Error generating browser fingerprint:', err);
    return 'fallback-fingerprint-node';
  }
}

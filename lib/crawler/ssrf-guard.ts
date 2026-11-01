import dns from 'dns/promises';
import { URL } from 'url';

/**
 * Anti-SSRF Guard
 * Validates URLs and destination IP addresses to prevent SSRF, DNS rebinding,
 * loopback access, and access to internal cloud metadata endpoints.
 */

const BLOCKED_IPV4_RANGES = [
  /^127\./,                         // Loopback (127.0.0.0/8)
  /^10\./,                          // Private class A (10.0.0.0/8)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private class B (172.16.0.0/12)
  /^192\.168\./,                    // Private class C (192.168.0.0/16)
  /^169\.254\./,                    // Link-local / Cloud metadata (169.254.0.0/16)
  /^0\./,                           // Current network
  /^224\./,                         // Multicast (224.0.0.0/4)
  /^240\./,                         // Reserved
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
];

export interface SsrfValidationResult {
  isValid: boolean;
  normalizedUrl?: string;
  ipAddress?: string;
  error?: string;
}

export async function validateUrlForSsrf(inputUrl: string): Promise<SsrfValidationResult> {
  try {
    let parsed: URL;
    try {
      parsed = new URL(inputUrl.trim());
    } catch {
      return { isValid: false, error: 'Invalid URL format.' };
    }

    // 1. Enforce allowed schemes: http and https only
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: `Disallowed protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.` };
    }

    // 2. Enforce standard ports: 80 and 443 only (or default for scheme)
    const port = parsed.port ? parseInt(parsed.port, 10) : (parsed.protocol === 'https:' ? 443 : 80);
    if (port !== 80 && port !== 443) {
      return { isValid: false, error: `Disallowed port: ${port}. Only standard HTTP/HTTPS ports (80, 443) are allowed.` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 3. Block known loopback and internal cloud hostnames
    if (BLOCKED_HOSTNAMES.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { isValid: false, error: `Access to internal or local hostname "${hostname}" is blocked.` };
    }

    // 4. Resolve DNS and inspect resolved IP address
    let resolvedIp: string;
    try {
      const lookup = await dns.lookup(hostname, { all: false });
      resolvedIp = lookup.address;
    } catch (dnsErr: any) {
      return { isValid: false, error: `Failed to resolve hostname "${hostname}": ${dnsErr.message || 'DNS resolution failed'}` };
    }

    // 5. Check IPv6 loopback and private ranges
    if (resolvedIp === '::1' || resolvedIp.startsWith('fc00:') || resolvedIp.startsWith('fd00:') || resolvedIp.startsWith('fe80:')) {
      return { isValid: false, error: `Access to private IPv6 address "${resolvedIp}" is blocked.` };
    }

    // 6. Check IPv4 blocked ranges
    for (const pattern of BLOCKED_IPV4_RANGES) {
      if (pattern.test(resolvedIp)) {
        return { isValid: false, error: `Access to private or link-local IP "${resolvedIp}" is blocked.` };
      }
    }

    return {
      isValid: true,
      normalizedUrl: parsed.origin + parsed.pathname + parsed.search,
      ipAddress: resolvedIp,
    };
  } catch (err: any) {
    return { isValid: false, error: err.message || 'SSRF validation failed unexpectedly.' };
  }
}

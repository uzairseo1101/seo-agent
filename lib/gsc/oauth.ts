import crypto from 'crypto';

const GSC_READONLY_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';

// In-memory CSRF state cache (with 10-minute TTL)
const stateStore = new Map<string, { createdAt: number; organizationId: string }>();

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp ms
  scope: string;
}

export function isGoogleOAuthConfigured(): boolean {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return Boolean(clientId && clientSecret && !clientId.includes('your-google-client-id'));
}

export function generateAuthUrl(organizationId: string, redirectUri: string): { url: string; state: string } {
  const state = crypto.randomBytes(24).toString('hex');
  stateStore.set(state, { createdAt: Date.now(), organizationId });

  if (!isGoogleOAuthConfigured()) {
    // Development Mock OAuth mode
    const mockCallbackUrl = new URL(redirectUri);
    mockCallbackUrl.searchParams.set('state', state);
    mockCallbackUrl.searchParams.set('code', 'mock_auth_code_dev');
    return { url: mockCallbackUrl.toString(), state };
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const authUrl = new URL(GOOGLE_AUTH_ENDPOINT);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', GSC_READONLY_SCOPE);
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  return { url: authUrl.toString(), state };
}

export function validateState(state: string): boolean {
  const record = stateStore.get(state);
  if (!record) return false;

  // Enforce 10-minute expiry
  const isValid = Date.now() - record.createdAt < 10 * 60 * 1000;
  stateStore.delete(state);
  return isValid;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<OAuthTokens> {
  if (code === 'mock_auth_code_dev' || !isGoogleOAuthConfigured()) {
    // Return safe development mock tokens
    return {
      accessToken: `mock_gsc_token_${Date.now()}`,
      refreshToken: `mock_gsc_refresh_${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000,
      scope: GSC_READONLY_SCOPE,
    };
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
    scope: data.scope || GSC_READONLY_SCOPE,
  };
}

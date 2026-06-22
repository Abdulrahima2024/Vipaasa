export function signInWithGoogle() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.error('Google client ID not set');
    return;
  }
  const redirectUri = `${window.location.origin}/api/auth/google/callback`;
  const scope = encodeURIComponent('email profile openid');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token&scope=${scope}&prompt=select_account`;
  window.location.href = authUrl;
}

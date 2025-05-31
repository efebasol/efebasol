export default function handler(req, res) {
  const clientId = process.env.KICK_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;

  const authorizeUrl = `https://kick.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=chat:write%20user:read`;

  res.redirect(authorizeUrl);
}
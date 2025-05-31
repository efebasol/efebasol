import dotenv from 'dotenv';
dotenv.config();

export async function handler(req, res) {
  const clientId = process.env.KICK_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI;
  const scope = 'chat:write user:read moderation:write moderation:read';

  const authorizeUrl = `https://kick.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

  res.writeHead(302, { Location: authorizeUrl });
  res.end();
}
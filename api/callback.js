import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const code = url.searchParams.get('code');

  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!code) {
    res.writeHead(400);
    res.end("Authorization code missing");
    return;
  }

  // asdf
  try {
    const tokenResponse = await axios.post(
      'https://kick.com/oauth/token',
      {
        grant_type: 'authorization_code',
        code: code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const tokenData = tokenResponse.data;
    console.log('✅ Access Token:', tokenData.access_token);
    console.log('✅ Refresh Token:', tokenData.refresh_token);
    console.log('✅ Expires in:', tokenData.expires_in);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      ✅ Access Token: ${tokenData.access_token}<br/>
      ✅ Refresh Token: ${tokenData.refresh_token}<br/>
      ✅ Expires in: ${tokenData.expires_in} seconds
    `);
  } catch (err) {
    console.error(err.response?.data || err);
    res.writeHead(500);
    res.end("Token exchange failed");
  }
}
import axios from 'axios';

export default async function handler(req, res) {
  const code = req.query.code;
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;
  const redirectUri = process.env.REDIRECT_URI;

  if (!code) {
    res.status(400).send("Authorization code missing");
    return;
  }

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
    
    // 🔥 İşte burası helper kısım:
    console.log('✅ Access Token:', tokenData.access_token);
    console.log('✅ Refresh Token:', tokenData.refresh_token);
    console.log('✅ Expires in:', tokenData.expires_in);

    res.status(200).send(`
      ✅ Access Token: ${tokenData.access_token} <br/>
      ✅ Refresh Token: ${tokenData.refresh_token} <br/>
      ✅ Expires in: ${tokenData.expires_in} seconds
    `);
    
  } catch (err) {
    console.error(err.response?.data || err);
    res.status(500).send("Token exchange failed");
  }
}

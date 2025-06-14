import http from 'http';
import axios from 'axios';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import { handler as loginHandler } from './login.js';
import { handler as callbackHandler } from './callback.js';

dotenv.config();

// Dummy HTTP server to keep Railway happy
http.createServer((req, res) => {
  if (req.url.startsWith('/api/login')) {
    loginHandler(req, res);
  } else if (req.url.startsWith('/api/callback')) {
    callbackHandler(req, res);
  } else {
    res.writeHead(200);
    res.end("Kick Bot running!");
  }
}).listen(process.env.PORT || 3000);

// WebSocket Chat Bot
const username = process.env.USERNAME;
const oauthToken = process.env.OAUTH_TOKEN;

async function getChannelId(username) {
  const response = await axios.get(`https://kick.com/api/v2/users/${username}`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Kick Bot)',
      'Accept': 'application/json'
    }
  });
  return response.data.id;
}

async function start() {
  if (!username || !oauthToken) {
    console.log("USERNAME veya OAUTH_TOKEN eksik, sadece OAuth aktif.");
    return;
  }

  const channelId = await getChannelId(username);
  console.log(`Channel ID: ${channelId}`);

  const ws = new WebSocket('wss://chat.kick.com');

  ws.on('open', () => {
    console.log('WebSocket bağlantısı açıldı');

    const subscribeMessage = {
      event: 'pusher:subscribe',
      data: {
        channel: `chatrooms.${channelId}.v2`
      }
    };

    ws.send(JSON.stringify(subscribeMessage));
  });

  ws.on('message', async (data) => {
    const parsed = JSON.parse(data);

    if (parsed.event === 'message') {
      const messageData = JSON.parse(parsed.data);
      console.log(`[${messageData.sender.username}] ${messageData.content}`);

      if (messageData.content.trim().toLowerCase() === '!selam') {
        await sendMessage(channelId, "Selam, hoşgeldin!");
      }
    }
  });

  ws.on('close', () => {
    console.log('WebSocket kapandı');
  });

  ws.on('error', (error) => {
    console.error('WebSocket hatası:', error);
  });
}

async function sendMessage(channelId, message) {
  try {
    const response = await axios.post(
      `https://kick.com/api/v2/chat/${channelId}/messages`,
      { message: message },
      {
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Mesaj gönderildi:", message);
  } catch (error) {
    console.error("Mesaj gönderme hatası:", error.response?.data || error);
  }
}

start();
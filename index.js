import axios from 'axios';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const username = process.env.USERNAME;
const oauthToken = process.env.OAUTH_TOKEN;

async function getChannelId(username) {
  const response = await axios.get(`https://kick.com/api/v2/users/${username}`);
  return response.data.id;
}

async function start() {
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

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { saveMessage, getFriendlySenderName } = require('../services/messageService');
require('dotenv').config();

// Función para obtener el nombre del remitente
async function getSenderName(senderId) {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/${senderId}`,
      {
        params: {
          fields: 'name',
          access_token: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
        }
      }
    );
    return response.data.name;
  } catch (e) {
    return null;
  }
}

// ── Verificación ──────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook de Facebook/Instagram verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── Recepción de mensajes ─────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const body = req.body;

  if (body.object !== 'page' && body.object !== 'instagram') return res.sendStatus(404);

  body.entry?.forEach(entry => {
    entry.messaging?.forEach(async (event) => {
      if (!event.message || event.message.is_echo) return;

      const platform = body.object === 'instagram' ? 'instagram' : 'facebook';
      const sender_name = await getSenderName(event.sender.id);

      saveMessage({
        platform,
        sender_id:   event.sender.id,
        sender_name: getFriendlySenderName(platform, event.sender.id),
        content:     event.message.text || '[mensaje sin texto]'
      });
    });
  });

  res.sendStatus(200);
});

module.exports = router;
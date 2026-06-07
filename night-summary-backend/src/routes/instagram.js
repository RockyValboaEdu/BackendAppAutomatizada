const express = require('express');
const router = express.Router();
const { saveMessage, getFriendlySenderName } = require('../services/messageService');
require('dotenv').config();

// ── Verificación ──────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log('✅ Webhook de Instagram verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── Recepción de mensajes ─────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const body = req.body;

  if (body.object !== 'instagram' && body.object !== 'page') return res.sendStatus(404);

  entry.messaging?.forEach(async (event) => {
  if (!event.message || event.message.is_echo) return;

  await saveMessage({
    platform:    'instagram',
    sender_id:   event.sender.id,
    sender_name: getFriendlySenderName('instagram', event.sender.id),
    content:     event.message.text || '[mensaje sin texto]'
  });
});

  res.sendStatus(200);
});

module.exports = router;
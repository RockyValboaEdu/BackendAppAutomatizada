const express = require('express');
const router = express.Router();
const { saveMessage } = require('../services/messageService');
require('dotenv').config();

// ── Verificación del webhook ──────────────────────────────────────────────────
// Meta llama esta ruta UNA SOLA VEZ cuando registras el webhook en su panel.
// Básicamente te pregunta "¿eres tú el dueño de este servidor?"
router.get('/', (req, res) => {
  const mode      = req.query['hub.mode'];
  const token     = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Si el token coincide con tu .env, respondes con el challenge (Meta lo exige)
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook de WhatsApp verificado');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ── Recepción de mensajes ─────────────────────────────────────────────────────
// Meta llama esta ruta cada vez que alguien te escribe
router.post('/', (req, res) => {
  const body = req.body;

  // Verificamos que sea un evento de WhatsApp Business
  if (body.object !== 'whatsapp_business_account') return res.sendStatus(404);

  body.entry?.forEach(entry => {
    entry.changes?.forEach(change => {
      const messages = change.value?.messages;
      const contacts = change.value?.contacts;

      messages?.forEach(msg => {
        // Solo procesamos mensajes de texto por ahora
        if (msg.type !== 'text') return;

        const sender_name = contacts?.find(c => c.wa_id === msg.from)?.profile?.name;

        saveMessage({
          platform:    'whatsapp',
          sender_id:   msg.from,        // Número de teléfono
          sender_name: sender_name || msg.from,
          content:     msg.text.body    // Texto del mensaje
        });
      });
    });
  });

  // Meta exige que respondas 200 rápido, si no reintenta el envío
  res.sendStatus(200);
});

module.exports = router;
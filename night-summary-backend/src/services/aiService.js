// src/services/aiService.js
const axios = require('axios');
require('dotenv').config();

async function summarizeMessages(messages) {
  // Agrupa los mensajes por plataforma para el prompt
  const grouped = messages.reduce((acc, msg) => {
    if (!acc[msg.platform]) acc[msg.platform] = [];
    acc[msg.platform].push(
      `- ${msg.sender_name || msg.sender_id}: "${msg.content}"`
    );
    return acc;
  }, {});

  // Construye el texto con todos los mensajes
  let messagesText = '';
  for (const [platform, msgs] of Object.entries(grouped)) {
    messagesText += `\n**${platform.toUpperCase()}**\n${msgs.join('\n')}\n`;
  }

  const prompt = `
Eres un asistente personal. Recibí estos mensajes durante la noche.
Hazme un resumen claro y organizado por plataforma.
Para cada mensaje importante, indica quién lo envió y de qué trata.
Si hay mensajes urgentes o que requieren respuesta, márcalos con ⚠️.

Mensajes recibidos:
${messagesText}

Responde en español, de forma concisa y útil.
  `;

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        // Modelo gratuito — puedes cambiarlo por cualquier otro gratuito de OpenRouter
        model: 'google/gemma-4-31b-it:free',
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', // Requerido por OpenRouter
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error con OpenRouter:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { summarizeMessages };
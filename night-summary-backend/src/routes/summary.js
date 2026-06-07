// Esta es la ruta que consultará tu app Android cada mañana
const express = require('express');
const router = express.Router();
const { getLatestSummary, getPendingNightMessages } = require('../services/messageService');
const { summarizeMessages } = require('../services/aiService');
const db = require('../db/database');

// GET /api/summary → devuelve el resumen más reciente
router.get('/', (req, res) => {
  const summary = getLatestSummary();

  if (!summary) {
    return res.json({ summary: null, message: 'No hay resumen disponible aún.' });
  }

  res.json({
    date:    summary.date,
    content: summary.content
  });
});

// POST /api/summary/generate → genera el resumen manualmente (útil para pruebas)
router.post('/generate', async (req, res) => {
  const messages = getPendingNightMessages();

  if (messages.length === 0) {
    return res.json({ message: 'No hay mensajes nocturnos pendientes.' });
  }

  try {
    const { saveSummary, markAsSummarized } = require('../services/messageService');
    const summary = await summarizeMessages(messages);
    saveSummary(summary);
    markAsSummarized(messages.map(m => m.id));
    res.json({ message: '✅ Resumen generado', summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/summary/force → genera resumen con TODOS los mensajes no resumidos
router.post('/force', async (req, res) => {
  const { getPendingAllMessages, saveSummary, markAsSummarized } = require('../services/messageService');
  const messages = await getPendingAllMessages();

  if (messages.length === 0) {
    return res.json({ message: 'No hay mensajes pendientes.' });
  }

  try {
    const summary = await summarizeMessages(messages);
    await saveSummary(summary);
    await markAsSummarized(messages.map(m => m.id));
    res.json({ message: '✅ Resumen generado', summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
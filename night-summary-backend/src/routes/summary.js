// Esta es la ruta que consultará tu app Android cada mañana
const express = require('express');
const router = express.Router();
const { getLatestSummary, getPendingNightMessages } = require('../services/messageService');
const { summarizeMessages } = require('../services/aiService');

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

module.exports = router;
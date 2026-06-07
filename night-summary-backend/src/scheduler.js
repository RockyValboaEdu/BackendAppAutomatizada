// src/scheduler.js
const cron = require('node-cron');
const { getPendingNightMessages, markAsSummarized, saveSummary } = require('./services/messageService');
const { summarizeMessages } = require('./services/aiService');

// Se ejecuta todos los días a las 6:30am
cron.schedule('30 6 * * *', async () => {
  console.log('⏰ Generando resumen nocturno...');

  const messages = getPendingNightMessages();

  if (messages.length === 0) {
    console.log('No hay mensajes nocturnos pendientes.');
    return;
  }

  try {
    const summary = await summarizeMessages(messages);
    saveSummary(summary);
    markAsSummarized(messages.map(m => m.id));
    console.log(`✅ Resumen generado con ${messages.length} mensajes.`);
  } catch (err) {
    console.error('❌ Error generando resumen:', err.message);
  }
}, {
  timezone: 'America/Bogota' // Tu zona horaria
});
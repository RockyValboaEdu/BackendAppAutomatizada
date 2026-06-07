require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./src/scheduler');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/webhook/whatsapp',  require('./src/routes/whatsapp'));
app.use('/webhook/facebook',  require('./src/routes/facebook'));
app.use('/api/summary',       require('./src/routes/summary'));
app.use('/webhook/instagram', require('./src/routes/instagram'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
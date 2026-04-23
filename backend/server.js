const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');

// Modular Imports
const { Order, Call } = require('./lib/storage');
const { handleIncomingCall } = require('./api/voice/incoming');
const { handleGather } = require('./api/voice/gather');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection for Dashboard updates
wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  ws.send(JSON.stringify({ type: 'STATUS', message: 'Connected to Voice AI Backend' }));
});

function broadcastToDashboard(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// --- Routes ---

// 1. Twilio Call Webhook
app.post('/api/voice/incoming', (req, res) => {
  handleIncomingCall(req, res, broadcastToDashboard);
});

// 2. Handle Speech from Gather
app.post('/api/voice/gather', (req, res) => {
  handleGather(req, res, broadcastToDashboard);
});

// 3. API Endpoints for Dashboard
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/calls', async (req, res) => {
  try {
    const calls = await Call.find().sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Simulation Endpoint
app.post('/api/simulate-call', async (req, res) => {
  const mockSid = 'SIM_' + Math.random().toString(36).substr(2, 9);
  const mockFrom = '+970599123456';

  broadcastToDashboard({ type: 'CALL_START', from: mockFrom, sid: mockSid });

  setTimeout(() => {
    broadcastToDashboard({ type: 'TRANSCRIPTION', text: 'مرحبا، بدي أطلب ساندويش شاورما دجاج وكولا', sid: mockSid });
    broadcastToDashboard({ type: 'EMOTION', level: 'happy', sid: mockSid });
  }, 2000);

  setTimeout(() => {
    broadcastToDashboard({ type: 'AI_RESPONSE', text: 'تكرم! أحلى ساندويش شاورما وكولا لعيونك. بدك نضيف لك بطاطا مجانية؟', sid: mockSid });
  }, 4000);

  setTimeout(() => {
    broadcastToDashboard({ type: 'TRANSCRIPTION', text: 'آه يا ريت، يسلمو كثير! كم الحساب؟', sid: mockSid });
  }, 7000);

  setTimeout(() => {
    broadcastToDashboard({ type: 'AI_RESPONSE', text: 'المجموع 25 شيكل، الطلب بوصلك خلال 30 دقيقة. صحتين وعافية!', sid: mockSid });
    broadcastToDashboard({ type: 'NEW_ORDER', from: mockFrom });
  }, 9000);

  res.json({ message: 'Simulation started' });
});

app.get('/status', (req, res) => {
  res.json({ status: 'online', version: '2.0.0' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

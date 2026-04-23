const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Modular Imports
const { Restaurant, Order, Call } = require('./lib/storage');
const { handleIncomingCall } = require('./api/voice/incoming');
const { handleGather } = require('./api/voice/gather');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-zeina';

// --- WebSocket Setup ---
wss.on('connection', (ws) => {
  console.log('Dashboard connected');
  ws.send(JSON.stringify({ type: 'STATUS', message: 'Connected to Zeina AI Backend' }));
});

function broadcastToDashboard(data, restaurantId) {
  wss.clients.forEach((client) => {
    // Only send to the correct restaurant's dashboard
    if (client.readyState === WebSocket.OPEN && client.restaurantId === restaurantId.toString()) {
      client.send(JSON.stringify(data));
    }
  });
}

// --- Middleware ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const restaurant = await Restaurant.create({ name, email, password: hashedPassword });
    console.log(`New Restaurant registered: ${name}`);
    res.json({ message: 'Restaurant registered successfully' });
  } catch (err) {
    console.error('Registration Error:', err);
    if (err.code === 11000) return res.status(400).json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' });
    res.status(500).json({ error: 'فشل في الاتصال بقاعدة البيانات. تأكد من تشغيل MongoDB' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant || !(await bcrypt.compare(password, restaurant.password))) {
      console.log(`Failed login attempt for: ${email}`);
      return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ id: restaurant._id, name: restaurant.name }, JWT_SECRET, { expiresIn: '1d' });
    console.log(`User logged in: ${restaurant.name}`);
    res.json({ token, restaurant: { id: restaurant._id, name: restaurant.name } });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'خطأ فني في السيرفر' });
  }
});

// --- Voice Routes (Public but need restaurant identification) ---
// Note: In production, Twilio would pass the restaurant ID in the URL, e.g., /api/voice/incoming/:restaurantId
app.post('/api/voice/incoming/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  handleIncomingCall(req, res, (data) => broadcastToDashboard(data, restaurantId));
});

app.post('/api/voice/gather/:restaurantId', (req, res) => {
  const restaurantId = req.params.restaurantId;
  handleGather(req, res, (data) => broadcastToDashboard(data, restaurantId));
});

// --- Protected Data Routes ---
app.get('/api/orders', authenticate, async (req, res) => {
  const orders = await Order.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
});

app.get('/api/calls', authenticate, async (req, res) => {
  const calls = await Call.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });
  res.json(calls);
});

// Simulation (Modified for multi-tenancy)
app.post('/api/simulate-call', authenticate, async (req, res) => {
  const restaurantId = req.user.id;
  const mockSid = 'SIM_' + Math.random().toString(36).substr(2, 9);
  const mockFrom = '+970599123456';

  broadcastToDashboard({ type: 'CALL_START', from: mockFrom, sid: mockSid }, restaurantId);

  setTimeout(() => {
    broadcastToDashboard({ type: 'TRANSCRIPTION', text: 'مرحبا، بدي أطلب ساندويش شاورما دجاج وكولا', sid: mockSid }, restaurantId);
    broadcastToDashboard({ type: 'EMOTION', level: 'happy', sid: mockSid }, restaurantId);
  }, 2000);

  setTimeout(() => {
    broadcastToDashboard({ type: 'AI_RESPONSE', text: 'تكرم! أحلى ساندويش شاورما وكولا لعيونك. بدك نضيف لك بطاطا مجانية؟', sid: mockSid }, restaurantId);
  }, 4000);

  setTimeout(() => {
    broadcastToDashboard({ type: 'TRANSCRIPTION', text: 'آه يا ريت، يسلمو كثير! كم الحساب؟', sid: mockSid }, restaurantId);
  }, 7000);

  setTimeout(() => {
    broadcastToDashboard({ type: 'AI_RESPONSE', text: 'المجموع 25 شيكل، الطلب بوصلك خلال 30 دقيقة. صحتين وعافية!', sid: mockSid }, restaurantId);
    broadcastToDashboard({ type: 'NEW_ORDER', from: mockFrom }, restaurantId);
    
    // Save to DB
    Order.create({
      restaurantId: restaurantId,
      customerPhone: mockFrom,
      items: ['ساندويش شاورما', 'كولا'],
      totalPrice: 25,
      status: 'pending',
      emotion: 'happy'
    });
  }, 9000);

  res.json({ message: 'Simulation started' });
});

app.get('/status', (req, res) => {
  res.json({ status: 'online', version: '3.0.0' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

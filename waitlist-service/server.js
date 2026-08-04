require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const NOTIFY_TO = process.env.NOTIFY_TO;
const MAIL_FROM = process.env.MAIL_FROM || process.env.SMTP_USER;
const DATA_FILE = path.join(__dirname, 'waitlist.jsonl');

if (!NOTIFY_TO) {
  console.error('Missing NOTIFY_TO in environment (who should receive signup notifications).');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // Without these, a blocked/unreachable SMTP port hangs on nodemailer's own long
  // defaults — well past nginx's proxy_read_timeout, so the client just sees a dead
  // request instead of the actual error.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function loadKnownEmails() {
  if (!fs.existsSync(DATA_FILE)) return new Set();
  const lines = fs.readFileSync(DATA_FILE, 'utf8').split('\n').filter(Boolean);
  const emails = new Set();
  for (const line of lines) {
    try { emails.add(JSON.parse(line).email); } catch {}
  }
  return emails;
}

function appendSignup(email) {
  const entry = { email, at: new Date().toISOString() };
  fs.appendFileSync(DATA_FILE, JSON.stringify(entry) + '\n');
}

// Simple in-memory sliding-window rate limit per IP: 5 requests / 10 minutes.
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(ip, timestamps);
  return timestamps.length > 5;
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/waitlist', async (req, res) => {
  const ip = req.ip;
  if (rateLimited(ip)) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Try again later.' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
  }

  const known = loadKnownEmails();
  const isNew = !known.has(email);
  if (isNew) appendSignup(email);

  try {
    await transporter.sendMail({
      from: MAIL_FROM,
      to: NOTIFY_TO,
      subject: `Veyra waitlist: ${email}${isNew ? '' : ' (repeat submission)'}`,
      text: `${email} just joined the Veyra waitlist.\nTime: ${new Date().toISOString()}\nTotal signups: ${known.size + (isNew ? 1 : 0)}`
    });

    await transporter.sendMail({
      from: MAIL_FROM,
      to: email,
      subject: "You're on the Veyra waitlist",
      text: "Thanks for your interest in Veyra.\n\nWe've received your signup and will be in touch as we get closer to launch.\n\n— Tandish Group"
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('waitlist mail error:', err.message);
    res.status(502).json({ ok: false, error: 'Could not send confirmation email. Please try again shortly.' });
  }
});

app.listen(PORT, () => {
  console.log(`Waitlist service listening on :${PORT}`);
});

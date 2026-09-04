/**
 * Ikram Ul Haq — Portfolio Backend Server
 * Handles contact form submissions and sends emails via Nodemailer.
 *
 * Start: node server.js  (or  npm start)
 * Visit: http://localhost:3001
 */

require('dotenv').config();
const express  = require('express');
const nodemailer = require('nodemailer');
const rateLimit  = require('express-rate-limit');
const helmet   = require('helmet');
const cors     = require('cors');
const path     = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ─────────────────────────────────────────────────────────────────
// Helmet with CSP disabled so the portfolio's CDN scripts (React, Tailwind) work
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10kb' }));

// Serve the portfolio HTML/CSS/images from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// ─── Rate Limiting ──────────────────────────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs : 15 * 60 * 1000, // 15-minute window
  max      : 5,               // max 5 submissions per window per IP
  standardHeaders: true,
  legacyHeaders  : false,
  message: {
    success: false,
    message: 'Too many messages sent from this IP. Please wait 15 minutes and try again.',
  },
});

// ─── Validation & Sanitisation ─────────────────────────────────────────────────
function sanitize(str) {
  return String(str || '').trim()
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function validateForm({ name, email, message }) {
  const errors = [];
  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    errors.push('Please provide a valid email address.');
  if (!message || message.trim().length < 10)
    errors.push('Message must be at least 10 characters.');
  if (message && message.trim().length > 2000)
    errors.push('Message must not exceed 2000 characters.');
  return errors;
}

// ─── Email HTML Template ────────────────────────────────────────────────────────
function buildEmailHtml({ name, email, message, submittedAt }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>New Portfolio Contact</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,0.1);">

    <!-- Header gradient banner -->
    <div style="background:linear-gradient(135deg,#3b82f6 0%,#6d28d9 100%);padding:36px 40px;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;letter-spacing:-0.5px;">
        📬 New Portfolio Message
      </h1>
      <p style="color:rgba(255,255,255,0.78);margin:10px 0 0;font-size:14px;line-height:1.5;">
        Someone reached out through your portfolio website
      </p>
    </div>

    <!-- Sender details -->
    <div style="padding:32px 40px 0;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f1f3;width:120px;vertical-align:top;">
            <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">From</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f1f3;vertical-align:top;">
            <span style="font-size:16px;color:#111827;font-weight:600;">${sanitize(name)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #f0f1f3;vertical-align:top;">
            <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Email</span>
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #f0f1f3;vertical-align:top;">
            <a href="mailto:${sanitize(email)}" style="color:#3b82f6;text-decoration:none;font-size:15px;">
              ${sanitize(email)}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;">Date</span>
          </td>
          <td style="padding:12px 0;vertical-align:top;">
            <span style="font-size:14px;color:#6b7280;">${submittedAt}</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Message body -->
    <div style="padding:24px 40px;">
      <div style="background:#f8fafc;border-radius:12px;padding:24px;border-left:4px solid #3b82f6;">
        <p style="font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">
          Message
        </p>
        <p style="color:#1f2937;font-size:15px;line-height:1.8;margin:0;white-space:pre-wrap;">
          ${sanitize(message)}
        </p>
      </div>
    </div>

    <!-- Reply tip -->
    <div style="padding:0 40px 32px;">
      <div style="background:#eff6ff;border-radius:12px;padding:16px 20px;">
        <p style="margin:0;font-size:13px;color:#1d4ed8;line-height:1.6;">
          💡 <strong>Tip:</strong> Hit <em>Reply</em> to respond directly to
          <strong>${sanitize(name)}</strong> at <strong>${sanitize(email)}</strong>.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f9fafb;padding:18px 40px;border-top:1px solid #f0f1f3;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">
        Sent via the contact form on <strong>Ikram Ul Haq's Portfolio</strong>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
}

// ─── POST /api/contact ──────────────────────────────────────────────────────────
app.post('/api/contact', contactLimiter, async (req, res) => {
  const { name, email, message } = req.body || {};

  // Server-side validation
  const errors = validateForm({ name, email, message });
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0] });
  }

  // Formatted submission time (Pakistan Standard Time)
  const submittedAt = new Date().toLocaleString('en-PK', {
    timeZone   : 'Asia/Karachi',
    weekday    : 'long',
    year       : 'numeric',
    month      : 'long',
    day        : 'numeric',
    hour       : '2-digit',
    minute     : '2-digit',
    hour12     : true,
  });

  const transporter = nodemailer.createTransport({
    host  : process.env.EMAIL_HOST,
    port  : parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth  : {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from   : `"Ikram Ul Haq Portfolio" <${process.env.EMAIL_USERNAME}>`,
    to     : process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USERNAME,
    replyTo: `"${name.trim()}" <${email.trim()}>`,
    subject: `New Contact Form Submission from ${name.trim()}`,
    text   : `New Portfolio Contact Form Submission\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nDate: ${submittedAt}\n\nMessage:\n${message.trim()}\n`,
    html   : buildEmailHtml({ name, email, message, submittedAt }),
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High',
    },
  };

  try {
    await transporter.verify();
    await transporter.sendMail(mailOptions);
    console.log(`[${new Date().toISOString()}] ✅  Email sent  →  ${email.trim()}`);
    res.json({
      success: true,
      message: "Message sent! I'll get back to you soon. 🎉",
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌  Email error:`, err.message);
    const receiver = process.env.CONTACT_RECEIVER_EMAIL || 'ikramulhaqq90@gmail.com';
    res.status(500).json({
      success: false,
      message: `Failed to send your message. You can email me directly at ${receiver}.`,
    });
  }
});

// ─── GET /api/health ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status         : 'ok',
    timestamp      : new Date().toISOString(),
    emailConfigured: !!(process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD),
  });
});

// ─── Start ──────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const missing = ['EMAIL_HOST','EMAIL_USERNAME','EMAIL_PASSWORD','CONTACT_RECEIVER_EMAIL']
    .filter(k => !process.env[k]);

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  🚀  Portfolio  →  http://localhost:${PORT}`);
  console.log('══════════════════════════════════════════════════════');

  if (missing.length > 0) {
    console.log(`\n  ⚠️  Missing .env keys: ${missing.join(', ')}`);
    console.log('     Copy server/.env.example → server/.env and fill in credentials.\n');
  } else {
    console.log(`\n  ✅  Sending as:  ${process.env.EMAIL_USERNAME}`);
    console.log(`  📧  Delivering to: ${process.env.CONTACT_RECEIVER_EMAIL}`);
    console.log('\n  Contact form is LIVE. ✔\n');
  }
});

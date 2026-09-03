# Ikram Ul Haq — Personal Portfolio & Contact Backend

A modern, high-performance, animated AI Engineer portfolio equipped with a fully functional Node.js / Express contact form email backend.

---

## 📁 Project Structure

```
ikram-portfolio/
├── index.html          # Main frontend (React 18 + Tailwind CSS + Custom Animations)
├── profile.jpg         # Professional Profile Picture
├── README.md           # Setup & Deployment Guide
└── server/
    ├── server.js       # Express server & Nodemailer API endpoint (/api/contact)
    ├── package.json    # Backend dependencies (express, nodemailer, cors, helmet, etc.)
    ├── .env.example    # Environment variable configuration template
    └── .env            # Your private email credentials (create from .env.example)
```

---

## ⚡ Quick Start (Local Setup)

### 1. Install Backend Dependencies

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

### 2. Configure Email Credentials (`.env`)

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Open `.env` in any text editor and fill in your email settings:

```env
# SMTP Server (Gmail default)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Your Gmail address used to authenticate with SMTP
EMAIL_USERNAME=your-email@gmail.com

# 16-character Gmail App Password (NOT your regular password)
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Where contact form messages are delivered
CONTACT_RECEIVER_EMAIL=ikramulhaqq90@gmail.com

PORT=3001
```

> **🔑 How to get a Gmail App Password:**
> 1. Go to your [Google Account Security](https://myaccount.google.com/security).
> 2. Ensure **2-Step Verification** is enabled.
> 3. Under *"How you sign in to Google"*, click **App passwords**.
> 4. Create an App Password for **Mail** and copy the generated 16-character code into `EMAIL_PASSWORD`.

### 3. Run the Server

Start the Express backend:

```bash
# Production mode
npm start

# Development mode (auto-reload on edit)
npm run dev
```

Visit **`http://localhost:3001`** in your browser to view the portfolio and test the functional contact form!

---

## 🎨 Features & Highlights

- **Hero Profile Card**: Professional photo with animated spinning conic gradient border, ambient glow, and hover micro-interactions.
- **Typewriter Effect**: Dynamic role switching (`AI Engineer`, `Automation Specialist`, `LLM Application Builder`, etc.).
- **3D Tilt Project Cards**: Smooth perspective tilt on cursor hover.
- **Interactive Project Modal**: Complete execution workflow diagrams, key features, and interaction examples.
- **Scroll-Reveal & Stagger Animations**: Smooth CSS reveal animations using `IntersectionObserver`.
- **Light & Dark Theme Switcher**: Full support for dark slate and crisp light mode themes with localStorage persistence.
- **Functional Contact Form**:
  - Frontend field validation & sanitized input.
  - Express rate-limiter (max 5 requests per 15 mins per IP).
  - Production-ready HTML email template delivered straight to your inbox with direct reply-to headers.

---

## 🚀 Deployment Options

- **Render / Railway / Heroku**: Deploy the `server/` directory as a Node.js web service.
- **Vercel / Netlify**: Deploy `index.html` as static frontend and configure Serverless Functions for `/api/contact`.

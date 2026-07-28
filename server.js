// server.js
//
// FIX-DEPLOY-1: Render (unlike Netlify) does not run "Netlify Functions" —
// it just runs whatever command you give it and expects something
// listening on process.env.PORT. This is that something: a plain Express
// server that (a) serves the static `public/` folder, and (b) exposes the
// same POST /.netlify/functions/analyze route the client already calls,
// backed by the exact same logic as the Netlify version (lib/analyzeCore.js)
// so behavior is identical on both platforms.
//
// Render start command should be:  node server.js
// (package.json's "start" script is already set to this.)

const express = require('express');
const path = require('path');
const { handleAnalyzeRequest } = require('./lib/analyzeCore');

const app = express();
const PORT = process.env.PORT || 10000;

// FIX-DEPLOY-1: baseline security headers (mirrors netlify.toml's [[headers]]
// block, which only applies on Netlify — Render ignores netlify.toml
// entirely, so without this the live Render site had NO security headers
// at all). Must run before express.static, or static responses skip it.
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://www.gstatic.com https://apis.google.com 'unsafe-inline'; " +
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com " +
    "https://securetoken.googleapis.com https://identitytoolkit.googleapis.com; " +
    "frame-src https://my-passport-211af.firebaseapp.com https://accounts.google.com"
  );
  next();
});

// Accept the endpoint's JSON body as raw text so handleAnalyzeRequest can
// JSON.parse it itself (keeps the exact same parsing/error-handling path
// as the Netlify adapter, instead of duplicating it here).
app.use('/.netlify/functions/analyze', express.text({ type: '*/*', limit: '200kb' }));

app.post('/.netlify/functions/analyze', async (req, res) => {
  const result = await handleAnalyzeRequest({
    method: req.method,
    origin: req.headers.origin,
    authorization: req.headers.authorization,
    rawBody: req.body
  });
  res.status(result.statusCode);
  Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.send(result.body);
});

app.options('/.netlify/functions/analyze', async (req, res) => {
  const result = await handleAnalyzeRequest({ method: 'OPTIONS', origin: req.headers.origin, authorization: '', rawBody: '' });
  res.status(result.statusCode);
  Object.entries(result.headers || {}).forEach(([k, v]) => res.setHeader(k, v));
  res.send(result.body);
});

// Static site
app.use(express.static(path.join(__dirname, 'public')));

// SPA-style fallback for direct links to /pages/dashboard.html etc. —
// static files above already win if they exist; this only catches
// anything else and sends index.html, mirroring netlify.toml's "/* ->
// /index.html" redirect.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`My Passport server listening on port ${PORT}`);
});

// netlify/functions/analyze.js
//
// Thin Netlify Functions adapter. All the actual logic (Firebase token
// verification, CORS, prompt building, Claude API call) lives once in
// ../../lib/analyzeCore.js, shared with server.js (used on Render) — see
// that file for the full explanation of why this split exists.

const { handleAnalyzeRequest } = require('../../lib/analyzeCore');

exports.handler = async function(event) {
  const result = await handleAnalyzeRequest({
    method: event.httpMethod,
    origin: event.headers && (event.headers.origin || event.headers.Origin),
    authorization: event.headers && (event.headers.authorization || event.headers.Authorization),
    rawBody: event.body
  });
  return result;
};

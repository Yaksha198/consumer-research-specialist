#!/usr/bin/env node
/*
 * server.js - Local proxy server for Consumer Research Specialist
 *
 * Serves the HTML/CSS/JS app on http://localhost:8080 AND provides:
 *
 *   GET /api/serp?<params>     → proxies SerpAPI calls (no CORS issues)
 *   GET /api/enrich?url=<url>  → fetches Amazon product page & extracts weight
 *
 * Both endpoints are called by app.js using the same origin, so no CORS.
 * The Amazon enrichment is done server-side, bypassing bot-protection.
 *
 * Usage: node server.js
 * Requires: Node.js >= 14 (no npm install — uses only built-in modules)
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;  // Railway injects PORT automatically
const SERP_HOST = 'serpapi.com';
const SERP_PATH = '/search.json';

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.json': 'application/json',
};

// ── HTTP Server ─────────────────────────────────────────────
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');

    const parsedUrl = url.parse(req.url, true);

    if (parsedUrl.pathname === '/api/serp') {
        return handleSerpProxy(parsedUrl.query, res);
    }

    if (parsedUrl.pathname === '/api/enrich') {
        return handleAmazonEnrich(parsedUrl.query.url, res);
    }

    // Static files
    let filePath = path.join(__dirname, parsedUrl.pathname === '/' ? 'index.html' : parsedUrl.pathname);
    fs.stat(filePath, (statErr) => {
        if (statErr) {
            res.writeHead(404);
            return res.end('Not found');
        }
        const ext = path.extname(filePath).toLowerCase();
        const mime = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        fs.createReadStream(filePath).pipe(res);
    });
});

// ── SerpAPI Proxy ────────────────────────────────────────────
function handleSerpProxy(queryParams, res) {
    const qs = new url.URLSearchParams(queryParams).toString();
    res.setHeader('Content-Type', 'application/json');
    httpsGet(`https://${SERP_HOST}${SERP_PATH}?${qs}`, (err, body, status) => {
        if (err) {
            res.writeHead(502);
            return res.end(JSON.stringify({ error: `Proxy: ${err.message}` }));
        }
        res.writeHead(status);
        res.end(body);
    });
}

// ── Amazon Page Enrichment ───────────────────────────────────
/*
 * Fetches the Amazon product page (or any URL) server-side and extracts
 * a weight string by scanning the plain-text content for patterns like:
 *   "Item Weight : 1 kg"   "Net Quantity 500 g"   "Net Weight 250 grams"
 *
 * Returns JSON: { weight: "1 kg" } or { weight: null, error: "..." }
 */
function handleAmazonEnrich(targetUrl, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!targetUrl) {
        res.writeHead(400);
        return res.end(JSON.stringify({ weight: null, error: 'No URL provided' }));
    }

    // Add browser-like headers so Amazon serves real HTML (not bot block page)
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
        'Accept-Encoding': 'identity',
        'Cache-Control': 'no-cache',
    };

    httpsGet(targetUrl, (err, body, status) => {
        if (err || !body) {
            res.writeHead(200);
            return res.end(JSON.stringify({ weight: null, error: err?.message || 'Empty response' }));
        }

        // Strip HTML tags and decode basic entities
        const text = body
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/gi, ' ')
            .replace(/&amp;/gi, '&')
            .replace(/\s+/g, ' ');

        // Look for weight-related patterns in the product detail text
        const weightRes = [
            /item\s+weight\s*[:\-]?\s*([\d.,]+\s*(?:kilograms?|kgs?|grams?|gms?|g\b|mg|lbs?|oz|litres?|liters?|ltr?s?|l\b|ml)\b)/i,
            /net\s+quantity\s*[:\-]?\s*([\d.,]+\s*(?:kilograms?|kgs?|grams?|gms?|g\b|ml|litres?|l\b))/i,
            /net\s+weight\s*[:\-]?\s*([\d.,]+\s*(?:kilograms?|kgs?|grams?|gms?|g\b|ml|litres?|l\b))/i,
            /package\s+weight\s*[:\-]?\s*([\d.,]+\s*(?:kilograms?|kgs?|grams?|gms?|g\b|ml|litres?|l\b))/i,
            /product\s+weight\s*[:\-]?\s*([\d.,]+\s*(?:kilograms?|kgs?|grams?|gms?|g\b|ml|litres?|l\b))/i,
        ];

        let found = null;
        for (const re of weightRes) {
            const m = text.match(re);
            if (m) { found = m[1].trim(); break; }
        }

        res.writeHead(200);
        res.end(JSON.stringify({ weight: found }));
    }, headers);
}

// ── Generic HTTPS GET helper ─────────────────────────────────
function httpsGet(targetUrl, callback, extraHeaders = {}) {
    const parsed = new url.URL(targetUrl);
    const options = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: { 'Accept': 'application/json', ...extraHeaders },
        timeout: 10000,
    };

    let body = '';
    const req = https.request(options, (res2) => {
        res2.setEncoding('utf8');
        res2.on('data', chunk => body += chunk);
        res2.on('end', () => callback(null, body, res2.statusCode));
    });
    req.on('timeout', () => { req.destroy(); callback(new Error('Timeout')); });
    req.on('error', (e) => callback(e));
    req.end();
}

server.listen(PORT, () => {
    console.log(`\n✅ Consumer Research Specialist running!`);
    console.log(`   App:     http://localhost:${PORT}`);
    console.log(`   SerpAPI: http://localhost:${PORT}/api/serp`);
    console.log(`   Enrich:  http://localhost:${PORT}/api/enrich?url=<amazon-url>\n`);
});

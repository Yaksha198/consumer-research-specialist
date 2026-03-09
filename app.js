/* ============================================================
   CONSUMER RESEARCH SPECIALIST — app.js
   SerpAPI-powered · 15-brand comparator · Cost per 100g
   ============================================================ */

'use strict';

// ─── CONSTANTS ───────────────────────────────────────────────
const LS_API_KEY = 'crs_serpapi_key';
const SERPAPI_URL = 'https://serpapi.com/search.json';
const TARGET_BRANDS = 15;

// ─── STATE ───────────────────────────────────────────────────
let apiKey = localStorage.getItem(LS_API_KEY) || '';

// ─── BOOT ────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    apiKey ? hideApiModal() : showApiModal();
});

// ─── API KEY MODAL ───────────────────────────────────────────
function showApiModal() {
    document.getElementById('apiKeyModal').classList.remove('hidden');
}
function hideApiModal() {
    document.getElementById('apiKeyModal').classList.add('hidden');
}
function promptApiKey() {
    document.getElementById('apiKeyInput').value = apiKey || '';
    showApiModal();
}
function saveApiKey() {
    const val = document.getElementById('apiKeyInput').value.trim();
    const err = document.getElementById('modalError');
    if (!val) { err.textContent = 'Please paste a valid SerpAPI key.'; return; }
    err.textContent = '';
    apiKey = val;
    localStorage.setItem(LS_API_KEY, apiKey);
    hideApiModal();
}
document.getElementById('apiKeyInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
});

// ─── SEARCH HANDLER ──────────────────────────────────────────
function fillSearch(text) {
    document.getElementById('searchInput').value = text;
    document.getElementById('searchInput').focus();
}
function scrollToSearch() {
    document.querySelector('.hero').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('searchInput').focus(), 500);
}

async function handleSearch(e) {
    e.preventDefault();
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;
    if (!apiKey) { showApiModal(); return; }

    setSearchBtnState(true);
    showResultsArea();
    setStatus('loading', `Searching for 15 manufacturers of "${query}"…`);

    try {
        const products = await fetchProducts(query);
        if (!products || products.length === 0) {
            throw new Error('No products found. Try a more specific product name, or check your SerpAPI key quota.');
        }
        renderResults(query, products);
    } catch (err) {
        showError('Search Failed', err.message);
    } finally {
        setSearchBtnState(false);
    }
}

// ─── FETCH PIPELINE ──────────────────────────────────────────
/*
 * Phase 1: google_shopping → up to 50 results, deduplicated to 15 unique brands.
 *           Weight parsed from title + extensions[] + snippet.
 *           product_id is preserved from each result for Phase 2.
 *
 * Phase 2: For products STILL missing weight after Phase 1,
 *           call SerpAPI's google_product engine using the product_id.
 *           This returns the FULL product spec table (the same table you see
 *           on the Google Shopping product detail page, including "Product Weight").
 *           This is a proper API call — no scraping, no bot-blocking.
 *
 * Example: "Two Brothers Organic Farms Sattu Atta" title has no weight,
 *           but google_product returns specs: { "Product Weight": "1 kg" }
 */
async function fetchProducts(query) {
    setStatus('loading', `[1/2] Fetching products from Google Shopping…`);

    const params = new URLSearchParams({
        engine: 'google_shopping',
        q: `${query} amazon.in`,
        gl: 'in',
        hl: 'en',
        num: '50',
        api_key: apiKey,
    });

    const data = await serpFetch(params);
    if (data.error) throw new Error(`SerpAPI: ${data.error}`);

    const raw = data.shopping_results || [];
    const products = deduplicateByBrand(raw.map(normalizeProduct));

    // Phase 2: Enrich missing weights via google_immersive_product spec table
    const noWeight = products.filter(p => p.weightG === null && p.pageToken);
    if (noWeight.length > 0) {
        setStatus('loading', `[2/2] Looking up product specs for ${noWeight.length} products…`);
        await enrichViaProductAPI(noWeight);
    }

    return products;
}

// ─── SERPAPI FETCH HELPER ─────────────────────────────────────
/*
 * Always route through /api/serp on the same server (server.js handles
 * the HTTPS call to SerpAPI server-side — no CORS issues anywhere).
 *
 * Works on:  localhost:8080  AND  Railway/any deployed host
 * Fallback:  allorigins proxy only for file:// (opened directly from Finder)
 */
async function serpFetch(params) {
    const qs = params.toString();

    // Any HTTP/HTTPS origin → use /api/serp on the same server (no CORS)
    if (location.protocol !== 'file:') {
        const res = await fetch(`/api/serp?${qs}`);
        if (!res.ok) {
            const e = await res.json().catch(() => ({}));
            throw new Error(e.error || `Server error ${res.status}`);
        }
        return await res.json();
    }

    // file:// fallback → allorigins proxy (best-effort, no enrichment)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`${SERPAPI_URL}?${qs}`)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`);
    const wrapper = await res.json();
    return JSON.parse(wrapper.contents);
}


// ─── PHASE 2: AMAZON PAGE ENRICHMENT (via local server) ───────
async function enrichViaProductAPI(products) {
    /*
     * On localhost: use server.js /api/enrich endpoint — Node.js fetches the
     * Amazon product page server-side with real browser headers, parses the
     * product detail table, and returns the weight string.
     *
     * On deployed / file://: silently skip (best-effort only).
     */
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isLocalhost) return; // enrichment only available when server.js is running

    const CONCURRENCY = 3;
    for (let i = 0; i < products.length; i += CONCURRENCY) {
        const batch = products.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(p => enrichOneViaAmazonPage(p)));
    }
}

async function enrichOneViaAmazonPage(product) {
    if (!product.link || product.link === '#') return;
    try {
        const enrichUrl = `/api/enrich?url=${encodeURIComponent(product.link)}`;
        const res = await fetch(enrichUrl);
        if (!res.ok) return;
        const { weight } = await res.json();
        if (!weight) return;

        const g = parseWeightToGrams(weight);
        if (g) {
            product.weightG = g;
            product.weightSrc = `[Amazon page] ${weight}`;
            product.costPer100g = product.priceNum ? (product.priceNum / g) * 100 : null;
            console.log(`✅ Enriched "${product.brand}": ${weight} → ${g}g → ₹${product.costPer100g?.toFixed(2)}/100g`);
        }
    } catch (e) {
        console.debug(`Enrichment skipped for "${product.brand}":`, e.message);
    }
}

// ─── NORMALIZE A RAW SERP SHOPPING RESULT ────────────────────
function normalizeProduct(item) {
    const title = item.title || 'Unknown Product';
    const priceRaw = item.price || item.extracted_price || '';
    const priceNum = parsePriceINR(priceRaw);

    // Combine all text fields SerpAPI might include weight in
    const extStr = Array.isArray(item.extensions)
        ? item.extensions.join(' ')
        : (typeof item.extensions === 'string' ? item.extensions : '');
    const snippet = item.snippet || item.description || '';
    const weightSrc = [title, extStr, snippet].filter(Boolean).join(' ');

    const weightG = parseWeightToGrams(weightSrc);
    const costPer100g = (weightG && priceNum) ? (priceNum / weightG) * 100 : null;

    return {
        title,
        brand: extractBrand(title, item.source || ''),
        priceRaw,
        priceNum,
        weightG,
        weightSrc,
        costPer100g,
        productId: item.product_id || null,
        pageToken: item.immersive_product_page_token || item.product_id || null, // for google_immersive_product
        rating: item.rating ? parseFloat(item.rating) : null,
        reviews: item.reviews ? parseReviews(item.reviews) : null,
        link: item.link || item.product_link || '#',
        source: item.source || '',
    };
}

// ─── PRICE PARSER ────────────────────────────────────────────
function parsePriceINR(priceStr) {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return null;
    const cleaned = String(priceStr).replace(/[₹Rs.,\s]/gi, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
}

// ─── WEIGHT PARSER ───────────────────────────────────────────
function parseWeightToGrams(src) {
    /*
     * Parses weight from any text — title, extension, snippet, or spec value.
     *
     * Ordering matters: kg MUST come before g to avoid "1" from "1kg" being
     * matched as "1g". Same for litre before l, ml before l.
     *
     * Input examples:
     *   "1 kg", "500g", "250 Grams", "1.5 Kg", "500 ml", "1 Litre",
     *   "1 kg (Pack of 2)" → 1000g (note: we ignore pack multiplier — per unit)
     */
    if (!src) return null;
    const t = src.toLowerCase();

    const patterns = [
        // kilogram (FIRST)
        { re: /(\d+(?:\.\d+)?)\s*kilogram[s]?\b/, mult: 1000 },
        { re: /(\d+(?:\.\d+)?)\s*kgs?\b/, mult: 1000 },
        // litre
        { re: /(\d+(?:\.\d+)?)\s*litres?\b/, mult: 1000 },
        { re: /(\d+(?:\.\d+)?)\s*liters?\b/, mult: 1000 },
        { re: /(\d+(?:\.\d+)?)\s*ltrs?\b/, mult: 1000 },
        { re: /(\d+(?:\.\d+)?)\s*lt\b/, mult: 1000 },
        { re: /(\d+(?:\.\d+)?)\s*l\b/, mult: 1000 },
        // millilitre
        { re: /(\d+(?:\.\d+)?)\s*millilitres?\b/, mult: 1 },
        { re: /(\d+(?:\.\d+)?)\s*mls?\b/, mult: 1 },
        { re: /(\d+(?:\.\d+)?)\s*ml\b/, mult: 1 },
        // grams (LAST — after all kg patterns)
        { re: /(\d+(?:\.\d+)?)\s*grams?\b/, mult: 1 },
        { re: /(\d+(?:\.\d+)?)\s*gms?\b/, mult: 1 },
        { re: /(\d+(?:\.\d+)?)\s*g\b/, mult: 1 },
    ];

    for (const { re, mult } of patterns) {
        const m = t.match(re);
        if (m) {
            const val = parseFloat(m[1]) * mult;
            if (val >= 1 && val <= 50000) return val;
        }
    }
    return null;
}

// ─── BRAND EXTRACTOR ─────────────────────────────────────────
function extractBrand(title, source) {
    const GENERIC = new Set([
        'the', 'a', 'an', 'organic', 'pure', 'natural', 'premium', 'fresh',
        'best', 'original', 'classic', 'real', '100%', 'authentic', 'traditional',
        'cold', 'pressed', 'wild', 'forest', 'raw', 'refined', 'unrefined', 'extra',
        'virgin', 'multi', 'super', 'ultra', 'bio', 'eco', 'healthy', 'farm',
        'homemade', 'handmade', 'artisan', 'artisanal', 'small', 'batch',
    ]);
    const parts = title.split(/[-–|,()]/);
    const firstPart = parts[0].trim();
    const words = firstPart.split(/\s+/).filter(w => {
        const lw = w.toLowerCase().replace(/[^a-z]/g, '');
        return lw.length > 1 && !GENERIC.has(lw);
    });
    if (words.length === 0) return source || 'Unknown';
    return words.slice(0, 3).join(' ') || source || 'Unknown';
}

// ─── REVIEW COUNT PARSER ─────────────────────────────────────
function parseReviews(reviewsStr) {
    if (typeof reviewsStr === 'number') return reviewsStr;
    if (!reviewsStr) return null;
    const s = String(reviewsStr).toLowerCase().replace(/,/g, '').trim();
    const kMatch = s.match(/^(\d+(?:\.\d+)?)\s*k/);
    if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
    const num = parseInt(s.replace(/[^\d]/g, ''));
    return isNaN(num) ? null : num;
}

// ─── DEDUPLICATE BY BRAND ────────────────────────────────────
function deduplicateByBrand(products) {
    const seen = new Map();
    for (const p of products) {
        const key = p.brand.toLowerCase().replace(/\s+/g, ' ').trim();
        if (!seen.has(key)) seen.set(key, p);
    }
    return Array.from(seen.values()).slice(0, TARGET_BRANDS);
}

// ─── ANALYSIS PICKS ──────────────────────────────────────────
function computeAnalysis(products) {
    const withCost = products.filter(p => p.costPer100g !== null);
    const withRating = products.filter(p => p.rating !== null);
    const withReviews = products.filter(p => p.reviews !== null);

    let valuePick = withCost
        .filter(p => p.rating === null || p.rating >= 4.0)
        .sort((a, b) => a.costPer100g - b.costPer100g)[0];
    if (!valuePick) valuePick = [...withCost].sort((a, b) => a.costPer100g - b.costPer100g)[0] || null;

    const premiumPick = [...withRating].sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return (b.reviews || 0) - (a.reviews || 0);
    })[0] || null;

    const popularPick = [...withReviews].sort((a, b) => b.reviews - a.reviews)[0] || null;

    return { valuePick, premiumPick, popularPick };
}

// ─── RENDER ──────────────────────────────────────────────────
function renderResults(query, products) {
    const sorted = [
        ...products.filter(p => p.costPer100g !== null).sort((a, b) => a.costPer100g - b.costPer100g),
        ...products.filter(p => p.costPer100g === null),
    ];
    const analysis = computeAnalysis(products);

    setStatus('done', `Found ${sorted.length} unique manufacturers for "${query}"`);
    document.getElementById('statusMeta').textContent = new Date().toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    document.getElementById('resultBadge').textContent = `✅ ${sorted.length} Unique Brands Found`;
    document.getElementById('resultHeading').textContent = query;
    document.getElementById('resultSubheading').textContent =
        `Sorted by Cost per 100g (lowest first) · Weight sourced from product title + Google Shopping spec table`;

    renderAnalysisCards(analysis, sorted);
    renderTable(sorted, analysis);

    document.getElementById('skeletonWrap').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'block';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('resultsContent').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Analysis Cards ───────────────────────────────────────────
function renderAnalysisCards({ valuePick, premiumPick, popularPick }) {
    const grid = document.getElementById('analysisGrid');
    grid.innerHTML = '';

    const cards = [
        {
            cls: 'value', emoji: '🏆', label: 'Value Champion', pick: valuePick,
            stats: valuePick ? [
                valuePick.costPer100g ? `₹${valuePick.costPer100g.toFixed(2)}/100g` : null,
                valuePick.priceNum ? `₹${valuePick.priceNum}` : valuePick.priceRaw,
                valuePick.rating ? `⭐ ${valuePick.rating}` : null,
            ].filter(Boolean) : [],
            reason: 'Lowest cost per 100g with a customer rating of 4.0 or above — the best everyday buy.',
        },
        {
            cls: 'premium', emoji: '💎', label: 'Premium Pick', pick: premiumPick,
            stats: premiumPick ? [
                premiumPick.rating ? `⭐ ${premiumPick.rating}/5` : null,
                premiumPick.reviews ? `${fmtNum(premiumPick.reviews)} reviews` : null,
                premiumPick.priceNum ? `₹${premiumPick.priceNum}` : premiumPick.priceRaw,
            ].filter(Boolean) : [],
            reason: 'Highest customer rating — the gold standard for quality and satisfaction.',
        },
        {
            cls: 'popular', emoji: '🔥', label: 'Most Popular', pick: popularPick,
            stats: popularPick ? [
                popularPick.reviews ? `${fmtNum(popularPick.reviews)} reviews` : null,
                popularPick.rating ? `⭐ ${popularPick.rating}` : null,
                popularPick.priceNum ? `₹${popularPick.priceNum}` : popularPick.priceRaw,
            ].filter(Boolean) : [],
            reason: 'Highest total review count — the most battle-tested product by volume of buyers.',
        },
    ];

    for (const c of cards) {
        if (!c.pick) continue;
        const card = document.createElement('div');
        card.className = `analysis-card ${c.cls}`;
        card.innerHTML = `
      <span class="card-emoji">${c.emoji}</span>
      <div class="card-label">${c.label}</div>
      <div class="card-brand">${escHtml(c.pick.brand)}</div>
      <div class="card-product">${escHtml(c.pick.title)}</div>
      <div class="card-stats">${c.stats.map(s => `<span class="card-stat">${escHtml(s)}</span>`).join('')}</div>
      <div class="card-reason">${c.reason}</div>
    `;
        grid.appendChild(card);
    }
}

// ── Data Table ───────────────────────────────────────────────
function renderTable(sorted, analysis) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    sorted.forEach((p, i) => {
        const rank = i + 1;
        const tr = document.createElement('tr');
        if (rank <= 3 && p.costPer100g !== null) tr.classList.add(`rank-${rank}`);

        // Rank badge
        let rankHtml;
        if (rank === 1 && p.costPer100g) rankHtml = `<span class="rank-badge gold-rank">🥇</span>`;
        else if (rank === 2 && p.costPer100g) rankHtml = `<span class="rank-badge silver-rank">🥈</span>`;
        else if (rank === 3 && p.costPer100g) rankHtml = `<span class="rank-badge bronze-rank">🥉</span>`;
        else rankHtml = `<span class="rank-badge">${rank}</span>`;

        // Cost / 100g
        const isValueChamp = analysis.valuePick && p.brand === analysis.valuePick.brand && p.costPer100g !== null;
        const isFromSpec = p.weightSrc && p.weightSrc.startsWith('[Product spec');
        let costHtml;
        if (p.costPer100g !== null) {
            const cls = isValueChamp ? 'cost-value best' : 'cost-value';
            const specTag = isFromSpec
                ? ` <span style="font-size:10px;color:var(--emerald);font-weight:700" title="${escAttr(p.weightSrc)}">✓spec</span>`
                : '';
            costHtml = `<span class="${cls}">₹${p.costPer100g.toFixed(2)}</span>${specTag}`;
        } else {
            costHtml = `<span class="na-tag">N/A</span>`;
        }

        // Rating
        const ratingHtml = p.rating !== null
            ? `<div class="rating-stars"><span class="star-fill">★</span><span class="star-val">${p.rating.toFixed(1)}</span></div>`
            : `<span class="star-none">—</span>`;

        // Reviews
        const isPopular = analysis.popularPick && p.brand === analysis.popularPick.brand;
        const reviewsHtml = p.reviews !== null
            ? `<span class="${isPopular ? 'reviews-hi' : ''}">${fmtNum(p.reviews)}</span>`
            : `<span style="color:var(--text-dim)">—</span>`;

        // Link
        const linkHtml = p.link && p.link !== '#'
            ? `<a href="${escAttr(p.link)}" target="_blank" rel="noopener noreferrer" class="link-btn" title="View on Amazon">↗</a>`
            : `<span style="color:var(--text-dim)">—</span>`;

        tr.innerHTML = `
      <td class="td-rank">${rankHtml}</td>
      <td class="td-product"><div class="product-name" title="${escAttr(p.title)}">${escHtml(p.title)}</div></td>
      <td class="td-brand">${escHtml(p.brand)}</td>
      <td class="td-price">${p.priceNum ? `₹${p.priceNum}` : (escHtml(p.priceRaw) || '—')}</td>
      <td class="td-cost">${costHtml}</td>
      <td class="td-rating">${ratingHtml}</td>
      <td class="td-reviews">${reviewsHtml}</td>
      <td style="text-align:center">${linkHtml}</td>
    `;
        tbody.appendChild(tr);
    });

    const withCost = sorted.filter(p => p.costPer100g !== null).length;
    const fromSpec = sorted.filter(p => p.weightSrc?.startsWith('[Product spec')).length;
    document.getElementById('tableMeta').textContent =
        `${sorted.length} brands · ${withCost} with cost/100g · ${fromSpec} via spec lookup`;
}

// ─── UI HELPERS ──────────────────────────────────────────────
function showResultsArea() {
    const area = document.getElementById('resultsArea');
    area.style.display = 'block';
    document.getElementById('skeletonWrap').style.display = 'block';
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    area.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setStatus(type, text, meta) {
    const dot = document.getElementById('statusDot');
    const txt = document.getElementById('statusText');
    const metaEl = document.getElementById('statusMeta');
    dot.className = 'status-dot ' + (type === 'loading' ? 'loading' : type === 'error' ? 'error' : 'done');
    txt.textContent = text;
    if (meta) metaEl.textContent = meta;
}

function showError(title, msg) {
    document.getElementById('skeletonWrap').style.display = 'none';
    document.getElementById('resultsContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorTitle').textContent = title;
    document.getElementById('errorMsg').textContent = msg;
    setStatus('error', title);
}

function resetUI() {
    document.getElementById('resultsArea').style.display = 'none';
    scrollToSearch();
}

function setSearchBtnState(isLoading) {
    const btn = document.getElementById('searchBtn');
    btn.disabled = isLoading;
    btn.innerHTML = isLoading
        ? '<span class="search-btn-text">Analyzing…</span><span class="search-btn-icon" style="animation:spin 1s linear infinite;display:inline-block">⚙</span>'
        : '<span class="search-btn-text">Analyze 15 Brands</span><span class="search-btn-icon">→</span>';
}

// ─── UTILS ───────────────────────────────────────────────────
function fmtNum(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString('en-IN');
}

function escHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(str) {
    return String(str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Spin keyframe
const _style = document.createElement('style');
_style.textContent = '@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }';
document.head.appendChild(_style);

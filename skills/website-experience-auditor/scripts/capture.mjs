// Website Experience Auditor: capture step.
// Crawls a site (same origin), then scrolls every page like a visitor on desktop and phone.
// For each screen it saves a screenshot and what a skimming visitor could actually read there.
//
// usage: node capture.mjs <startUrl> <outDir> [--max-pages 15] [--max-screens 40] [--devices d,m] [--wait 700]
// output: <outDir>/capture.json, <outDir>/SKIM.md, <outDir>/<page>/{d,m}-NN.jpg
import fs from 'node:fs';
import path from 'node:path';

async function loadPlaywright() {
  const tries = [
    process.env.PW_PATH,
    'playwright', 'playwright-core',
    '<path>',
    '<path>',
  ].filter(Boolean);
  for (const t of tries) { try { return await import(t); } catch {} }
  throw new Error('Playwright not found. Set PW_PATH to a playwright(-core)/index.mjs');
}

const args = process.argv.slice(2);
const startUrl = args[0], outDir = args[1];
if (!startUrl || !outDir) { console.error('usage: node capture.mjs <startUrl> <outDir> [--max-pages N] [--max-screens N] [--devices d,m] [--wait ms]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i > -1 ? args[i + 1] : d; };
const MAX_PAGES = +opt('max-pages', 15), MAX_SCREENS = +opt('max-screens', 40), WAIT = +opt('wait', 700);
const DEVICES = opt('devices', 'd,m').split(',');

const { chromium, devices } = await loadPlaywright();
let browser;
try { browser = await chromium.launch({ channel: 'chrome' }); } catch { browser = await chromium.launch(); }
fs.mkdirSync(outDir, { recursive: true });

const origin = new URL(startUrl).origin;
const norm = u => { const x = new URL(u); x.hash = ''; return x.href; };
const slug = u => { const p = new URL(u).pathname.replace(/\/$/, '/index').replace(/^\//, '').replace(/\.html?$/, '').replace(/[^a-z0-9]+/gi, '-'); return p || 'index'; };

// 1. Crawl: discover pages (links, not scrolling)
const queue = [norm(startUrl)], seen = new Set(queue), pages = [];
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  while (queue.length && pages.length < MAX_PAGES) {
    const url = queue.shift();
    try {
      const r = await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      if (!r || r.status() >= 400) { pages.push({ url, status: r ? r.status() : 0 }); continue; }
      await p.waitForTimeout(800);
      const links = await p.evaluate(() => [...document.querySelectorAll('a[href]')].map(a => a.href));
      pages.push({ url, status: r.status() });
      for (const l of links) {
        try {
          const u = new URL(l); if (u.origin !== origin) continue;
          if (/\.(pdf|jpg|png|mp4|zip|svg|webp)$/i.test(u.pathname)) continue;
          const n = norm(l); if (!seen.has(n)) { seen.add(n); queue.push(n); }
        } catch {}
      }
    } catch (e) { pages.push({ url, status: 0, error: String(e).slice(0, 200) }); }
  }
  await ctx.close();
}

// 2. Visit each page like a visitor: one screen at a time
const readScreen = () => {
  const vh = innerHeight, vw = innerWidth;
  const inView = e => { const q = e.getBoundingClientRect(); if (q.width < 2 || q.height < 2) return false;
    if (q.bottom < vh * 0.08 || q.top > vh * 0.92 || q.right < 0 || q.left > vw) return false;
    const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none' || +s.opacity < 0.35) return false;
    let a = e.parentElement; while (a) { if (+getComputedStyle(a).opacity < 0.35) return false; a = a.parentElement; } return true; };
  const txt = e => (e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
  const fs_ = e => parseFloat(getComputedStyle(e).fontSize);
  const heads = [...document.querySelectorAll('h1,h2,h3,[class*=title],[class*=head]')].filter(inView).map(e => ({ t: txt(e), px: fs_(e) })).filter(h => h.t && h.t.length < 160);
  const body = [...document.querySelectorAll('p,li,figcaption,blockquote,small,label,summary')].filter(inView).map(txt).filter(t => t && t.length > 2);
  const ctas = [...document.querySelectorAll('a,button,input[type=submit]')].filter(inView).map(e => ({ t: txt(e) || e.value || '', href: e.getAttribute('href') || '', primary: /btn|cta|button|primary/i.test(e.className) || e.tagName === 'BUTTON' })).filter(c => c.t);
  const media = [...document.querySelectorAll('img,video,iframe,canvas,svg')].filter(inView).filter(e => e.getBoundingClientRect().width > vw * 0.2).map(e => e.tagName.toLowerCase() + (e.alt ? `("${e.alt}")` : '') + (e.src ? '[' + e.src.split('/').pop().slice(0, 40) + ']' : ''));
  // text inside same-origin iframes (live films)
  const frames = [];
  for (const f of document.querySelectorAll('iframe')) { try { if (!inView(f)) continue; const d = f.contentDocument; if (!d) continue;
    const t = [...d.querySelectorAll('h1,h2,h3,p,span,div')].filter(e => !e.children.length && e.innerText && e.offsetParent !== null && +getComputedStyle(e).opacity > 0.35).map(e => e.innerText.replace(/\s+/g, ' ').trim()).filter(s => s.length > 1);
    frames.push([...new Set(t)].slice(0, 25).join(' · ')); } catch {} }
  const sec = [...document.querySelectorAll('section,header,footer')].filter(inView).map(s => s.id || s.className.split(' ')[0] || s.tagName.toLowerCase());
  return { y: Math.round(scrollY), sections: [...new Set(sec)], headings: heads, body: [...new Set(body)].slice(0, 20), ctas, media, frames };
};

const pageMeta = () => ({
  title: document.title,
  description: document.querySelector('meta[name=description]')?.content || '',
  lang: document.documentElement.lang,
  nav: [...document.querySelectorAll('nav a, header a')].map(a => (a.innerText || a.getAttribute('aria-label') || '').trim()).filter(Boolean),
  forms: [...document.querySelectorAll('form')].map(f => ({ fields: [...f.querySelectorAll('input,select,textarea')].filter(i => i.type !== 'hidden').map(i => (i.labels?.[0]?.innerText || i.placeholder || i.name || i.type).replace(/\s+/g, ' ').trim()), submit: (f.querySelector('[type=submit],button')?.innerText || '').trim() })),
  wordCount: document.body.innerText.split(/\s+/).length,
  height: document.documentElement.scrollHeight,
});

const result = { startUrl, capturedAt: new Date().toISOString(), pages: [] };
for (const pg of pages.filter(p => p.status && p.status < 400)) {
  const s = slug(pg.url); fs.mkdirSync(path.join(outDir, s), { recursive: true });
  const entry = { url: pg.url, slug: s, devices: {} };
  for (const dv of DEVICES) {
    const ctx = await browser.newContext(dv === 'm' ? { ...devices['iPhone 13'] } : { viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage(); const errors = [];
    p.on('pageerror', e => errors.push(String(e).slice(0, 200)));
    const t0 = Date.now(); await p.goto(pg.url, { waitUntil: 'load', timeout: 45000 }).catch(() => {}); const loadMs = Date.now() - t0;
    await p.waitForTimeout(1500);
    if (!entry.meta) entry.meta = await p.evaluate(pageMeta);
    const vh = dv === 'm' ? 664 : 900, step = Math.round(vh * 0.85);
    const screens = []; let last = -1;
    for (let k = 0; k < MAX_SCREENS; k++) {
      const r = await p.evaluate(readScreen);
      const file = `${dv}-${String(k).padStart(2, '0')}.jpg`;
      await p.screenshot({ path: path.join(outDir, s, file), type: 'jpeg', quality: 70 });
      screens.push({ file, ...r });
      if (r.y === last) break; last = r.y;
      if (dv === 'd') { await p.mouse.move(700, 450); await p.mouse.wheel(0, step); } else { await p.evaluate(st => scrollBy(0, st), step); }
      await p.waitForTimeout(WAIT);
    }
    entry.devices[dv] = { loadMs, errors, screens };
    await ctx.close();
  }
  result.pages.push(entry);
}
await browser.close();
fs.writeFileSync(path.join(outDir, 'capture.json'), JSON.stringify(result, null, 1));

// 3. SKIM.md: per screen, what a visitor can read without effort
let md = `# Skim capture: ${startUrl}\n\nCaptured ${result.capturedAt}. One block per screen (desktop d = 1440×900, phone m = iPhone 13). Big text = headings ≥ 28 px.\n`;
for (const e of result.pages) {
  md += `\n## Page: ${e.slug} (${e.url})\n- Title: ${e.meta.title}\n- Meta description: ${e.meta.description}\n- Nav: ${e.meta.nav.join(' | ')}\n- Forms: ${JSON.stringify(e.meta.forms)}\n- Words on page: ${e.meta.wordCount}\n`;
  for (const [dv, d] of Object.entries(e.devices)) {
    md += `\n### ${dv === 'd' ? 'Desktop' : 'Phone'}: ${d.screens.length} screens, load ${d.loadMs} ms${d.errors.length ? ', JS errors: ' + d.errors.join('; ') : ''}\n`;
    for (const sc of d.screens) {
      const big = sc.headings.filter(h => h.px >= 28).map(h => h.t), small = sc.headings.filter(h => h.px < 28).map(h => h.t);
      md += `\n**${e.slug}/${sc.file}** (y=${sc.y}, sections: ${sc.sections.join(', ')})\n`;
      if (big.length) md += `- BIG: ${[...new Set(big)].join(' / ')}\n`;
      if (small.length) md += `- labels: ${[...new Set(small)].slice(0, 8).join(' / ')}\n`;
      if (sc.body.length) md += `- text: ${sc.body.slice(0, 8).join(' ¶ ').slice(0, 700)}\n`;
      if (sc.frames.length) md += `- inside animation: ${sc.frames.join(' || ').slice(0, 500)}\n`;
      if (sc.ctas.length) md += `- actions: ${[...new Set(sc.ctas.map(c => c.t))].slice(0, 8).join(' | ')}\n`;
      if (sc.media.length) md += `- visuals: ${sc.media.slice(0, 5).join(', ')}\n`;
    }
  }
}
fs.writeFileSync(path.join(outDir, 'SKIM.md'), md);
console.log(`pages: ${result.pages.length}; screens: ${result.pages.map(p => p.slug + ' ' + Object.entries(p.devices).map(([k, v]) => k + v.screens.length).join('/')).join(', ')}\n→ ${outDir}/SKIM.md`);

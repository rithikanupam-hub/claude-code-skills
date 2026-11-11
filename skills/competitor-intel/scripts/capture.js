// competitor-intel: one-shot page extractor. Run inside the page (browser-use js(), Claude in Chrome
// javascript tool, or DevTools console). Returns a JSON string: computed fonts, colours, headings,
// CTAs, nav, hero, media inventory. Keep the output small: everything is capped and de-duplicated.
(() => {
  const hex = (c) => {
    const m = (c || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat);
    if (p.length === 4 && p[3] === 0) return null;
    const h = '#' + p.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
    return p.length === 4 && p[3] < 1 ? `${h}@${p[3]}` : h;
  };
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0;
  };
  const txt = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  const top = (obj, n) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, weight: Math.round(v) }));
  const vh = window.innerHeight;
  const docTop = (el) => el.getBoundingClientRect().top + window.scrollY;

  const els = [...document.querySelectorAll('body *')].filter(vis).slice(0, 6000);
  const fonts = {}, textColors = {}, bgColors = {}, borderColors = {};
  for (const el of els) {
    const s = getComputedStyle(el);
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (own.length) {
      fonts[s.fontFamily] = (fonts[s.fontFamily] || 0) + own.length;
      const c = hex(s.color); if (c) textColors[c] = (textColors[c] || 0) + own.length;
    }
    const r = el.getBoundingClientRect();
    const b = hex(s.backgroundColor); if (b) bgColors[b] = (bgColors[b] || 0) + (r.width * r.height) / 1000;
    if (parseFloat(s.borderTopWidth) > 0) { const bc = hex(s.borderTopColor); if (bc) borderColors[bc] = (borderColors[bc] || 0) + 1; }
  }

  const roleStyle = (sel) => {
    const el = [...document.querySelectorAll(sel)].find(e => vis(e) && txt(e));
    if (!el) return null;
    const s = getComputedStyle(el);
    return { sample: txt(el).slice(0, 80), fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontSize: s.fontSize,
      lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform, color: hex(s.color) };
  };

  const isCta = (el) => {
    const t = txt(el); if (!t || t.length > 40) return false;
    const cls = (el.className && el.className.toString()) || '';
    return el.tagName === 'BUTTON' || el.getAttribute('role') === 'button' || /btn|button|cta/i.test(cls) ||
      hex(getComputedStyle(el).backgroundColor) !== null;
  };
  const ctas = [];
  const seenCta = new Set();
  for (const el of document.querySelectorAll('a, button')) {
    if (!vis(el) || !isCta(el)) continue;
    const t = txt(el); if (seenCta.has(t)) continue; seenCta.add(t);
    const s = getComputedStyle(el);
    ctas.push({ text: t, href: el.getAttribute('href'), y: Math.round(docTop(el)), bg: hex(s.backgroundColor), color: hex(s.color),
      radius: s.borderRadius, font: `${s.fontWeight} ${s.fontSize}` });
    if (ctas.length >= 30) break;
  }

  const headings = [...document.querySelectorAll('h1, h2, h3')].filter(vis).slice(0, 40)
    .map(h => ({ tag: h.tagName.toLowerCase(), text: txt(h).slice(0, 160), y: Math.round(docTop(h)) }));

  const navRoot = document.querySelector('header') || document.querySelector('nav');
  const nav = navRoot ? [...new Set([...navRoot.querySelectorAll('a, button')].filter(vis).map(txt).filter(t => t && t.length < 40))].slice(0, 25) : [];

  const imgs = [...document.querySelectorAll('img')].filter(vis);
  const seenImg = new Set();
  const images = imgs.filter(i => { const k = i.currentSrc || i.src; if (seenImg.has(k)) return false; seenImg.add(k); return true; }).slice(0, 40).map(i => ({ src: (i.currentSrc || i.src || '').slice(0, 200), alt: i.alt, w: Math.round(i.getBoundingClientRect().width),
    h: Math.round(i.getBoundingClientRect().height), y: Math.round(docTop(i)) }));
  const allVideos = [...document.querySelectorAll('video')];
  const vsrc = (v) => { const c = v.currentSrc || v.getAttribute('src') || ''; if (c && c !== location.href) return c;
    const so = v.querySelector('source'); return so ? (so.getAttribute('src') || so.dataset.src || '') : (v.dataset.src || ''); };
  const seenPoster = new Set();
  const videos = allVideos.filter(v => vis(v)).filter(v => { const k = v.poster || vsrc(v); if (seenPoster.has(k)) return false; seenPoster.add(k); return true; })
    .slice(0, 25).map(v => ({ src: vsrc(v).slice(0, 200),
    poster: (v.poster || '').slice(0, 200), autoplay: v.autoplay, muted: v.muted, loop: v.loop, controls: v.controls, duration: isFinite(v.duration) ? Math.round(v.duration) : null,
    w: Math.round(v.getBoundingClientRect().width), h: Math.round(v.getBoundingClientRect().height), y: Math.round(docTop(v)), visible: vis(v) }));
  const iframes = [...document.querySelectorAll('iframe')].map(f => f.src).filter(s => /youtube|vimeo|wistia|player/i.test(s)).slice(0, 10);
  const bgImages = els.map(e => ({ e, b: getComputedStyle(e).backgroundImage })).filter(o => o.b && o.b.includes('url('))
    .slice(0, 20).map(o => ({ url: o.b.slice(0, 200), y: Math.round(docTop(o.e)), w: Math.round(o.e.getBoundingClientRect().width) }));

  const inHero = (el) => docTop(el) < vh;
  const h1 = document.querySelector('h1');
  const hero = {
    h1: h1 ? txt(h1) : null,
    text: els.filter(e => inHero(e) && /^(P|SPAN|H2|H3|DIV)$/.test(e.tagName) && e.children.length === 0 && txt(e).length > 3).map(txt).slice(0, 15),
    ctas: ctas.filter(c => c.y < vh).map(c => c.text),
    videos: videos.filter(v => v.y < vh && v.visible).length,
    images: images.filter(i => i.y < vh && i.w > 200).length,
  };

  const sections = [...document.querySelectorAll('main > section, main > div > section, body > section, section')].filter(vis)
    .filter((s, i, arr) => !arr.some(o => o !== s && o.contains(s))).slice(0, 30)
    .map(s => { const hd = s.querySelector('h1,h2,h3'); return { y: Math.round(docTop(s)), heading: hd ? txt(hd).slice(0, 100) : null, bg: hex(getComputedStyle(s).backgroundColor) }; });

  const cssVars = {};
  try {
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
      for (const r of rules) if (r.selectorText === ':root' && r.style) for (const p of r.style) if (p.startsWith('--') && /#|rgb|hsl/.test(r.style.getPropertyValue(p))) cssVars[p] = r.style.getPropertyValue(p).trim();
    }
  } catch (e) {}

  const meta = (n) => (document.querySelector(`meta[name="${n}"], meta[property="${n}"]`) || {}).content || null;
  return JSON.stringify({
    url: location.href, capturedAt: new Date().toISOString(), lang: document.documentElement.lang, title: document.title,
    metaDescription: meta('description'), ogImage: meta('og:image'), viewport: { w: window.innerWidth, h: vh }, pageHeight: document.body.scrollHeight,
    fontsByTextVolume: top(fonts, 8), fontFacesLoaded: [...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family.replace(/"/g, '')} ${f.weight} ${f.style}`))].slice(0, 30),
    typeRoles: { h1: roleStyle('h1'), h2: roleStyle('h2'), h3: roleStyle('h3'), body: roleStyle('p'), nav: roleStyle('header a, nav a'), button: roleStyle('button, a[class*=btn], a[class*=button]') },
    textColors: top(textColors, 10), backgroundColors: top(bgColors, 10), borderColors: top(borderColors, 5), cssColorVars: Object.fromEntries(Object.entries(cssVars).slice(0, 40)),
    hero, nav, headings, ctas, sections,
    media: { imageCount: imgs.length, videoCount: allVideos.length, visibleUniqueVideos: videos.length, iframes, images, videos, backgroundImages: bgImages },
  });
})()

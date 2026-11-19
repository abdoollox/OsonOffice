// «Oson Darslar» Mini App — Oson Kassa kursi darslarining jarayoni (faqat ko'rish).
// Ma'lumot: data.json (yasash.mjs). Holat kodlari: t tayyor, j jarayonda, k to'xtab turibdi, - kerak emas, bo'sh — rejada.
const tg = window.Telegram?.WebApp?.initData ? window.Telegram.WebApp : null; // Telegram tashqarisida (brauzerda) — null
const ilova = document.getElementById('ilova');
const BOSQICH = [
  ['ssenariy', 'Ssenariy'], ['sahna', 'Sahna'], ['promo', 'Promo'], ['texnik', 'Texnik'],
  ['ovoz', 'Ovoz'], ['yigish', "Yig'ish"], ['tasdiq', "Abdulloh tasdig'i"],
];
const HOLAT = { t: 'Tayyor', j: 'Jarayonda', k: "To'xtab turibdi", '-': 'Kerak emas', '': 'Rejada' };
const FB_HOLAT = { bajarildi: 'Bajarildi', jarayonda: 'Jarayonda', kutilyapti: 'Kutilyapti' };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const sana = (s) => (s ? s.slice(8, 10) + '.' + s.slice(5, 7) : '');
const ok = '<svg class="ik" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M20 6L9 17l-5-5"/></svg>';
const strelka = '<svg class="ik" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="m9 18l6-6l-6-6"/></svg>';

let D = null, xom = '';
let tab = (() => { try { return localStorage.getItem('darslar-tab') || 'ishda'; } catch { return 'ishda'; } })();

if (tg) {
  tg.ready(); tg.expand();
  const mavzu = () => document.documentElement.setAttribute('data-theme', tg.colorScheme === 'dark' ? 'dark' : 'light');
  mavzu(); tg.onEvent('themeChanged', mavzu);
  tg.BackButton.onClick(() => { location.hash = ''; });
} else if (matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.setAttribute('data-theme', 'dark');

const vaqtYoz = (s) => { const t = new Date(new Date(s).getTime() + 5 * 3600e3).toISOString(); return t.slice(8, 10) + '.' + t.slice(5, 7) + ' ' + t.slice(11, 16); }; // Toshkent vaqti
// «Ko'rish»: video va ssenariy loyihasi — bot shu kompyuterdan chatga yuboradi (deep link /start v_<qism>_<1-17>); ssenariy bazasida bori — sahifada
const BOT = 'https://t.me/osonprojects_bot?start=';
const KORISH = { ssenariy: 'ssenariy', sahna: 'sahna', promo: 'promo', texnik: 'texnik', yigish: 'toliq' };
function korishHavola(d, k) {
  const v = d[k] ?? '';
  if (!KORISH[k] || (v !== 't' && v !== 'j')) return '';
  const kod = d.id.replace('.', '-');
  if (k === 'ssenariy' && d.ssenariyHolat) return `<a class="korish" data-tashqi href="https://office.osonacademy.uz/ssenariy/#d${kod}">Ssenariyni ochish</a>`;
  const nom = k === 'yigish' ? "To'liq darsni ko'rish" : k === 'ssenariy' ? 'Ssenariyni olish' : "Ko'rish";
  return `<a class="korish" data-bot href="${BOT}v_${KORISH[k]}_${kod}">▶ ${nom}</a>`;
}
const darsNomi = (d) => `${d.id} ${d.nomi}`;
const darsIdlar = (s) => String(s || '').split(/[,;\s]+/).filter((x) => /^\d+\.\d+$/.test(x));
function guruh(d) {
  if (d.tasdiq === 't') return 'tayyor';
  if (d.yigish === 't') return 'pm';
  if (BOSQICH.some(([k]) => d[k] && d[k] !== '-')) return 'ishda';
  return 'rejada';
}
// hozirgi bosqich: birinchi tayyor bo'lmagani
const hozirgi = (d) => BOSQICH.find(([k]) => d[k] !== 't' && d[k] !== '-');
const kreditlar = (d) => D.kreditlar.filter((k) => k.holat === 'kutilyapti' && darsIdlar(k.dars).includes(d.id));
const fidbeklar = (d) => D.fidbeklar.filter((f) => darsIdlar(f.dars).includes(d.id));
const ochiqFb = (d) => fidbeklar(d).filter((f) => f.holat !== 'bajarildi');

function holatJumla(d) {
  const g = guruh(d);
  if (g === 'tayyor') return `Tayyor${d.tayyor_sana ? ' · ' + sana(d.tayyor_sana) : ''}`;
  if (g === 'pm') return "To'liq yig'ilgan · Abdulloh tasdig'ida";
  if (g === 'rejada') return `Rejada · ${sana(d.reja_sana)}`;
  const h = hozirgi(d);
  return h ? `${h[1]} — ${HOLAT[d[h[0]]].toLowerCase()}` : 'Jarayonda';
}

function belgilar(d) {
  return `<ol class="belgilar" aria-label="Bosqichlar">${BOSQICH.map(([k, nom]) => {
    const v = d[k] ?? '';
    const kl = v === 't' ? 't' : v === 'j' ? 'j' : v === 'k' ? 'k' : v === '-' ? 'yoq' : '';
    return `<li class="${kl}" title="${nom}: ${HOLAT[v] || v}"><span class="nuqta">${v === 't' ? ok : ''}</span><span class="b-nom">${nom}</span></li>`;
  }).join('')}</ol>`;
}

function qator(d) {
  const kr = kreditlar(d), fb = ochiqFb(d);
  const g = guruh(d);
  const teglar = [
    kr.length ? `<span class="teg kredit">Kredit ruxsati</span>` : '',
    fb.length ? `<span class="teg ochiq">${fb.length} fidbek ochiq</span>` : '',
  ].join('');
  return `<a class="qator ${g}" href="#d=${encodeURIComponent(d.id)}">
    <span class="chiziq"></span>
    <span class="qator-ich">
      <span class="qator-nom">${esc(darsNomi(d))}</span>
      <span class="qator-holat">${esc(holatJumla(d))}</span>
      ${teglar ? `<span class="teglar">${teglar}</span>` : ''}
      ${g === 'rejada' ? '' : belgilar(d)}
    </span>
    ${strelka}
  </a>`;
}

function fbKarta(f, darsBilan) {
  const d = darsBilan ? darsIdlar(f.dars).map((id) => D.darslar.find((x) => x.id === id)).filter(Boolean) : [];
  return `<li class="fb ${esc(f.holat)}">
    <div class="fb-tepa"><span class="teg h-${esc(f.holat)}">${esc(FB_HOLAT[f.holat] || f.holat)}</span>
      <span class="fb-sana">${esc(f.sana)}${f.qayerdan ? ' · ' + (f.qayerdan === 'bot' ? 'Telegram' : 'Kompyuter') : ''}</span></div>
    ${d.length ? `<a class="fb-dars" href="#d=${encodeURIComponent(d[0].id)}">${esc(d.map(darsNomi).join(', '))}</a>` : ''}
    <p class="fb-matn">${esc(f.matn)}</p>
    ${f.natija ? `<p class="fb-natija">→ ${esc(f.natija)}</p>` : ''}
  </li>`;
}

function kreditKarta(k) {
  return `<li class="kr-karta">
    <div class="kr-tepa"><b>${esc(k.kredit)} kredit</b><span class="kr-sana">${esc(sana(k.sana))}</span></div>
    <p>${esc(k.nima)}</p>
    <p class="kr-dars">${esc(darsIdlar(k.dars).map((id) => { const d = D.darslar.find((x) => x.id === id); return d ? darsNomi(d) : id; }).join(' · '))}</p>
    ${k.izoh ? `<p class="kr-izoh">${esc(k.izoh)}</p>` : ''}
  </li>`;
}

function royxat() {
  tg?.BackButton.hide();
  const g = { ishda: [], pm: [], tayyor: [], rejada: [] };
  for (const d of D.darslar) g[guruh(d)].push(d);
  const kutKr = D.kreditlar.filter((k) => k.holat === 'kutilyapti');
  const ochiq = D.fidbeklar.filter((f) => f.holat !== 'bajarildi');
  const tablar = [['ishda', 'Ishda', g.ishda.length], ['pm', 'Tasdiqda', g.pm.length], ['tayyor', 'Tayyor', g.tayyor.length],
    ['rejada', 'Rejada', g.rejada.length], ['fidbek', 'Fidbek', ochiq.length]];
  let tana;
  if (tab === 'fidbek') {
    const tartib = [...D.fidbeklar].sort((a, b) => (a.holat === 'bajarildi') - (b.holat === 'bajarildi') || String(b.sana).localeCompare(a.sana));
    tana = tartib.length ? `<ul class="fb-royxat">${tartib.map((f) => fbKarta(f, true)).join('')}</ul>` : '<p class="bosh">Fidbek yo\'q.</p>';
  } else {
    const r = g[tab] || [];
    tana = r.length ? r.map(qator).join('') : '<p class="bosh">Bu yerda dars yo\'q.</p>';
  }
  ilova.innerHTML = `<main>
    <header class="tepa">
      <h1>Oson Kassa kursi</h1>
      <p class="osti">${D.darslar.length} dars · tayyor ${g.tayyor.length} · tasdiqda ${g.pm.length} · ishda ${g.ishda.length}</p>
    </header>
    ${kutKr.length ? `<section class="kutish">
      <h2>Ruxsatingiz kerak</h2>
      <ul class="kr-royxat">${kutKr.map(kreditKarta).join('')}</ul>
      <p class="kut-izoh">Ruxsat — botga yozing (masalan: «128 kreditga ruxsat»).</p>
    </section>` : ''}
    <nav class="tablar" role="tablist">${tablar.map(([k, nom, n]) =>
      `<button role="tab" data-tab="${k}" aria-selected="${tab === k}">${nom} <b>${n}</b></button>`).join('')}</nav>
    ${tana}
    <p class="yangi">Yangilandi: ${esc(vaqtYoz(D.yangilandi))}</p>
  </main>`;
  ilova.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => {
    tab = b.dataset.tab; try { localStorage.setItem('darslar-tab', tab); } catch {}
    royxat();
  });
}

function dars(id) {
  const d = D.darslar.find((x) => x.id === id);
  if (!d) { location.hash = ''; return; }
  tg?.BackButton.show();
  const kr = kreditlar(d), fb = fidbeklar(d);
  const h = hozirgi(d);
  const qadamlar = BOSQICH.map(([k, nom]) => {
    const v = d[k] ?? '';
    let ich = '';
    if (k === 'sahna' && d.kadrlar.length) {
      ich = `<ul class="kadrlar">${d.kadrlar.map((x) => `<li class="kadr ${x.holat === 't' ? 't' : x.holat === 'j' ? 'j' : x.holat === 'k' ? 'k' : ''}">
        <span class="kadr-n">${x.k}-kadr</span>
        <span class="kadr-ich"><b>${esc(HOLAT[x.holat ?? ''] || x.holat)}</b>${x.model ? ` · ${esc(x.model)}` : ''}${x.izoh ? `<br>${esc(x.izoh)}` : ''}</span>
      </li>`).join('')}</ul>`;
    }
    if (k === 'ssenariy' && d.muammo) ich = `<p class="q-izoh">${esc(d.muammo)}</p>`;
    return `<li class="qadam ${v === 't' ? 't' : v === 'j' ? 'j' : v === 'k' ? 'k' : v === '-' ? 'yoq' : ''}${h && h[0] === k ? ' hozir' : ''}">
      <span class="nuqta">${v === 't' ? ok : ''}</span>
      <div class="q-ich"><div class="q-nom">${nom} <span class="q-holat">${HOLAT[v] || v}</span></div>${ich}${korishHavola(d, k)}</div>
    </li>`;
  }).join('');
  ilova.innerHTML = `<main>
    ${tg ? '' : '<a class="orqaga" href="#">← Barcha darslar</a>'}
    <header class="tepa">
      <p class="osti">${esc(d.modul)} · reja ${sana(d.reja_sana)}</p>
      <h1>${esc(darsNomi(d))}</h1>
      <p class="holat-katta ${guruh(d)}">${esc(holatJumla(d))}</p>
      ${d.izoh ? `<p class="izoh">${esc(d.izoh)}</p>` : ''}
    </header>
    ${kr.length ? `<section class="kutish"><h2>Ruxsatingiz kerak</h2><ul class="kr-royxat">${kr.map(kreditKarta).join('')}</ul></section>` : ''}
    <section><h2>Bosqichlar</h2><ol class="yol">${qadamlar}</ol></section>
    <section><h2>Fidbeklar</h2>${fb.length ? `<ul class="fb-royxat">${fb.map((f) => fbKarta(f, false)).join('')}</ul>` : '<p class="bosh">Bu darsga fidbek yozilmagan.</p>'}</section>
  </main>`;
  ilova.querySelectorAll('a[data-bot], a[data-tashqi]').forEach((x) => x.onclick = (e) => {
    if (!tg) return; // brauzerda oddiy havola
    e.preventDefault();
    if (x.dataset.bot !== undefined) { tg.openTelegramLink(x.href); tg.close(); } else tg.openLink(x.href);
  });
  scrollTo(0, 0);
}

function chiz() {
  if (!D) return;
  const m = /^#d=(.+)$/.exec(location.hash);
  m ? dars(decodeURIComponent(m[1])) : royxat();
}
addEventListener('hashchange', chiz);

async function yukla() {
  try {
    const r = await fetch('data.json?t=' + Date.now(), { cache: 'no-store' });
    const matn = await r.text();
    if (matn === xom) return; // o'zgarmagan bo'lsa qayta chizilmaydi (scroll joyida qoladi)
    xom = matn; D = JSON.parse(matn);
    chiz();
  } catch (e) {
    if (!D) ilova.innerHTML = `<main><p class="bosh">Ma'lumot ochilmadi: ${esc(e.message)}</p></main>`;
  }
}
yukla();
// ochiq turganda ham yangilanib tursin (push'dan 1–2 daqiqada data.json yangilanadi)
setInterval(() => { if (document.visibilityState === 'visible') yukla(); }, 60000);

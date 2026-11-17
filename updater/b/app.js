// Oson Updater Mini App — B varianti (solishtirish uchun; A — ../app.js, Broom).
// Dizayn: UI UX Pro Max skill — "Logistics/Delivery": posilka kuzatuvidek. Update sahifasida 5 qadam vertikal yo'l bo'lib turadi,
// har qadamning materiali o'z ichida (Material — PM fayllari, Savollar — savol va javoblar, Ssenariy — kadrli sahnalar).
// Ma'lumot A bilan bir xil: updater-api.osonacademy.uz/api/ishlar.
import { IK } from '../ikonlar.js';

const API = 'https://updater-api.osonacademy.uz/api';
const tg = window.Telegram?.WebApp;
const INIT = tg?.initData || '';
const ilova = document.getElementById('ilova');
const ik = (n) => `<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">${IK[n] || ''}</svg>`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function mavzu() {
  document.documentElement.dataset.theme = tg?.colorScheme === 'dark' ? 'dark' : 'light';
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim();
  try { tg?.setHeaderColor(bg); tg?.setBackgroundColor(bg); } catch {}
}
tg?.ready(); tg?.expand(); mavzu(); tg?.onEvent?.('themeChanged', mavzu);

const QADAMLAR = [
  { id: 'material', nom: 'Material', ich: ['qabul', 'transkript'], izoh: 'PM funksiya haqida ovoz, video yoki matn yuboradi' },
  { id: 'savollar', nom: 'Savollar', ich: ['tahlil', 'savollar'], izoh: "Agent tushunmagan joylarini so'raydi" },
  { id: 'ssenariy', nom: 'Ssenariy', ich: ['loyiha-tasdiq'], izoh: 'Video sahnalari va diktor matni — PM tasdiqlaydi' },
  { id: 'video', nom: 'Video', ich: ['yasash', 'ovoz', 'render', 'tekshiruv', 'tuzatish'], izoh: "Agent videoni yasaydi, PM va QA ko'radi" },
  { id: 'elon', nom: "E'lon", ich: ['elon-materiallari', 'elon'], izoh: 'Post tayyorlanadi, ruxsat bilan kanalga chiqadi' },
];
const ssenariyda = (i) => i.navbatdagi === 'savollar' && !!i.loyiha;
// hozirgi holat → bir jumla; kut: odamdan javob kutilyapti
function holat(i) {
  const javobsiz = i.savollar.filter((s) => s.javob == null).length;
  if (ssenariyda(i)) return { matn: `Ssenariy loyihasi tayyor, ${javobsiz} ta savol qoldi`, kut: true, tugma: 'Chatda javob berish' };
  if (!i.navbatdagi) return { matn: "E'lon qilindi", tayyor: true };
  if (i.bosqichlar[i.navbatdagi]?.holat === 'xato') return { matn: "To'xtab qoldi — Abdulloh ko'rib chiqadi", xato: true };
  if (i.topshirildi && i.topshirildi.bosqich === i.navbatdagi) return { matn: `Javob bo'lmadi — mas'uliyat ${i.topshirildi.kimga.join(', ')} ga o'tdi`, xato: true };
  return {
    qabul: { matn: 'Agent materialni qabul qilyapti' },
    transkript: { matn: "Agent materialni o'qiyapti" },
    tahlil: { matn: 'Agent ssenariy va savollarni tayyorlayapti' },
    savollar: { matn: `${javobsiz} ta savolga javob kerak`, kut: true, tugma: 'Chatda javob berish' },
    'loyiha-tasdiq': { matn: 'Ssenariyni tasdiqlang yoki tuzating', kut: true, tugma: 'Chatda tasdiqlash' },
    yasash: { matn: 'Agent video tayyorlayapti' }, ovoz: { matn: 'Agent video tayyorlayapti' }, render: { matn: 'Agent video tayyorlayapti' },
    tekshiruv: { matn: "Videoni ko'rib, fikr bildiring", kut: true, tugma: 'Chatda fikr bildirish' },
    tuzatish: { matn: "Agent izohlar bo'yicha tuzatyapti" },
    'elon-materiallari': { matn: 'Agent post va matn tayyorlayapti' },
    elon: { matn: "E'longa ruxsat bering", kut: true, tugma: 'Chatda ruxsat berish' },
  }[i.navbatdagi] || { matn: 'Ishlanyapti' };
}
const qadamHol = (i, q) => {
  if (ssenariyda(i)) return ['material', 'savollar'].includes(q.id) ? 't' : q.id === 'ssenariy' ? 'h' : '';
  if (q.ich.every((id) => i.bosqichlar[id]?.holat === 'tayyor')) return 't';
  return q.ich.includes(i.navbatdagi) ? 'h' : '';
};
const qadamVaqt = (i, q) => q.ich.map((id) => i.bosqichlar[id]?.vaqt).filter(Boolean).sort().at(-1)?.slice(5, 16).replace('-', '.') || '';
const mahsulot = (m) => (m === 'kassa' ? 'Oson Kassa' : m === 'price' ? 'Oson Price' : '');
const nomi = (i) => i.sarlavha || i.nom;
const turi = (h) => (h.kut ? 'kut' : h.tayyor ? 'tayyor' : h.xato ? 'xato' : '');
const bosh = (ikon, b, p) => `<div class="bosh-ekran">${ik(ikon)}<b>${esc(b)}</b><p>${esc(p)}</p></div>`;
// A | B — solishtirish davrida; Telegram ma'lumoti (initData) bir saytda sahifadan sahifaga o'tadi
const ab = () => `<nav class="ab" aria-label="Variant"><div><a href="../?ish=${encodeURIComponent(S.ish || '')}">A</a><span aria-current="page">B</span></div></nav>`;

// ── Ro'yxat ──
function qatorHtml(i) {
  const h = holat(i);
  return `<button class="qator ${turi(h)}" data-ish="${esc(i.nom)}"><span class="chiziq"></span>
    <div><div class="qator-nom">${esc(nomi(i))} <span class="qator-dastur">· ${mahsulot(i.mahsulot)}</span></div>
      <p class="qator-holat">${esc(h.matn)}</p>
      <div class="segment" aria-hidden="true">${QADAMLAR.map((q) => `<i class="${qadamHol(i, q)}"></i>`).join('')}</div></div>${ik('chevron-right')}</button>`;
}
function royxatChiz() {
  const ishlar = S.data.ishlar;
  if (!ishlar.length) return (ilova.innerHTML = `<main>${ab()}${bosh('inbox', "Hali update yo'q", "PM chatda yangi funksiya haqida yozsa, u shu yerda chiqadi.")}</main>`);
  const kut = ishlar.filter((i) => holat(i).kut);
  if (!kut.length) S.filtr = 'hammasi';
  const korin = S.filtr === 'kut' ? kut : ishlar;
  ilova.innerHTML = `<main>${ab()}
    <h1 class="sarlavha">Update'lar</h1>
    <div class="filtr" role="group" aria-label="Saralash">
      <button data-f="kut" aria-pressed="${S.filtr === 'kut'}" ${kut.length ? '' : 'disabled'}>Sizni kutyapti <b>${kut.length}</b></button>
      <button data-f="hammasi" aria-pressed="${S.filtr === 'hammasi'}">Hammasi <b>${ishlar.length}</b></button>
    </div>
    ${korin.map(qatorHtml).join('')}</main>`;
  ilova.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { S.filtr = b.dataset.f; chiz(); }));
  ilova.querySelectorAll('[data-ish]').forEach((b) => (b.onclick = () => och(b.dataset.ish)));
}

// ── Update sahifasi: qadamlar ichidagi narsalar ──
function materialHtml(i) {
  if (!i.materiallar?.length) return '';
  return `<ul class="quti ro">${i.materiallar.map((m) => {
    const nom = { video: 'Video', ovoz: 'Ovozli xabar', rasm: 'Rasm' }[m.tur] || 'Matn';
    const ichi = `${ik({ video: 'video', ovoz: 'mic', rasm: 'image' }[m.tur] || 'file-text')}<b>${nom}</b><span>${esc(m.vaqt.slice(5))}${m.tur !== 'matn' ? ` · ${m.mb} MB` : ''}</span>`;
    return `<li>${m.havola ? `<a class="mat" href="${esc(m.havola)}" data-tg>${ichi}${ik('chevron-right')}</a>` : `<div class="mat">${ichi}</div>`}
      ${m.matn ? `<details class="ochiq"><summary>${m.tur === 'matn' ? 'Matnni ochish' : 'Aytilganlar'}</summary><div class="matn">${esc(m.matn)}</div></details>` : ''}</li>`;
  }).join('')}</ul>`;
}
function savolHtml(i) {
  if (!i.savollar?.length) return '';
  return `<ul class="quti ro">${i.savollar.map((s) => `<li class="savol${s.javob != null ? ' j' : ''}">${ik(s.javob != null ? 'circle-check' : 'message-circle')}
    <div><p>${esc(s.savol)}</p>${s.javob != null ? `<p class="savol-javob"><b>Javob:</b> ${esc(s.javob)}</p>` : ''}</div></li>`).join('')}</ul>`;
}
function sahnaHtml(i) {
  const s = i.sahnalar || [];
  const tasma = s.length ? `<div class="tasma" role="list" aria-label="Sahnalar">${s.map((x) => `<article class="kadr" role="listitem">
      <div class="kadr-rasm">${x.rasm ? `<img src="${x.rasm}" alt="" loading="lazy">` : `<p>${esc(x.ekran)}</p>`}<span class="kadr-n">${esc(x.n)}</span></div>
      <div class="kadr-matn"><b>${esc(x.nom)}</b>${x.rasm && x.ekran ? `<p class="kadr-ekran">${esc(x.ekran)}</p>` : ''}${x.diktor ? `<p>«${esc(x.diktor)}»</p>` : ''}</div></article>`).join('')}</div>
    <p class="sanoq">${s.length} sahna — chapga suring</p>` : '';
  const toliq = i.loyiha ? `<details class="ochiq quti" style="padding: var(--s3)"><summary>Ssenariyning to'liq matni</summary><div class="matn">${esc(i.loyiha)}</div></details>` : '';
  // ssenariy yozilgan, lekin savol qolgan — javobsizlari shu (joriy) qadamda ham ko'rinadi
  const qolgan = ssenariyda(i) ? savolHtml({ savollar: i.savollar.filter((x) => x.javob == null) }) : '';
  return qolgan + tasma + toliq;
}
const ICHI = { material: materialHtml, savollar: savolHtml, ssenariy: sahnaHtml };

function ishChiz() {
  const i = S.data.ishlar.find((x) => x.nom === S.ish);
  if (!i) { S.ish = null; return chiz(); }
  const h = holat(i), joriy = QADAMLAR.find((q) => qadamHol(i, q) === 'h');
  const orqa = S.royxatdan ? `<button class="orqa" id="orqa" aria-label="Hamma update'lar">${ik('arrow-left')}</button>` : '';
  const yorliq = h.kut ? 'Sizni kutyapti' : h.tayyor ? 'Tayyor' : h.xato ? "To'xtadi" : 'Jarayonda';
  ilova.innerHTML = `<main>${ab()}
    <div class="tepa">${orqa}<div><span class="chip">${esc(mahsulot(i.mahsulot))}</span><h1>${esc(nomi(i))}</h1></div></div>
    <section class="hero ${turi(h)}" aria-live="polite">
      <div class="hero-yorliq">${ik(h.kut ? 'clock' : h.tayyor ? 'circle-check' : h.xato ? 'circle-exclamation-point' : 'loader-circle')}${yorliq}</div>
      <p class="hero-matn">${esc(h.matn)}</p>
      ${joriy ? `<p class="hero-qadam">${QADAMLAR.indexOf(joriy) + 1}-qadam / 5 · ${joriy.nom}</p>` : ''}
      ${h.kut ? `<button class="tugma" id="chat">${ik('message-circle')}${esc(h.tugma)}</button>` : ''}
    </section>
    <ol class="yol" aria-label="Qadamlar">${QADAMLAR.map((q, n) => {
      const hol = qadamHol(i, q), ichi = ICHI[q.id]?.(i) || '';
      // joriy qadam doim ochiq; tayyorlari — bosilsa ochiladi; keyingilari — izoh bilan
      const ochiq = hol === 'h' || S.ochiq.has(q.id);
      const bosh = `<span class="yq-nom">${q.nom}</span><span class="yq-vaqt">${hol === 't' ? esc(qadamVaqt(i, q)) : hol === 'h' ? 'hozir' : ''}</span>`;
      return `<li class="yq ${hol}${hol === 'h' && h.kut ? ' kut' : ''}" ${hol === 'h' ? 'aria-current="step"' : ''}>
        <span class="nuqta">${hol === 't' ? ik('check') : n + 1}</span>
        ${ichi && hol === 't' ? `<button class="yq-bosh" data-q="${q.id}" aria-expanded="${ochiq}">${bosh}${ik('chevron-right')}</button>` : `<div class="yq-bosh">${bosh}</div>`}
        ${ichi && ochiq ? `<div class="yq-ich">${ichi}</div>` : hol === '' ? `<p class="yq-izoh">${q.izoh}</p>` : ''}
      </li>`;
    }).join('')}</ol>
    ${S.data.ega ? `<details class="ichki" id="ichki" ${S.ichkiOchiq ? 'open' : ''}><summary>${ik('list-checks')}Jamoa uchun: 12 ichki bosqich</summary>
      <ol>${S.data.bosqichlar.map((b) => { const s = i.bosqichlar[b.id]; return `<li class="${s?.holat === 'tayyor' ? 't' : b.id === i.navbatdagi ? 'j' : ''}">${esc(b.nomi)}${s?.vaqt ? ` · ${esc(s.vaqt.slice(5, 16))}` : ''}</li>`; }).join('')}</ol></details>` : ''}
  </main>`;
  document.getElementById('orqa')?.addEventListener('click', royxatga);
  document.getElementById('chat')?.addEventListener('click', () => (tg?.close ? tg.close() : history.back()));
  document.getElementById('ichki')?.addEventListener('toggle', (e) => (S.ichkiOchiq = e.target.open));
  ilova.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { S.ochiq.has(b.dataset.q) ? S.ochiq.delete(b.dataset.q) : S.ochiq.add(b.dataset.q); chiz(); }));
  ilova.querySelectorAll('a[data-tg]').forEach((a) => a.addEventListener('click', (e) => { if (tg?.openTelegramLink) { e.preventDefault(); tg.openTelegramLink(a.href); } }));
}

// ── navigatsiya ──
const S = { data: null, ish: null, royxatdan: false, filtr: 'kut', ochiq: new Set(), ichkiOchiq: false };
function och(nom) { S.ish = nom; S.royxatdan = true; S.ochiq.clear(); chiz(); scrollTo(0, 0); }
function royxatga() { S.ish = null; chiz(); scrollTo(0, 0); }
tg?.BackButton?.onClick(royxatga);
function chiz() {
  if (!S.data) return;
  if (S.ish) { tg?.BackButton?.show(); ishChiz(); } else { tg?.BackButton?.hide(); royxatChiz(); }
}
async function ol(birinchi) {
  try {
    const r = await fetch(`${API}/ishlar`, { cache: 'no-store', headers: { 'X-Init-Data': INIT } });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.xato || r.status), { kod: r.status });
    const ozgardi = JSON.stringify(j) !== JSON.stringify(S.data);
    S.data = j;
    if (ozgardi) { const y = scrollY; chiz(); if (!birinchi) scrollTo(0, y); }
  } catch (e) {
    if (!birinchi && S.data) return;
    ilova.innerHTML = `<main>${e.kod === 403 ? bosh('lock', "Ruxsat yo'q", "Sizga hali ruxsat berilmagan. Abdullohdan so'rang.")
      : e.kod === 401 ? bosh('lock', 'Telegram orqali oching', "Sahifa Oson Updater xabaridagi «Holatni ko'rish» tugmasi bilan ochiladi.")
      : bosh('circle-exclamation-point', "Ulanib bo'lmadi", 'Internetni tekshirib, sahifani qayta oching.')}</main>`;
  }
}
if (!INIT) {
  ilova.innerHTML = `<main>${bosh('lock', 'Telegram orqali oching', "Sahifa Oson Updater xabaridagi «Holatni ko'rish» tugmasi bilan ochiladi.")}</main>`;
} else {
  { const q = new URLSearchParams(location.search); S.ish = q.has('ish') ? q.get('ish') || null : tg?.initDataUnsafe?.start_param || null; }
  ilova.innerHTML = `<main><div class="skelet"></div><div class="skelet"></div><div class="skelet"></div></main>`;
  ol(true);
  setInterval(() => ol(false), 10000);
}

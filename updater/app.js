// Oson Updater Mini App — "buyurtma qayerda" sahifasi. Gaplashish faqat Telegram'da; bu yerda faqat holat va bitta kerakli amal.
// PM 5 qadamni ko'radi (Material → Savollar → Ssenariy → Video → E'lon); 12 ichki bosqich — faqat egaga ("Batafsil").
// Ma'lumot: updater-api.osonacademy.uz (updater/api/server.py). Dizayn: Broom (updater/.broom/), tokens.css.
import { IK } from './ikonlar.js';

const API = 'https://updater-api.osonacademy.uz/api';
const tg = window.Telegram?.WebApp;
const INIT = tg?.initData || '';
const ilova = document.getElementById('ilova');
const ik = (n) => `<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">${IK[n]}</svg>`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function mavzu() {
  document.documentElement.dataset.theme = tg?.colorScheme === 'dark' ? 'dark' : 'light';
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--ds-color-bg-default').trim();
  try { tg?.setHeaderColor(bg); tg?.setBackgroundColor(bg); } catch {}
}
tg?.ready(); tg?.expand(); mavzu(); tg?.onEvent?.('themeChanged', mavzu);

// PM ko'radigan 5 qadam va ularning ichidagi ichki bosqichlar
const QADAMLAR = [
  { nom: 'Material', ich: ['qabul', 'transkript'] },
  { nom: 'Savollar', ich: ['tahlil', 'savollar'] },
  { nom: 'Ssenariy', ich: ['loyiha-tasdiq'] },
  { nom: 'Video', ich: ['yasash', 'ovoz', 'render', 'tekshiruv', 'tuzatish'] },
  { nom: "E'lon", ich: ['elon-materiallari', 'elon'] },
];
// hozirgi ichki bosqich → bir jumla; kerak: true — odamdan javob kutilyapti
// ssenariy loyihasi yozilgan, faqat bir-ikki savol qolgan — PM uchun bu allaqachon "Ssenariy" qadami
const ssenariyda = (i) => i.navbatdagi === 'savollar' && !!i.loyiha;
function jumla(i) {
  const javobsiz = i.savollar.filter((s) => s.javob == null).length;
  const h = i.bosqichlar[i.navbatdagi]?.holat;
  if (ssenariyda(i)) return { matn: `Ssenariy loyihasi tayyor · ${javobsiz} ta savol qoldi`, kerak: true, tugma: 'Chatda javob berish' };
  if (!i.navbatdagi) return { matn: "E'lon qilindi", kerak: false, tayyor: true };
  if (h === 'xato') return { matn: "To'xtab qoldi. Abdulloh ko'rib chiqadi", kerak: false, xato: true };
  if (i.topshirildi && i.topshirildi.bosqich === i.navbatdagi) return { matn: `Javob bo'lmadi. Mas'uliyat ${i.topshirildi.kimga.join(', ')} ga o'tdi`, kerak: false, xato: true };
  return {
    qabul: { matn: 'Agent materialni qabul qilyapti' },
    transkript: { matn: "Agent materialni o'qiyapti" },
    tahlil: { matn: 'Agent ssenariy va savollarni tayyorlayapti' },
    savollar: { matn: `PM javobi kerak · ${javobsiz} ta savol`, kerak: true, tugma: 'Chatda javob berish' },
    'loyiha-tasdiq': { matn: "Ssenariy tayyor. PM tasdig'i kerak", kerak: true, tugma: 'Chatda tasdiqlash' },
    yasash: { matn: 'Agent video tayyorlayapti' }, ovoz: { matn: 'Agent video tayyorlayapti' }, render: { matn: 'Agent video tayyorlayapti' },
    tekshiruv: { matn: "Video tayyor. PM va QA ko'rib chiqsin", kerak: true, tugma: 'Chatda fikr bildirish' },
    tuzatish: { matn: 'Agent izohlar bo\'yicha tuzatyapti' },
    'elon-materiallari': { matn: 'Agent post va matn tayyorlayapti' },
    elon: { matn: "E'longa ruxsat kerak", kerak: true, tugma: 'Chatda ruxsat berish' },
  }[i.navbatdagi] || { matn: 'Ishlanyapti' };
}
const qadamHol = (i, q) => {
  if (ssenariyda(i)) return q.nom === 'Material' || q.nom === 'Savollar' ? 'tayyor' : q.nom === 'Ssenariy' ? 'hozir' : 'keyin';
  if (q.ich.every((id) => i.bosqichlar[id]?.holat === 'tayyor')) return 'tayyor';
  if (q.ich.includes(i.navbatdagi)) return 'hozir';
  return 'keyin';
};
const mahsulot = (m) => (m === 'kassa' ? 'Oson Kassa' : m === 'price' ? 'Oson Price' : '');
const nomi = (i) => i.sarlavha || i.nom;
const ekran = (ikon, sarlavha, matn, cls = '') => `<div class="ekran ${cls}"><div class="tile">${ik(ikon)}</div><b>${esc(sarlavha)}</b><p>${esc(matn)}</p></div>`;

// 5 qadamli kuzatuv chizig'i (gorizontal — kartochkada, katta — update sahifasida)
function kuzatuv(i, katta = false) {
  const j = jumla(i);
  return `<ol class="kuzatuv${katta ? ' katta' : ''}" aria-label="Qadamlar">${QADAMLAR.map((q, n) => {
    const h = qadamHol(i, q);
    const cls = h === 'hozir' ? (j.kerak ? 'hozir kerak' : j.xato ? 'hozir xato' : 'hozir') : h;
    return `<li class="${cls}" ${h === 'hozir' ? 'aria-current="step"' : ''}><span class="belgi">${h === 'tayyor' ? ik('check') : n + 1}</span><span class="q-nom">${q.nom}</span></li>`;
  }).join('')}</ol>`;
}

// ── Ishlar ──
function kartaHtml(i) {
  const j = jumla(i);
  return `<button class="karta" data-ish="${esc(i.nom)}">
    <div class="karta-bosh"><span class="karta-nom">${esc(nomi(i))}</span><span class="karta-dastur">${mahsulot(i.mahsulot)}</span>${ik('chevron-right')}</div>
    <p class="jumla ${j.kerak ? 'kerak' : j.xato ? 'xato' : j.tayyor ? 'tayyor' : ''}">${esc(j.matn)}</p>
    ${kuzatuv(i)}
  </button>`;
}
function ishlarChiz() {
  const ishlar = S.data.ishlar;
  if (!ishlar.length) return (ilova.innerHTML = `<main>${ekran('inbox', "Hali update yo'q", "PM chatda yangi funksiya haqida yozsa, u shu yerda chiqadi.")}</main>`);
  const kut = ishlar.filter((i) => jumla(i).kerak), qolgan = ishlar.filter((i) => !jumla(i).kerak);
  ilova.innerHTML = `<main>
    <h1>Update'lar</h1>
    ${kut.length ? `<h2>Sizni kutyapti</h2>${kut.map(kartaHtml).join('')}` : ''}
    ${qolgan.length ? `<h2>${kut.length ? 'Jarayonda' : 'Hammasi jarayonda'}</h2>${qolgan.map(kartaHtml).join('')}` : ''}
  </main>`;
  ilova.querySelectorAll('[data-ish]').forEach((el) => (el.onclick = () => och(el.dataset.ish)));
}

// ── Update sahifasi ──
function ishChiz() {
  const i = S.data.ishlar.find((x) => x.nom === S.ish);
  if (!i) { S.ish = null; return chiz(); }
  const j = jumla(i);
  const orqa = S.royxatdan ? `<button class="orqa" id="orqa" aria-label="Hamma update'lar">${ik('arrow-left')}</button>` : '';
  ilova.innerHTML = `<main>
    <div class="bosh">${orqa}<div><h1>${esc(nomi(i))}</h1><p class="izoh">${mahsulot(i.mahsulot)}</p></div></div>
    <section class="holat-blok ${j.kerak ? 'kerak' : ''}" aria-live="polite">
      ${kuzatuv(i, true)}
      <p class="jumla katta ${j.kerak ? 'kerak' : j.xato ? 'xato' : j.tayyor ? 'tayyor' : ''}">${esc(j.matn)}</p>
      ${j.kerak ? `<button class="tugma asosiy toliq" id="chat">${ik('message-circle')}${esc(j.tugma)}</button>` : ''}
    </section>
    ${i.materiallar?.length ? `<details class="blok" id="mat" ${S.matOchiq ? 'open' : ''}><summary>${ik('folder')}PM materiallari · ${i.materiallar.length} ta${ik('chevron-right')}</summary>
      <ul class="materiallar">${i.materiallar.map((m) => `<li>${(() => { const ichi = `${ik(m.tur === 'video' ? 'video' : m.tur === 'ovoz' ? 'mic' : m.tur === 'rasm' ? 'image' : 'file-text')}<b>${esc(m.tur === 'video' ? 'Video' : m.tur === 'ovoz' ? 'Ovozli xabar' : m.tur === 'rasm' ? 'Rasm' : 'Matn')}</b><span>${esc(m.vaqt.slice(5))}${m.tur !== 'matn' ? ` · ${m.mb} MB` : ''}</span>`;
          return m.havola ? `<a class="mat-bosh tg" href="${esc(m.havola)}" data-tg>${ichi}${ik('chevron-right')}</a>` : `<div class="mat-bosh">${ichi}</div>`; })()}
        ${m.matn ? `<details class="mat-matn"><summary>${m.tur === 'matn' ? 'Matnni ochish' : 'Aytilganlar (matn)'}</summary><div class="matn">${esc(m.matn)}</div></details>` : ''}</li>`).join('')}</ul></details>` : ''}
    ${i.loyiha ? `<details class="blok" id="loy" ${S.loyihaOchiq ? 'open' : ''}><summary>${ik('file-text')}Ssenariyni o'qish${ik('chevron-right')}</summary>
      <div class="matn">${esc(i.loyiha)}</div></details>` : ''}
    ${S.data.ega ? `<details class="blok ichki" id="ichki" ${S.ichkiOchiq ? 'open' : ''}><summary>${ik('list-checks')}Batafsil: 12 ichki bosqich${ik('chevron-right')}</summary>
      <ol class="qadamlar">${S.data.bosqichlar.map((b, n) => {
        const s = i.bosqichlar[b.id], c = s?.holat === 'tayyor' ? 't' : s?.holat === 'xato' ? 'x' : b.id === i.navbatdagi ? 'j' : '';
        return `<li class="qadam ${c}"><span class="belgi">${c === 't' ? ik('check') : n + 1}</span><div><div class="qadam-nom">${esc(b.nomi)}</div>
          ${s ? `<div class="qadam-izoh">${esc([s.vaqt?.slice(5), s.izoh].filter(Boolean).join(' · '))}</div>` : ''}</div></li>`;
      }).join('')}</ol></details>` : ''}
  </main>`;
  document.getElementById('orqa')?.addEventListener('click', royxatga);
  document.getElementById('loy')?.addEventListener('toggle', (e) => (S.loyihaOchiq = e.target.open));
  document.getElementById('mat')?.addEventListener('toggle', (e) => (S.matOchiq = e.target.open));
  // material bosilsa — Telegram guruhdagi o'sha xabar ochiladi
  document.querySelectorAll('a[data-tg]').forEach((a) => a.addEventListener('click', (e) => { if (tg?.openTelegramLink) { e.preventDefault(); tg.openTelegramLink(a.href); } }));
  document.getElementById('ichki')?.addEventListener('toggle', (e) => (S.ichkiOchiq = e.target.open));
  // chatga qaytish: sahifa yopiladi, odam o'sha chatda (guruh yoki bot) javob yozadi
  document.getElementById('chat')?.addEventListener('click', () => (tg?.close ? tg.close() : history.back()));
}

// ── navigatsiya ──
const S = { data: null, ish: null, royxatdan: false, loyihaOchiq: false, ichkiOchiq: false };
function och(nom) { S.ish = nom; S.royxatdan = true; S.loyihaOchiq = false; chiz(); scrollTo(0, 0); }
function royxatga() { S.ish = null; chiz(); scrollTo(0, 0); }
tg?.BackButton?.onClick(royxatga);
function chiz() {
  if (!S.data) return;
  if (S.ish) { tg?.BackButton?.show(); ishChiz(); } else { tg?.BackButton?.hide(); ishlarChiz(); }
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
    ilova.innerHTML = `<main>${e.kod === 403 ? ekran('lock', "Ruxsat yo'q", "Sizga hali ruxsat berilmagan. Abdullohdan so'rang.")
      : e.kod === 401 ? ekran('lock', 'Telegram orqali oching', "Sahifa Oson Updater xabaridagi «Holatni ko'rish» tugmasi bilan ochiladi.")
      : ekran('circle-alert', "Ulanib bo'lmadi", 'Internetni tekshirib, sahifani qayta oching.')}</main>`;
  }
}

if (!INIT) {
  ilova.innerHTML = `<main>${ekran('lock', 'Telegram orqali oching', "Sahifa Oson Updater xabaridagi «Holatni ko'rish» tugmasi bilan ochiladi.")}</main>`;
} else {
  // qaysi update bilan ochildi: guruhdagi tugma (startapp) yoki bot chatidagi tugma (?ish=)
  S.ish = tg?.initDataUnsafe?.start_param || new URLSearchParams(location.search).get('ish') || null;
  ilova.innerHTML = `<main><h1>Update'lar</h1><div class="skelet"></div><div class="skelet"></div></main>`;
  ol(true);
  setInterval(() => ol(false), 10000);
}

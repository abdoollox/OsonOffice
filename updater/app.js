// Oson Updater Mini App: Ishlar (kutayotganlar + jarayondagilar), Ish (12 bosqich, savollar, loyiha, amallar), Suhbat (agent bilan, Telegram bilan bir xil).
// Ma'lumot: updater-api.osonacademy.uz (updater/api/server.py). Har amal agentga oddiy xabar bo'lib boradi — agent o'zi yozib qo'yadi.
import { IK } from './ikonlar.js';

const API = 'https://updater-api.osonacademy.uz/api';
const tg = window.Telegram?.WebApp;
const INIT = tg?.initData || '';
const ilova = document.getElementById('ilova');
const ik = (n, cls = 'ik') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${IK[n]}</svg>`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const md = (s) => esc(s).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');

// Telegram mavzusi: yorug'/qorong'i
function mavzu() {
  document.documentElement.dataset.theme = tg?.colorScheme === 'dark' ? 'dark' : 'light';
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--ds-color-bg-default').trim();
  try { tg?.setHeaderColor(bg); tg?.setBackgroundColor(bg); } catch {}
}
tg?.ready(); tg?.expand(); mavzu(); tg?.onEvent('themeChanged', mavzu);

const so = async (yol, opt = {}) => {
  const r = await fetch(API + yol, { ...opt, cache: 'no-store', headers: { 'X-Init-Data': INIT, 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(j.xato || `Xato ${r.status}`), { kod: r.status });
  return j;
};

const S = { data: null, ekran: 'ishlar', ish: null, xabarlar: [], oxirgiId: 0, kutish: false, yuborildi: {}, tuzatish: false, loyihaOchiq: false };
const ODAM = { savollar: 'Javobingiz kerak', 'loyiha-tasdiq': 'Tasdig\'ingiz kerak', tekshiruv: 'Videoni tekshiring', elon: 'E\'longa ruxsat kerak' };

// ── holat hisobi ──
function holatOl(i) {
  const B = S.data.bosqichlar;
  const tayyor = B.filter((b) => i.bosqichlar[b.id]?.holat === 'tayyor').length;
  const nav = B.find((b) => b.id === i.navbatdagi);
  const javobsiz = i.savollar.filter((s) => s.javob == null).length;
  if (!nav) return { cls: 'tayyor', matn: 'Tayyor', tayyor, kut: false };
  const h = i.bosqichlar[nav.id]?.holat;
  if (h === 'xato') return { cls: 'xato', matn: `Xato: ${nav.nomi}`, tayyor, kut: false };
  if (nav.odam || h === 'kutilmoqda') {
    const matn = nav.id === 'savollar' ? `PM javobini kutyapti · ${javobsiz} ta savol` : nav.id === 'loyiha-tasdiq' ? 'Loyiha tasdig\'ini kutyapti'
      : nav.id === 'tekshiruv' ? 'Video PM va QA tekshiruvida' : nav.id === 'elon' ? 'E\'lon ruxsatini kutyapti' : nav.nomi;
    return { cls: 'kut', matn, tayyor, kut: true, nav };
  }
  return { cls: '', matn: `Ishlanyapti: ${nav.nomi}`, tayyor, kut: false, nav };
}
const qadamCls = (i, b) => {
  const h = i.bosqichlar[b.id]?.holat;
  if (h === 'tayyor') return 't';
  if (h === 'xato') return 'x';
  if (b.id === i.navbatdagi) return h === 'kutilmoqda' || b.odam ? 'k' : 'j';
  return '';
};
const mahsulot = (m) => (m === 'kassa' ? 'Oson Kassa' : m === 'price' ? 'Oson Price' : '');
const nomi = (i) => i.sarlavha || i.nom;
const ekran = (ikon, sarlavha, matn, cls = '') => `<div class="ekran ${cls}"><div class="tile">${ik(ikon)}</div><b>${esc(sarlavha)}</b><p>${esc(matn)}</p></div>`;

// ── Ishlar ──
function kartaHtml(i) {
  const h = holatOl(i);
  return `<button class="karta" data-ish="${esc(i.nom)}">
    <div class="karta-bosh"><span class="karta-nom">${esc(nomi(i))}</span>${ik('chevron-right')}</div>
    <div class="holat ${h.cls}"><span class="nuqta"></span>${esc(h.matn)}</div>
    <div class="chiziq" role="progressbar" aria-valuemin="0" aria-valuemax="12" aria-valuenow="${h.tayyor}" aria-label="${h.tayyor} / 12 bosqich">
      ${S.data.bosqichlar.map((b) => `<i class="${qadamCls(i, b)}"></i>`).join('')}</div>
    <div class="karta-oyoq"><span>${mahsulot(i.mahsulot)}${i.sinov ? ' · sinov' : ''} · ${h.tayyor} / 12 bosqich</span><span>${esc((i.oxirgi || '').slice(5))}</span></div>
  </button>`;
}
function ishlarChiz() {
  const ishlar = S.data.ishlar;
  if (!ishlar.length) return (ilova.innerHTML = `<main>${ekran('inbox', "Hali update yo'q", "PM botga yangi funksiya haqida yozsa, u shu yerda bosqichlari bilan chiqadi.")}</main>`);
  const kut = ishlar.filter((i) => holatOl(i).kut);
  const qolgan = ishlar.filter((i) => !holatOl(i).kut);
  ilova.innerHTML = `<main>
    <div class="bosh"><h1>Ishlar</h1></div>
    <p class="izoh">${ishlar.length} ta update · yangilandi ${esc((S.data.vaqt || '').slice(11))}</p>
    ${kut.length ? `<h2>Sizni kutyapti · ${kut.length}</h2>${kut.map(kartaHtml).join('')}` : ''}
    ${qolgan.length ? `<h2>${kut.length ? 'Jarayonda' : 'Hammasi jarayonda'}</h2>${qolgan.map(kartaHtml).join('')}` : ''}
  </main>`;
  ilova.querySelectorAll('[data-ish]').forEach((el) => (el.onclick = () => ochIsh(el.dataset.ish)));
}

// ── Ish ──
function amalHtml(i, h) {
  if (!h.kut) return '';
  if (h.nav.id === 'savollar') {
    const javobsiz = i.savollar.filter((s) => s.javob == null);
    const qolgan = javobsiz.filter((s) => !S.yuborildi[`${i.nom}:${s.id}`]).length;
    return `<section class="amal" aria-labelledby="amal-s"><p class="amal-sarlavha" id="amal-s">${qolgan ? `${qolgan} ta savolga javob kerak` : 'Hamma javoblar yuborildi'}</p>
      <p>Bilmasangiz «bilmayman» deb yozing, bu gap videoga kirmaydi.</p>
      ${javobsiz.map((s) => S.yuborildi[`${i.nom}:${s.id}`]
        ? `<div class="savol"><div class="savol-m">${esc(s.id)}. ${esc(s.savol)}</div><div class="savol-j">Yuborildi, agent yozib qo'yadi</div></div>`
        : `<div class="savol"><label class="maydon"><span>${esc(s.id)}. ${esc(s.savol)}</span>
            <textarea data-savol="${esc(s.id)}" rows="2" placeholder="Javobingiz"></textarea></label>
            <div class="tugmalar"><button class="tugma asosiy" data-javob="${esc(s.id)}" disabled>Javobni yuborish</button></div></div>`).join('')}
    </section>`;
  }
  if (h.nav.id === 'loyiha-tasdiq') {
    return `<section class="amal"><p class="amal-sarlavha">Loyiha tasdig'ingizni kutyapti</p>
      <p>Pastdagi «Ssenariy loyihasi» ni o'qing. Ma'qul bo'lsa tasdiqlang, bo'lmasa nimani o'zgartirishni yozing.</p>
      ${S.tuzatish ? `<label class="maydon"><span>Nimani o'zgartirish kerak?</span><textarea id="tuz" rows="3" placeholder="Masalan: 3-sahnada tugma nomi «Saqlash»"></textarea></label>
        <div class="tugmalar"><button class="tugma ikkinchi" id="tuz-yop">Bekor qilish</button><button class="tugma asosiy" id="tuz-yub" disabled>Tuzatishni yuborish</button></div>`
      : `<div class="tugmalar"><button class="tugma ikkinchi" id="tuz-och">Tuzatish yozish</button><button class="tugma asosiy" id="tasdiq">Tasdiqlash</button></div>`}
    </section>`;
  }
  return `<section class="amal"><p class="amal-sarlavha">${esc(ODAM[h.nav.id] || h.matn)}</p><p>Agent bilan «Suhbat» da gaplashing.</p></section>`;
}
function ishChiz() {
  const i = S.data.ishlar.find((x) => x.nom === S.ish);
  if (!i) { S.ekran = 'ishlar'; return chiz(); }
  const h = holatOl(i);
  const javobli = i.savollar.filter((s) => s.javob != null);
  ilova.innerHTML = `<main>
    <div class="bosh">${tg?.BackButton ? '' : `<button class="orqa" id="orqa" aria-label="Ishlar">${ik('arrow-left')}</button>`}<h1>${esc(nomi(i))}</h1></div>
    <p class="izoh">${mahsulot(i.mahsulot)}${i.sinov ? ' · sinov' : ''} · boshlangan ${esc(i.yaratildi || '')}</p>
    <div class="holat ${h.cls}" style="margin:0"><span class="nuqta"></span>${esc(h.matn)}</div>
    ${amalHtml(i, h)}
    <h2>Bosqichlar · ${h.tayyor} / 12</h2>
    <div class="blok"><ol class="qadamlar">${S.data.bosqichlar.map((b, n) => {
      const c = qadamCls(i, b), s = i.bosqichlar[b.id];
      const izoh = s ? [s.vaqt?.slice(5), s.izoh].filter(Boolean).join(' · ') : c === 'k' ? (ODAM[b.id] || 'Odam javobi kerak') : c === 'j' ? 'Hozir shu bosqich' : '';
      return `<li class="qadam ${c}" ${c === 'j' || c === 'k' ? 'aria-current="step"' : ''}><span class="belgi">${c === 't' ? ik('check') : n + 1}</span>
        <div><div class="qadam-nom">${esc(b.nomi)}</div>${izoh ? `<div class="qadam-izoh">${esc(izoh)}</div>` : ''}</div></li>`;
    }).join('')}</ol></div>
    ${javobli.length ? `<h2>Javob berilgan savollar · ${javobli.length} / ${i.savollar.length}</h2><div class="blok">${javobli.map((s) =>
      `<div class="savol"><div class="savol-m">${esc(s.id)}. ${esc(s.savol)}</div><div class="savol-j">${esc(s.javob)}</div></div>`).join('')}</div>` : ''}
    ${i.loyiha ? `<h2>Ssenariy loyihasi</h2><details class="blok" id="loy" ${S.loyihaOchiq ? 'open' : ''}><summary>${ik('file-text')}Loyiha matni${ik('chevron-right')}</summary>
      <div class="matn">${esc(i.loyiha)}</div></details>` : ''}
  </main>`;
  document.getElementById('orqa')?.addEventListener('click', orqaga);
  document.getElementById('loy')?.addEventListener('toggle', (e) => (S.loyihaOchiq = e.target.open));
  const sar = `«${nomi(i)}» (${i.nom})`;
  ilova.querySelectorAll('textarea[data-savol]').forEach((t) => (t.oninput = () => (ilova.querySelector(`[data-javob="${t.dataset.savol}"]`).disabled = !t.value.trim())));
  ilova.querySelectorAll('[data-javob]').forEach((b) => (b.onclick = async () => {
    const id = b.dataset.javob, matn = ilova.querySelector(`textarea[data-savol="${id}"]`).value.trim();
    if (await yubor(`${sar} — ${id}-savolga javob: ${matn}`, b)) { S.yuborildi[`${i.nom}:${id}`] = true; chiz(); }
  }));
  const el = (id) => document.getElementById(id);
  if (el('tasdiq')) el('tasdiq').onclick = () => yubor(`${sar} — ssenariy loyihasini tasdiqlayman.`, el('tasdiq'));
  if (el('tuz-och')) el('tuz-och').onclick = () => { S.tuzatish = true; chiz(); el('tuz')?.focus(); };
  if (el('tuz-yop')) el('tuz-yop').onclick = () => { S.tuzatish = false; chiz(); };
  if (el('tuz')) el('tuz').oninput = () => (el('tuz-yub').disabled = !el('tuz').value.trim());
  if (el('tuz-yub')) el('tuz-yub').onclick = async () => { if (await yubor(`${sar} — loyiha bo'yicha tuzatish: ${el('tuz').value.trim()}`, el('tuz-yub'))) { S.tuzatish = false; chiz(); } };
}

// ── Suhbat ──
function vaqtYoz(v) { return (v || '').slice(11, 16); }
const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const kunYoz = (k) => { const [, o, d] = k.split('-'); return o ? `${+d}-${OYLAR[+o - 1]}` : k; };
function suhbatChiz() {
  const eski = document.querySelector('.xabarlar');
  const pastda = !eski || eski.scrollHeight - eski.scrollTop - eski.clientHeight < 80;
  const qoralama = document.getElementById('xat')?.value || S.qoralama || '';
  let kun = '';
  const qatorlar = S.xabarlar.map((x) => {
    const k = (x.vaqt || '').slice(0, 10), q = k !== kun ? `<div class="kun">${esc(kunYoz(k))}</div>` : '';
    kun = k;
    return `${q}<div class="xabar ${x.kim === 'agent' ? 'agent' : 'pm'}">${md(x.matn)}<time>${vaqtYoz(x.vaqt)}${x.manba === 'web' ? ' · web' : ''}</time></div>`;
  }).join('');
  ilova.innerHTML = `<div class="suhbat">
    <div class="suhbat-bosh"><h1>Suhbat</h1><p class="izoh" style="margin:0">Telegram'dagi suhbat bilan bir xil. Javob ikkala joyga ham keladi.</p></div>
    <div class="xabarlar" aria-live="polite">${qatorlar || ekran('message-circle', 'Suhbat bo\'sh', 'Yangi update haqida yozing: qaysi dastur, qanday funksiya, nima uchun kerak.')}
      ${S.kutish ? '<div class="yozmoqda">Agent yozmoqda…</div>' : ''}</div>
    <div class="yozish"><textarea id="xat" rows="1" placeholder="Xabar yozing" aria-label="Xabar">${esc(qoralama)}</textarea>
      <button class="yuborish" id="yub" aria-label="Yuborish" ${qoralama.trim() ? '' : 'disabled'}>${ik('send-horizontal')}</button></div>
  </div>`;
  const xb = document.querySelector('.xabarlar');
  if (pastda) xb.scrollTop = xb.scrollHeight;
  const t = document.getElementById('xat'), b = document.getElementById('yub');
  t.oninput = () => { S.qoralama = t.value; b.disabled = !t.value.trim(); };
  t.onkeydown = (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) b.click(); };
  b.onclick = async () => { const m = t.value.trim(); if (m && (await yubor(m, b, true))) { S.qoralama = ''; chiz(); } };
}

// ── amallar ──
let xabarnomaT;
function xabarnoma(matn) {
  document.querySelector('.xabarnoma')?.remove();
  const d = document.createElement('div'); d.className = 'xabarnoma'; d.setAttribute('role', 'status'); d.textContent = matn;
  document.body.append(d); clearTimeout(xabarnomaT); xabarnomaT = setTimeout(() => d.remove(), 3500);
}
async function yubor(matn, tugma, suhbatda = false) {
  if (tugma) tugma.disabled = true;
  try {
    const j = await so('/xabar', { method: 'POST', body: JSON.stringify({ matn }) });
    S.xabarlar.push(j.xabar); S.oxirgiId = Math.max(S.oxirgiId, j.xabar.id); S.kutish = true;
    tg?.HapticFeedback?.notificationOccurred('success');
    if (!suhbatda) xabarnoma("Agentga yuborildi. Javobi «Suhbat» da");
    return true;
  } catch (e) {
    xabarnoma(e.kod === 403 ? "Sizga ruxsat berilmagan" : "Yuborilmadi. Internetni tekshirib, qayta urinib ko'ring");
    if (tugma) tugma.disabled = false;
    return false;
  }
}

// ── navigatsiya ──
function yorliqlar() {
  const kut = S.data ? S.data.ishlar.filter((i) => holatOl(i).kut).length : 0;
  let n = document.querySelector('nav.yorliqlar');
  if (!n) { n = document.createElement('nav'); n.className = 'yorliqlar'; n.setAttribute('aria-label', "Bo'limlar"); document.body.append(n); }
  const joriy = S.ekran === 'suhbat' ? 'suhbat' : 'ishlar';
  n.innerHTML = `<button data-yor="ishlar" ${joriy === 'ishlar' ? 'aria-current="page"' : ''}>${ik('list-checks')}Ishlar${kut ? `<span class="son">${kut}</span>` : ''}</button>
    <button data-yor="suhbat" ${joriy === 'suhbat' ? 'aria-current="page"' : ''}>${ik('message-circle')}Suhbat</button>`;
  n.querySelectorAll('[data-yor]').forEach((b) => (b.onclick = () => { S.ekran = b.dataset.yor; S.ish = null; chiz(); scrollTo(0, 0); if (S.ekran === 'suhbat') suhbatOl(); }));
}
function ochIsh(nom) { S.ish = nom; S.ekran = 'ish'; S.tuzatish = false; S.loyihaOchiq = false; chiz(); scrollTo(0, 0); }
function orqaga() { S.ekran = 'ishlar'; S.ish = null; chiz(); }
tg?.BackButton?.onClick(orqaga);

function chiz() {
  document.body.classList.toggle('suhbatda', S.ekran === 'suhbat');
  if (S.ekran === 'ish') tg?.BackButton?.show(); else tg?.BackButton?.hide();
  // yozilayotgan javob yo'qolmasin: fon yangilanishi faqat bo'sh maydonlarda ekranni qayta chizadi
  if (S.ekran === 'suhbat') suhbatChiz(); else if (!S.data) return; else if (S.ekran === 'ish') ishChiz(); else ishlarChiz();
  yorliqlar();
}
const yozilyapti = () => [...document.querySelectorAll('main textarea')].some((t) => t.value.trim());

// ── ma'lumot ──
async function ishlarOl(birinchi) {
  try {
    const j = await so('/ishlar');
    const ozgardi = JSON.stringify(j) !== JSON.stringify(S.data);
    S.data = j;
    if (ozgardi && S.ekran !== 'suhbat' && !yozilyapti()) { const y = scrollY; chiz(); scrollTo(0, y); }
    else if (ozgardi) yorliqlar();
  } catch (e) {
    if (!birinchi && S.data) return;
    ilova.innerHTML = `<main>${e.kod === 403 ? ekran('lock', "Ruxsat yo'q", "Sizga hali ruxsat berilmagan. Abdullohdan so'rang.")
      : e.kod === 401 ? ekran('lock', 'Telegram orqali oching', "Sahifa @osonupdater_robot ichidagi «Ishlar» tugmasi bilan ochiladi.")
      : ekran('circle-alert', "Ulanib bo'lmadi", "Server javob bermadi. Birozdan keyin qayta oching.")}</main>`;
  }
}
async function suhbatOl() {
  try {
    const j = await so(`/suhbat?keyin=${S.oxirgiId}`);
    if (!j.xabarlar.length) return;
    for (const x of j.xabarlar) if (!S.xabarlar.some((y) => y.id === x.id)) S.xabarlar.push(x);
    S.xabarlar.sort((a, b) => a.id - b.id);
    S.oxirgiId = S.xabarlar.at(-1).id;
    if (S.xabarlar.at(-1).kim === 'agent') S.kutish = false;
    if (S.ekran === 'suhbat') suhbatChiz();
  } catch {}
}

if (!INIT) {
  ilova.innerHTML = `<main>${ekran('lock', 'Telegram orqali oching', "Sahifa @osonupdater_robot ichidagi «Ishlar» tugmasi bilan ochiladi.")}</main>`;
} else {
  ilova.innerHTML = `<main><div class="bosh"><h1>Ishlar</h1></div><p class="izoh">Yuklanmoqda…</p><div class="skelet"></div><div class="skelet"></div></main>`;
  ishlarOl(true).then(() => { if (S.data) chiz(); });
  suhbatOl();
  setInterval(() => ishlarOl(false), 10000);
  setInterval(() => suhbatOl(), S.ekran === 'suhbat' ? 2500 : 2500);
}

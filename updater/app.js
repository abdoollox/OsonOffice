// Oson Updater Mini App (Telegram) — https://office.osonacademy.uz/updater/. Abdulloh 2026-11-17 da shu variantni (B) tanladi, Broom'dagi A olib tashlandi.
// Dizayn: UI UX Pro Max skill — "Logistics/Delivery": posilka kuzatuvidek. Update sahifasida 5 qadam vertikal yo'l bo'lib turadi,
// har qadamning materiali o'z ichida (Material — PM fayllari, Savollar — savol va javoblar, Ssenariy — kadrli sahnalar).
// Ma'lumot A bilan bir xil: updater-api.osonacademy.uz/api/ishlar.
import { IK, PH } from './ikonlar.js?v=20261124c'; // ?v= — Telegram eski nusxani keshdan bermasin; fayl o'zgarsa raqamni yangilang

const API = 'https://updater-api.osonacademy.uz/api';
const tg = window.Telegram?.WebApp;
const INIT = tg?.initData || '';
const ilova = document.getElementById('ilova');
// to'ldirilgan (filled) belgilar — Phosphor (MIT), 256 o'lchamli
const ikf = (n) => `<svg class="ik" viewBox="0 0 256 256" aria-hidden="true">${PH[n] || ''}</svg>`;
const ik = (n) => `<svg class="ik" viewBox="0 0 24 24" aria-hidden="true">${IK[n] || ''}</svg>`;
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function mavzu() {
  document.documentElement.dataset.theme = tg?.colorScheme === 'dark' ? 'dark' : 'light';
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--c-bg').trim();
  try { tg?.setHeaderColor(bg); tg?.setBackgroundColor(bg); } catch {}
}
tg?.ready(); tg?.expand(); mavzu(); tg?.onEvent?.('themeChanged', mavzu);
// sahifani kattalashtirib-kichraytirib bo'lmasin (Abdulloh, 2026-11-19): Ctrl+g'ildirak, Ctrl +/−/0, barmoq bilan (iOS)
addEventListener('wheel', (e) => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && ['+', '=', '-', '_', '0'].includes(e.key)) e.preventDefault(); });
for (const g of ['gesturestart', 'gesturechange']) addEventListener(g, (e) => e.preventDefault());
addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

const QADAMLAR_HAMMASI = [
  { id: 'material', ikon: 'folder-fill', nom: 'Material', ich: ['qabul', 'transkript'], izoh: 'PM funksiya haqida ovoz, video yoki matn yuboradi' },
  { id: 'savollar', ikon: 'chat-circle-fill', nom: 'Savollar', ich: ['tahlil'], izoh: "Agent funksiyani tahlil qilib, tushunmagan joylarini so'raydi" },
  { id: 'ssenariy', ikon: 'film-slate-fill', nom: 'Ssenariy', ich: ['ssenariy', 'loyiha-tasdiq', 'qoshimcha'], izoh: 'Javoblardan keyin video sahnalari va diktor matni yoziladi — PM tasdiqlaydi' },
  { id: 'video', ikon: 'video-camera-fill', nom: 'Promo', ich: ['yasash', 'ovoz', 'render', 'tekshiruv', 'tuzatish'], izoh: "Agent 1 daqiqalik promo video yasaydi, PM va QA ko'radi" },
  // 2026-11-24 (Abdulloh): kanalga faqat promo chiqadi — e'lon promo'dan keyin darhol; uzun video e'lon qilinmaydi (YouTube va LMS)
  { id: 'elon', ikon: 'paper-plane-right-fill', nom: "E'lon", ich: ['elon-materiallari', 'elon'], izoh: 'Promo video va post kanalga — ruxsat bilan' },
  { id: 'uzun', ikon: 'monitor-play-fill', nom: 'Uzun video', ich: ['uzun-ssenariy', 'uzun-loyiha-tasdiq', 'uzun-yasash', 'uzun-ovoz', 'uzun-render', 'uzun-tekshiruv', 'uzun-tuzatish', 'youtube'], izoh: "Batafsil video (texnik dars) — PM va QA ko'radi, YouTube'ga joylanadi" },
  { id: 'oqitish', ikon: 'graduation-cap-fill', nom: 'Test', ich: ['test-yozish', 'test', 'lms'], izoh: "Agent uzun video bo'yicha test tuzadi, Akademiya tekshiradi" },
];
// uzun video to'xtatilgan bo'lsa (bosqichlari ro'yxatda yo'q) — "Uzun video" va "O'qitish" qadamlari joyida qoladi, lekin xira (toxtagan)
// i.uzun — shu update uchun uzun video yoqilgan (umumiy kalit o'chiq bo'lsa ham; YouTube/test/Exode hali qurilmagan)
const UZUN_ICH = ['uzun-ssenariy', 'uzun-loyiha-tasdiq', 'uzun-yasash', 'uzun-ovoz', 'uzun-render', 'uzun-tekshiruv', 'uzun-tuzatish', 'test-yozish', 'test'];
const qadamlar = (i) => {
  const bor = new Set([...(S.data?.bosqichlar || []).map((b) => b.id), ...(i?.uzun ? UZUN_ICH : [])]);
  return QADAMLAR_HAMMASI.map((q) => {
    const ich = q.ich.filter((id) => bor.has(id));
    if (!ich.length) return { ...q, toxtagan: true };
    return { ...q, ich };
  });
};
// hozirgi holat → bir jumla; kut: odamdan javob kutilyapti
function holat(i) {
  const javobsiz = i.savollar.filter((s) => s.javob == null).length;
  if (!i.navbatdagi) return { matn: "E'lon qilindi", tayyor: true };
  if (i.bosqichlar[i.navbatdagi]?.holat === 'xato') return { matn: "To'xtab qoldi — Abdulloh ko'rib chiqadi", xato: true };
  if (i.topshirildi && i.topshirildi.bosqich === i.navbatdagi) return { matn: `Javob bo'lmadi — mas'uliyat ${i.topshirildi.kimga.join(', ')} ga o'tdi`, xato: true };
  return {
    qabul: { matn: 'Agent materialni qabul qilyapti' },
    transkript: { matn: "Agent materialni o'qiyapti" },
    tahlil: javobsiz ? { matn: `${javobsiz} ta savolga javob kerak`, kut: true, tugma: 'Chatda javob berish' } : { matn: 'Agent funksiyani tahlil qilyapti' },
    ssenariy: { matn: 'Agent ssenariy yozyapti' },
    'loyiha-tasdiq': { matn: 'Ssenariyni tasdiqlang yoki tuzating', kut: true, tugma: 'Chatda tasdiqlash' },
    qoshimcha: { matn: "Video uchun yana material bormi? Bo'lmasa «yo'q» deng", kut: true, tugma: 'Chatda javob berish' },
    yasash: { matn: 'Agent video tayyorlayapti' }, ovoz: { matn: 'Agent video tayyorlayapti' }, render: { matn: 'Agent video tayyorlayapti' },
    tekshiruv: { matn: "Promo videoni ko'rib, fikr bildiring", kut: true, tugma: 'Chatda fikr bildirish' },
    tuzatish: { matn: "Agent izohlar bo'yicha tuzatyapti" },
    'uzun-ssenariy': { matn: 'Agent uzun video ssenariysini yozyapti' },
    'uzun-loyiha-tasdiq': { matn: 'Uzun video ssenariysini tasdiqlang yoki tuzating', kut: true, tugma: 'Chatda tasdiqlash' },
    'uzun-yasash': { matn: 'Agent uzun video tayyorlayapti' }, 'uzun-ovoz': { matn: 'Agent uzun video tayyorlayapti' }, 'uzun-render': { matn: 'Agent uzun video tayyorlayapti' },
    'uzun-tekshiruv': { matn: "Uzun videoni ko'rib, fikr bildiring", kut: true, tugma: 'Chatda fikr bildirish' },
    'uzun-tuzatish': { matn: "Agent izohlar bo'yicha tuzatyapti" },
    youtube: { matn: "Agent uzun videoni YouTube'ga joylayapti" },
    'elon-materiallari': { matn: 'Agent post matnini tayyorlayapti' },
    'test-yozish': { matn: 'Agent test savollarini tuzyapti' },
    test: { matn: "Test savollarini tekshiring — Akademiya tasdig'i", kut: true, tugma: 'Chatda tasdiqlash' },
    lms: { matn: "Agent video va testni Exode'ga joylayapti" },
    elon: { matn: "Tayyor postni kanalga forward qiling", kut: true, tugma: 'Topikni ochish' },
  }[i.navbatdagi] || { matn: 'Ishlanyapti' };
}
const qadamHol = (i, q) => {
  if (q.toxtagan) return 'o'; // hozircha to'xtatilgan (uzun video)
  if (q.ich.every((id) => i.bosqichlar[id]?.holat === 'otkazildi')) return 'o'; // bu ishga tegishli emas
  if (q.ich.every((id) => ['tayyor', 'otkazildi'].includes(i.bosqichlar[id]?.holat))) return 't';
  return q.ich.includes(i.navbatdagi) ? 'h' : '';
};
const qadamVaqt = (i, q) => sana(q.ich.map((id) => i.bosqichlar[id]?.vaqt).filter(Boolean).sort().at(-1));
const mahsulot = (m) => (m === 'kassa' ? 'Oson Kassa' : m === 'price' ? 'Oson Price' : '');
const nomi = (i) => i.sarlavha || i.nom;
const turi = (h) => (h.kut ? 'kut' : h.tayyor ? 'tayyor' : h.xato ? 'xato' : '');
const bosh = (ikon, b, p) => `<div class="bosh-ekran">${ik(ikon)}<b>${esc(b)}</b><p>${esc(p)}</p></div>`;

// ── Ro'yxat ──
function qatorHtml(i) {
  const h = holat(i);
  return `<button class="qator ${turi(h)}" data-ish="${esc(i.nom)}"><span class="chiziq"></span>
    <div><div class="qator-dastur ${i.mahsulot === 'price' ? 'price' : 'kassa'}">${mahsulot(i.mahsulot)}</div><div class="qator-nom">${esc(nomi(i))}</div>
      <p class="qator-holat">${esc(h.matn)}</p>
      ${i.reliz ? `<span class="chip reliz-chip">${ikf('rocket-launch-fill')}${esc(i.reliz.nomi)}</span>` : ''}
      <ol class="belgilar" aria-label="Qadamlar">${qadamlar(i).map((q) => { const hol = qadamHol(i, q); return `<li class="${hol}${hol === 'h' && h.kut ? ' kut' : ''}"><span class="b-ik">${ikf(q.ikon)}${hol === 't' ? `<span class="b-ok">${ikf('check-bold')}</span>` : ''}</span><span class="b-nom">${q.nom}</span><span class="sr">${hol === 't' ? ' — bajarildi' : hol === 'h' ? ' — hozir' : hol === 'o' ? (q.toxtagan ? " — hozircha to'xtatilgan" : ' — kerak emas') : ''}</span></li>`; }).join('')}</ol></div>${ik('chevron-right')}</button>`;
}
// bo'limlar: Update'lar | Relizlar (relizlar bo'lsa)
// tablar qatori; o'ngda — filtr tugmasi (faqat Update'lar tabida): bosilsa menyu "Sizni kutyapti / Hammasi" (Abdulloh, 2026-11-20)
const bolimlar = (filtr = '') => (S.data ? `<div class="bolimlar-qator"><div class="bolimlar" role="tablist">
  <button role="tab" data-b="update" aria-selected="${S.bolim === 'update'}">Update'lar</button>
  <button role="tab" data-b="reliz" aria-selected="${S.bolim === 'reliz'}">Relizlar${S.data.relizlar?.length ? ` <b>${S.data.relizlar.length}</b>` : ""}</button></div>${filtr}</div>` : '');
const bolimUlash = () => ilova.querySelectorAll('[data-b]').forEach((b) => (b.onclick = () => { S.bolim = b.dataset.b; chiz(); scrollTo(0, 0); }));
function royxatChiz() {
  if (S.bolim === 'reliz') return relizRoyxat();
  const ishlar = S.data.ishlar;
  if (!ishlar.length) return (ilova.innerHTML = `<main>${bosh('inbox', "Hali update yo'q", "PM chatda yangi funksiya haqida yozsa, u shu yerda chiqadi.")}</main>`);
  const kut = ishlar.filter((i) => holat(i).kut);
  if (!kut.length) S.filtr = 'hammasi';
  const korin = S.filtr === 'kut' ? kut : ishlar;
  const varianti = (f, nom, n, yoq) => `<button role="menuitemradio" data-f="${f}" aria-checked="${S.filtr === f}" ${yoq ? 'disabled' : ''}>
    <span class="fm-ok">${S.filtr === f ? ik('check') : ''}</span><span>${nom}</span><b>${n}</b></button>`;
  const filtr = `<div class="filtr-joy"><button class="filtr-tugma${S.filtr === 'kut' ? ' faol' : ''}" id="filtrTugma" aria-haspopup="menu" aria-expanded="${!!S.filtrOchiq}"
      aria-label="Saralash: ${S.filtr === 'kut' ? 'sizni kutyapti' : 'hammasi'}">${ik('list-filter')}</button>
    ${S.filtrOchiq ? `<div class="filtr-menyu" role="menu">${varianti('kut', 'Sizni kutyapti', kut.length, !kut.length)}${varianti('hammasi', 'Hammasi', ishlar.length)}</div>` : ''}</div>`;
  ilova.innerHTML = `<main>${bolimlar(filtr)}
    <h1 class="sr">Update'lar — ${S.filtr === 'kut' ? 'sizni kutyapti' : 'hammasi'}</h1>
    ${korin.map(qatorHtml).join('')}</main>`;
  document.getElementById('filtrTugma').onclick = (e) => { e.stopPropagation(); S.filtrOchiq = !S.filtrOchiq; chiz(); };
  ilova.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { S.filtr = b.dataset.f; S.filtrOchiq = false; chiz(); }));
  ilova.querySelectorAll('[data-ish]').forEach((b) => (b.onclick = () => och(b.dataset.ish)));
  bolimUlash();
}

// ── Relizlar (Abdulloh, 2026-11-20): bir nechta update — kanalga bitta xabar, tafsiloti blogda. Update'lardagidek qadamlar bilan:
// Tarkib → Videolar (har promo o'z topigida tasdiqlanadi) → Muqova (16:9, Gemini) → Blog (joylanadi, PM/QA Instant View'da o'qib tasdiqlaydi)
// → Post (blogga olib boradigan bitta xabar, tasdiqlanadi) → E'lon (forward). Abdulloh, 2026-11-20: avval blog, keyin post
const RQ = [
  { id: 'tarkib', ikon: 'stack-fill', nom: 'Tarkib', izoh: "PM yoki QA relizga qaysi update'lar kirishini aytadi" },
  { id: 'video', ikon: 'video-camera-fill', nom: 'Videolar', izoh: "Har update'ning promo videosi o'z topigida tasdiqlanadi" },
  { id: 'muqova', ikon: 'image-fill', nom: 'Muqova', izoh: "Agent relizga mos 16:9 rasm tayyorlaydi — blog tepasida va post ostida turadi" },
  { id: 'blog', ikon: 'globe-hemisphere-west-fill', nom: 'Blog', izoh: "Agent blog yozib saytga qo'yadi, PM yoki QA uni o'qib tasdiqlaydi" },
  { id: 'post', ikon: 'article-fill', nom: 'Post', izoh: 'Agent blogga olib boradigan kanal xabarini yozadi — tasdiqlanadi' },
  { id: 'elon', ikon: 'paper-plane-right-fill', nom: "E'lon", izoh: 'PM yoki QA xabarni kanalga forward qiladi' },
];
const videoSoni = (r) => r.ishlar.filter((y) => y.video || y.elon).length;
const rqTayyor = (r, id) => ({ tarkib: r.ishlar.length > 0, video: r.videolar, muqova: !!r.muqovaVaqt, blog: !!r.blogTasdiq, post: !!r.postTasdiq, elon: r.holat === 'elon' }[id]);
const rqJoriy = (r) => RQ.find((q) => !rqTayyor(r, q.id));
const rqHol = (r, q) => (rqTayyor(r, q.id) ? 't' : rqJoriy(r) === q ? 'h' : '');
const rqVaqt = (r, id) => sana({ tarkib: r.yaratildi, video: r.ishlar.map((y) => y.videoVaqt).filter(Boolean).sort().at(-1), muqova: r.muqovaVaqt,
  blog: r.blogTasdiq?.vaqt, post: r.postTasdiq?.vaqt, elon: r.elonVaqt }[id]);
function relizHolat(r) {
  const q = rqJoriy(r);
  if (!q) return { matn: "E'lon qilindi", tayyor: true };
  return {
    tarkib: { matn: "Relizga update'lar qo'shilmoqda" },
    video: { matn: `Promo videolar tasdig'i: ${videoSoni(r)}/${r.ishlar.length}`, kut: true, tugma: 'Topikni ochish' },
    muqova: { matn: 'Agent reliz muqovasini tayyorlayapti' },
    blog: r.blogVaqt ? { matn: "Blogni o'qib tasdiqlang yoki tuzating", kut: true, tugma: 'Topikni ochish' } : { matn: 'Agent blog yozyapti' },
    post: r.postVaqt ? { matn: 'Kanal xabarini tasdiqlang yoki tuzating', kut: true, tugma: 'Topikni ochish' } : { matn: 'Agent kanal xabarini yozyapti' },
    elon: { matn: 'Xabarni kanalga forward qiling', kut: true, tugma: 'Topikni ochish' },
  }[q.id];
}
const rqBelgilar = (r, h) => `<ol class="belgilar" aria-label="Qadamlar">${RQ.map((q) => { const hol = rqHol(r, q); return `<li class="${hol}${hol === 'h' && h.kut ? ' kut' : ''}"><span class="b-ik">${ikf(q.ikon)}${hol === 't' ? `<span class="b-ok">${ikf('check-bold')}</span>` : ''}</span><span class="b-nom">${q.nom}</span><span class="sr">${hol === 't' ? ' — bajarildi' : hol === 'h' ? ' — hozir' : ''}</span></li>`; }).join('')}</ol>`;
function relizRoyxat() {
  ilova.innerHTML = `<main>${bolimlar()}
    <h1 class="sr">Relizlar</h1>
    ${S.data.relizlar?.length ? "" : bosh("rocket", "Hozircha reliz yo'q", "Bir nechta update bitta postda chiqsa, reliz shu yerda ko'rinadi. Relizni PM yoki QA guruhda aytadi.")}
    ${(S.data.relizlar || []).map((r) => { const h = relizHolat(r); return `<button class="qator ${turi(h)}" data-reliz="${esc(r.id)}"><span class="chiziq"></span>
      <div><div class="qator-dastur kassa">Reliz · ${r.ishlar.length} ta update${r.sinov ? ' · sinov' : ''}</div><div class="qator-nom">${esc(r.nomi)}</div>
        <p class="qator-holat">${esc(h.matn)}</p>${rqBelgilar(r, h)}</div>${ik('chevron-right')}</button>`; }).join('')}</main>`;
  ilova.querySelectorAll('[data-reliz]').forEach((b) => (b.onclick = () => { S.reliz = b.dataset.reliz; S.royxatdan = true; S.ochiq.clear(); chiz(); scrollTo(0, 0); }));
  bolimUlash();
}
function relizChiz() {
  const r = S.data.relizlar?.find((x) => x.id === S.reliz);
  if (!r) { S.reliz = null; return chiz(); }
  const h = relizHolat(r), joriy = rqJoriy(r);
  const orqa = S.royxatdan && !tg?.BackButton ? `<button class="orqa" id="orqa" aria-label="Hamma relizlar">${ik('arrow-left')}</button>` : '';
  const havola = (url, ikon, nom, izoh) => (url ? `<li class="mk"><div class="mk-bosh"><span class="mk-ik">${ik(ikon)}</span>
    <div class="mk-nom"><b>${nom}</b><span>${esc(izoh)}</span></div><a class="mk-tg" href="${esc(url)}" ${url.includes('t.me/') ? 'data-tg' : 'target="_blank" rel="noopener"'}>${ik('send-horizontal')}Ochish</a></div></li>` : '');
  const ishHol = (y) => (y.elon ? "E'lon qilindi" : y.video ? 'Promo video tasdiqlandi' : (S.data.bosqichlar.find((b) => b.id === y.navbatdagi)?.nomi || 'Jarayonda'));
  // Tarkib — update sahifasiga (web-ilova); Videolar — guruhdagi tasdiqlangan promo videoga (Abdulloh, 2026-11-20)
  const ishlarHtml = (video) => `<ul class="reliz-ishlar">${r.ishlar.map((y) => `<li>${video && y.videoHavola ? `<a href="${esc(y.videoHavola)}" data-tg>` : `<button data-ish="${esc(y.nom)}">`}<span class="ri-belgi ${y.elon ? 't' : y.video ? 'p' : ''}">${y.elon || y.video ? ik('check') : ''}</span>
      <span><b>${esc(y.sarlavha)}</b><small>${esc(video && y.videoHavola ? (y.video ? 'Tasdiqlangan videoni ochish' : 'Videoni ochish') : ishHol(y))}</small></span>${ik(video && y.videoHavola ? 'send-horizontal' : 'chevron-right')}${video && y.videoHavola ? '</a>' : '</button>'}</li>`).join('')}</ul>`;
  const postHtml = r.postMatn ? `<p class="yq-izoh">Kanalga bitta xabar chiqadi — u blogga olib boradi (Telegram'da «Instant View» bilan ochiladi).</p><div class="quti"><div class="matn">${esc(r.postMatn).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')}</div></div>` : '';
  const ICH = {
    tarkib: ishlarHtml(false), video: ishlarHtml(true),
    // muqova rasmi saytdan (blog joylangach) — undan oldin faqat izoh
    muqova: r.muqovaRasm ? `<img class="muqova-rasm" src="${esc(r.muqovaRasm)}" alt="Reliz muqovasi" loading="lazy">` : '',
    blog: r.blog ? `<ul class="materiallar">${havola(r.blog, 'globe', 'Blog sahifasi', 'osonacademy.uz/blog')}</ul>` : '',
    // post — blog tasdiqlangach yoziladi
    post: r.blogTasdiq ? postHtml : '',
    elon: r.kanal || r.mavzu ? `<ul class="materiallar">${havola(r.kanal, 'megaphone', 'Kanaldagi post', sana(r.elonVaqt) || 'Telegram')}${havola(r.mavzu, 'message-circle', 'Reliz topigi', 'Telegram guruhda')}</ul>` : '',
  };
  const yorliq = h.kut ? 'Sizni kutyapti' : h.tayyor ? 'Tayyor' : 'Jarayonda';
  ilova.innerHTML = `<main>
    <div class="tepa">${orqa}<div><span class="chip">${ikf('rocket-launch-fill')}Reliz · ${r.ishlar.length} ta update</span><h1>${esc(r.nomi)}</h1></div></div>
    <section class="hero ${turi(h)}" aria-live="polite"><div class="hero-yorliq">${ik(h.kut ? 'clock' : h.tayyor ? 'circle-check' : 'loader-circle')}${yorliq}</div>
      <p class="hero-matn">${esc(h.matn)}</p>
      ${joriy ? `<p class="hero-qadam">${RQ.indexOf(joriy) + 1}-qadam / ${RQ.length} · ${joriy.nom}</p>` : ''}
      ${h.kut && r.mavzu ? `<a class="tugma" href="${esc(r.mavzu)}" data-tg>${ik('message-circle')}${esc(h.tugma)}</a>` : ''}</section>
    <ol class="yol" aria-label="Qadamlar">${RQ.map((q, n) => {
      const hol = rqHol(r, q), ichi = ICH[q.id] || '';
      const ochiq = hol === 'h' || S.ochiq.has('r-' + q.id);
      const bosh = `<span class="yq-nom">${q.nom}</span><span class="yq-vaqt">${hol === 't' ? esc(rqVaqt(r, q.id)) : hol === 'h' ? 'hozir' : ''}</span>`;
      return `<li class="yq ${hol}${hol === 'h' && h.kut ? ' kut' : ''}" ${hol === 'h' ? 'aria-current="step"' : ''}>
        <span class="nuqta">${hol === 't' ? ik('check') : n + 1}</span>
        ${ichi && hol === 't' ? `<button class="yq-bosh" data-q="r-${q.id}" aria-expanded="${ochiq}">${bosh}${ik('chevron-right')}</button>` : `<div class="yq-bosh">${bosh}</div>`}
        ${ichi && ochiq ? `<div class="yq-ich">${ichi}</div>` : hol === '' || (hol === 'h' && !ichi) ? `<p class="yq-izoh">${q.izoh}</p>` : ''}
      </li>`;
    }).join('')}</ol>
  </main>`;
  document.getElementById('orqa')?.addEventListener('click', royxatga);
  ilova.querySelectorAll('[data-ish]').forEach((b) => (b.onclick = () => { S.reliz = null; och(b.dataset.ish); }));
  ilova.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { S.ochiq.has(b.dataset.q) ? S.ochiq.delete(b.dataset.q) : S.ochiq.add(b.dataset.q); chiz(); }));
  ilova.querySelectorAll('a[data-tg]').forEach((a) => a.addEventListener('click', (e) => { if (tg?.openTelegramLink) { e.preventDefault(); tg.openTelegramLink(a.href); } }));
}

// ── Update sahifasi: qadamlar ichidagi narsalar ──
const OYLAR = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
const sana = (v) => { const m = String(v || '').match(/^\d{4}-(\d{2})-(\d{2})[ T](\d{2}:\d{2})/); return m ? `${+m[2]}-${OYLAR[+m[1] - 1]}, ${m[3]}` : ''; };
function materialHtml(i) {
  if (!i.materiallar?.length) return '';
  return `<ul class="materiallar">${i.materiallar.map((m) => {
    const nom = { video: 'Video', ovoz: 'Ovozli xabar', rasm: 'Rasm' }[m.tur] || 'Matn';
    const hajm = m.tur !== 'matn' ? ` · ${String(m.mb).replace('.', ',')} MB` : '';
    return `<li class="mk">
      <div class="mk-bosh"><span class="mk-ik">${ik({ video: 'video', ovoz: 'mic', rasm: 'image' }[m.tur] || 'file-text')}</span>
        <div class="mk-nom"><b>${nom}</b><span>${esc(sana(m.vaqt))}${hajm}</span></div>
        ${m.havola ? `<a class="mk-tg" href="${esc(m.havola)}" data-tg aria-label="${nom} — Telegram guruhda ochish">${ik('send-horizontal')}Ochish</a>` : ''}</div>
      ${m.matn ? `<details class="mk-matn"><summary>${m.tur === 'matn' ? 'Matnni o\'qish' : 'Aytilganlarni o\'qish'}${ik('chevron-right')}</summary><div class="matn">${esc(m.matn)}</div></details>` : ''}</li>`;
  }).join('')}</ul>`;
}
function savolHtml(i) {
  const why = i.why ? `<details class="ochiq quti" style="padding: var(--s3)"><summary>WHY tahlili — agent qanday tushundi</summary><div class="matn">${esc(i.why)}</div></details>` : '';
  if (!i.savollar?.length) return why;
  return why + `<ul class="quti ro">${i.savollar.map((s) => `<li class="savol${s.javob != null ? ' j' : ''}">${ik(s.javob != null ? 'circle-check' : 'message-circle')}
    <div><p>${esc(s.savol)}</p>${s.javob != null ? `<p class="savol-javob"><b>Javob:</b> ${esc(s.javob)}</p>` : ''}</div></li>`).join('')}</ul>`;
}
// ikonkali eskiz: 1–3 ta Phosphor belgi (birinchisi katta) va ekranda chiqadigan qisqa yozuv
const eskizHtml = (x) => {
  const e = x.eskiz;
  if (!e?.ikonlar?.length) return `<p>${esc(x.ekran)}</p>`;
  return `<div class="e-ikonlar">${e.ikonlar.map((k, n) => `<span class="e-ik${n ? '' : ' bosh'}"><svg viewBox="0 0 256 256" aria-hidden="true">${k.svg}</svg></span>`).join('')}</div>${e.yozuv ? `<p class="e-yozuv">${esc(e.yozuv)}</p>` : ''}`;
};
function sahnaHtml(i) {
  const s = i.sahnalar || [];
  const tasma = s.length ? `<div class="tasma" role="list" aria-label="Sahnalar">${s.map((x) => `<article class="kadr" role="listitem">
      <div class="kadr-rasm${x.eskiz?.ikonlar?.length ? ` eskiz ${x.eskiz.ton}` : ''}">${x.rasm ? `<img src="${x.rasm}" alt="" loading="lazy">` : eskizHtml(x)}<span class="kadr-n">${esc(x.n)}</span></div>
      <div class="kadr-matn"><b>${esc(x.nom)}</b>${(x.rasm || x.eskiz?.ikonlar?.length) && x.ekran ? `<p class="kadr-ekran">${esc(x.ekran)}</p>` : ''}${x.diktor ? `<p>«${esc(x.diktor)}»</p>` : ''}</div></article>`).join('')}</div>
    <p class="sanoq">${s.length} sahna — chapga suring</p>` : '';
  const toliq = (i.loyiha ? `<details class="ochiq quti" style="padding: var(--s3)"><summary>Promo ssenariysining to'liq matni</summary><div class="matn">${esc(i.loyiha)}</div></details>` : '')
    + (i.uzunLoyiha && qadamlar(i).some((q) => q.id === 'uzun' && !q.toxtagan) ? `<details class="ochiq quti" style="padding: var(--s3)"><summary>Uzun video ssenariysi</summary><div class="matn">${esc(i.uzunLoyiha)}</div></details>` : '');
  return tasma + toliq;
}
// E'lon: kanal uchun tayyor post matni (Telegram'dagi ko'rinishiga yaqin: qalin — **…**)
const elonHtml = (i) => (i.post ? `<p class="yq-izoh">Kanal uchun tayyor post. Videosi bilan birga update topigida — o'shani kanalga forward qiling.</p><div class="quti"><div class="matn">${esc(i.post).replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>')}</div></div>` : '');
// Promo: bot topikka yuborgan videolar — bosilsa Telegram'dagi o'sha xabar ochiladi (VPS'ga video yuklanmaydi)
function videoHtml(i) {
  const v = i.videolar || {};
  const qator = (x, nom, izoh) => (x ? `<li class="mk"><div class="mk-bosh"><span class="mk-ik">${ik('video')}</span>
    <div class="mk-nom"><b>${nom}</b><span>${esc(izoh)} · ${esc(sana(x.vaqt))}</span></div>
    <a class="mk-tg" href="${esc(x.havola)}" data-tg aria-label="${nom} — Telegram guruhda ochish">${ik('send-horizontal')}Ochish</a></div></li>` : '');
  const q = qator(v['1x1'], 'Promo video', '1:1, post uchun') + qator(v['9x16'], 'Promo video', '9:16, story uchun');
  if (q) return `<ul class="materiallar">${q}</ul>`;
  if (i.mavzu) return `<ul class="materiallar"><li class="mk"><div class="mk-bosh"><span class="mk-ik">${ik('video')}</span>
    <div class="mk-nom"><b>Promo video</b><span>Update topigida</span></div>
    <a class="mk-tg" href="${esc(i.mavzu)}" data-tg aria-label="Update topigini ochish">${ik('send-horizontal')}Ochish</a></div></li></ul>`;
  return '';
}
// Ssenariy qadami: sahnalar + ssenariydan keyin kelgan qo'shimcha materiallar
const ssenariyHtml = (i) => sahnaHtml(i) + (i.qoshimcha?.length ? `<h3 class="kichik-sarlavha">Qo'shimcha material · ${i.qoshimcha.length}</h3><ul class="materiallar">${i.qoshimcha.map((m) =>
  `<li class="mk"><div class="mk-bosh"><span class="mk-ik">${ik(/\.(mp4|mov|webm|mkv)$/i.test(m.fayl) ? 'video' : /\.(png|jpe?g|webp)$/i.test(m.fayl) ? 'image' : 'file-text')}</span>
  <div class="mk-nom"><b>${esc(m.izoh || m.fayl)}</b><span>${esc([m.kim, sana(m.vaqt)].filter(Boolean).join(' · '))}</span></div></div></li>`).join('')}</ul>` : '');
// Test (2026-11-24): savollar va 4 variant, to'g'ri javob yashil belgi bilan; Excel fayli topikda (test.xlsx)
function testHtml(i) {
  if (!i.test?.length) return '';
  return `<p class="yq-izoh">${i.test.length} ta savol — uzun video bo'yicha. Excel fayli update topigida.</p><ol class="quti ro">${i.test.map((q, n) => `<li class="tsavol">
    <p><b>${n + 1}.</b> ${esc(q.savol)}</p><ul>${(q.variantlar || []).map((v, k) => `<li class="${k === q.togri ? 'togri' : ''}">${k === q.togri ? ik('check') : '<span class="tv"></span>'}<span>${'ABCD'[k]}) ${esc(v)}</span></li>`).join('')}</ul>
    ${q.manba ? `<small>Videoda: ${esc(q.manba)}</small>` : ''}</li>`).join('')}</ol>`;
}
const ICHI = { material: materialHtml, savollar: savolHtml, ssenariy: ssenariyHtml, video: videoHtml, elon: elonHtml, oqitish: testHtml };

function ishChiz() {
  const i = S.data.ishlar.find((x) => x.nom === S.ish);
  if (!i) { S.ish = null; return chiz(); }
  const Q = qadamlar(i), h = holat(i), joriy = Q.find((q) => qadamHol(i, q) === 'h');
  const orqa = S.royxatdan && !tg?.BackButton ? `<button class="orqa" id="orqa" aria-label="Hamma update'lar">${ik('arrow-left')}</button>` : '';
  const yorliq = h.kut ? 'Sizni kutyapti' : h.tayyor ? 'Tayyor' : h.xato ? "To'xtadi" : 'Jarayonda';
  ilova.innerHTML = `<main>
    <div class="tepa">${orqa}<div><span class="chip">${esc(mahsulot(i.mahsulot))}</span>${i.reliz ? ` <button class="chip reliz-chip" id="relizga">${ikf('rocket-launch-fill')}${esc(i.reliz.nomi)}</button>` : ''}<h1>${esc(nomi(i))}</h1></div></div>
    <section class="hero ${turi(h)}" aria-live="polite">
      <div class="hero-yorliq">${ik(h.kut ? 'clock' : h.tayyor ? 'circle-check' : h.xato ? 'circle-exclamation-point' : 'loader-circle')}${yorliq}</div>
      <p class="hero-matn">${esc(h.matn)}</p>
      ${joriy ? `<p class="hero-qadam">${Q.indexOf(joriy) + 1}-qadam / ${Q.length} · ${joriy.nom}</p>` : ''}
      ${h.kut ? `<button class="tugma" id="chat">${ik('message-circle')}${esc(h.tugma)}</button>` : ''}
    </section>
    <ol class="yol" aria-label="Qadamlar">${Q.map((q, n) => {
      const hol = qadamHol(i, q), ichi = ICHI[q.id]?.(i) || '';
      // joriy qadam doim ochiq; tayyorlari — bosilsa ochiladi; keyingilari — izoh bilan
      const ochiq = hol === 'h' || S.ochiq.has(q.id);
      const bosh = `<span class="yq-nom">${q.nom}</span><span class="yq-vaqt">${hol === 't' ? esc(qadamVaqt(i, q)) : hol === 'h' ? 'hozir' : ''}</span>`;
      return `<li class="yq ${hol}${hol === 'h' && h.kut ? ' kut' : ''}" ${hol === 'h' ? 'aria-current="step"' : ''}>
        <span class="nuqta">${hol === 't' ? ik('check') : hol === 'o' ? '–' : n + 1}</span>
        ${ichi && hol === 't' ? `<button class="yq-bosh" data-q="${q.id}" aria-expanded="${ochiq}">${bosh}${ik('chevron-right')}</button>` : `<div class="yq-bosh">${bosh}</div>`}
        ${ichi && ochiq ? `<div class="yq-ich">${ichi}</div>` : hol === '' ? `<p class="yq-izoh">${q.izoh}</p>` : hol === 'o' ? `<p class="yq-izoh">${q.toxtagan ? "Hozircha to'xtatilgan" : 'Bu update uchun kerak emas'}</p>` : ''}
      </li>`;
    }).join('')}</ol>
    ${S.data.ega ? `<details class="ichki" id="ichki" ${S.ichkiOchiq ? 'open' : ''}><summary>${ik('list-checks')}Jamoa uchun: ${S.data.bosqichlar.length} ichki bosqich</summary>
      <ol>${S.data.bosqichlar.map((b) => { const s = i.bosqichlar[b.id]; return `<li class="${s?.holat === 'tayyor' ? 't' : b.id === i.navbatdagi ? 'j' : ''}">${esc(b.nomi)}${s?.vaqt ? ` · ${esc(s.vaqt.slice(5, 16))}` : ''}</li>`; }).join('')}</ol></details>` : ''}
  </main>`;
  document.getElementById('orqa')?.addEventListener('click', royxatga);
  document.getElementById('relizga')?.addEventListener('click', () => { S.reliz = i.reliz.id; S.ish = null; S.royxatdan = true; chiz(); scrollTo(0, 0); });
  document.getElementById('chat')?.addEventListener('click', () => (tg?.close ? tg.close() : history.back()));
  document.getElementById('ichki')?.addEventListener('toggle', (e) => (S.ichkiOchiq = e.target.open));
  ilova.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { S.ochiq.has(b.dataset.q) ? S.ochiq.delete(b.dataset.q) : S.ochiq.add(b.dataset.q); chiz(); }));
  ilova.querySelectorAll('a[data-tg]').forEach((a) => a.addEventListener('click', (e) => { if (tg?.openTelegramLink) { e.preventDefault(); tg.openTelegramLink(a.href); } }));
}

// ── navigatsiya ──
const S = { data: null, ish: null, reliz: null, bolim: 'update', royxatdan: false, filtr: 'kut', ochiq: new Set(), ichkiOchiq: false };
function och(nom) { S.ish = nom; S.royxatdan = true; S.ochiq.clear(); chiz(); scrollTo(0, 0); }
function royxatga() { if (S.reliz) S.bolim = 'reliz'; S.ish = null; S.reliz = null; chiz(); scrollTo(0, 0); }
tg?.BackButton?.onClick(royxatga);
addEventListener('click', (e) => { if (S.filtrOchiq && !e.target.closest('.filtr-joy')) { S.filtrOchiq = false; chiz(); } });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.filtrOchiq) { S.filtrOchiq = false; chiz(); } });
function chiz() {
  if (!S.data) return;
  if (S.ish) { tg?.BackButton?.show(); ishChiz(); } else if (S.reliz) { tg?.BackButton?.show(); relizChiz(); } else { tg?.BackButton?.hide(); royxatChiz(); }
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
  // ?ish=<nom> / ?reliz=<id> yoki Telegram startapp: "<nom>" — update sahifasi, "reliz-<id>" — reliz sahifasi
  { const q = new URLSearchParams(location.search); const sp = tg?.initDataUnsafe?.start_param || '';
    if (q.get('reliz') || sp.startsWith('reliz-')) { S.reliz = q.get('reliz') || sp.slice(6); S.bolim = 'reliz'; }
    else S.ish = q.has('ish') ? q.get('ish') || null : sp || null; }
  ilova.innerHTML = `<main><div class="skelet"></div><div class="skelet"></div><div class="skelet"></div></main>`;
  ol(true);
  setInterval(() => ol(false), 10000);
}

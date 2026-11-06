// Oktoberfest · interações do site
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const fmt = (n, d = 0) => n.toLocaleString("pt-PT", { minimumFractionDigits: d, maximumFractionDigits: d });

/* ---------- Navegação ---------- */
const nav = $(".nav");
const toggle = $(".nav-toggle");
toggle.addEventListener("click", () => {
  const open = $(".nav nav").classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
});
$$(".nav nav a").forEach((a) => a.addEventListener("click", () => $(".nav nav").classList.remove("open")));

const sections = $$("section[id]");
const navLinks = $$(".nav nav a");
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
sections.forEach((s) => navObserver.observe(s));

/* ---------- Scroll: barra fixa + caneca que enche ---------- */
const beerBar = $("#scroll-beer"), foamBar = $("#scroll-foam");
function onScroll() {
  nav.classList.toggle("solid", scrollY > 40);
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(1, scrollY / max) : 0;
  const h = 56 * p;
  beerBar.setAttribute("y", 64 - h); beerBar.setAttribute("height", h);
  const f = p > 0.02 ? 5 : 0;
  foamBar.setAttribute("y", 64 - h - f); foamBar.setAttribute("height", f);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Revelar ao aparecer ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; revealObs.observe(el); });

/* ---------- Início: letras, bandeirolas, contagem decrescente ---------- */
const title = $(".hero-title");
title.innerHTML = [...title.textContent].map((c, i) => `<span aria-hidden="true" style="animation-delay:${i * 70}ms">${c}</span>`).join("");

const bunting = $(".bunting");
const colours = ["#ffffff", "#4a90d9", "#d9a21b"];
for (let i = 0; i < 30; i++) {
  const s = document.createElement("span");
  s.style.borderTopColor = colours[i % 3];
  s.style.animationDelay = (i % 5) * -0.6 + "s";
  bunting.appendChild(s);
}

const OPENING = Date.UTC(2027, 8, 18, 10, 0, 0); // 18 set. 2027, 12h em Munique
function tick() {
  const diff = OPENING - Date.now();
  if (diff <= 0) { $(".cd-label").textContent = "O Oktoberfest 2027 já começou! Prost! 🍻"; return; }
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  $("#cd-d").textContent = d; $("#cd-h").textContent = String(h).padStart(2, "0");
  $("#cd-m").textContent = String(m).padStart(2, "0"); $("#cd-s").textContent = String(s).padStart(2, "0");
}
tick(); setInterval(tick, 1000);

/* ---------- Mapa ---------- */
const PLACES = {
  munique: { name: "Munique", sub: "Theresienwiese", ll: [48.1316, 11.5494], z: 7,
    text: "O recinto do Oktoberfest fica no Theresienwiese, o «Wiesn», junto ao centro de Munique. Em 2026 recebeu um recorde de 7,4 milhões de visitantes." },
  alemanha: { name: "Alemanha", sub: "no centro da Europa", ll: [50.5, 10.4], z: 5,
    text: "A Alemanha fica no centro da Europa e tem cerca de 83,5 milhões de habitantes. Munique é a capital da Baviera, o maior dos 16 estados, no sul do país." },
  kitchener: { name: "Kitchener-Waterloo", sub: "Canadá", ll: [43.4516, -80.4925], z: 6,
    text: "É muitas vezes apontado como o maior Oktoberfest fora da Alemanha, com centenas de milhares de visitantes por ano." },
  blumenau: { name: "Blumenau", sub: "Brasil", ll: [-26.9194, -49.0661], z: 6,
    text: "Cidade do sul do Brasil fundada por imigrantes alemães. A sua Oktoberfest é uma das maiores do mundo." },
  cincinnati: { name: "Cincinnati", sub: "EUA", ll: [39.1031, -84.512], z: 6,
    text: "A «Oktoberfest Zinzinnati» é uma das maiores festas inspiradas no Oktoberfest nos Estados Unidos." },
  mundo: { name: "O mundo", sub: "vista geral", ll: [25, -20], z: 2,
    text: "O Oktoberfest nasceu em Munique, mas hoje há festas inspiradas nele em vários continentes." },
};
let map = null;
const MARKER_KEYS = ["munique", "kitchener", "blumenau", "cincinnati"];
if (window.jsVectorMap) {
  $("#map").innerHTML = "";
  map = new jsVectorMap({
    selector: "#map", map: "world", zoomButtons: true, zoomOnScroll: false, zoomMax: 25,
    selectedRegions: ["DE"],
    regionStyle: { initial: { fill: "#d8cfb9", stroke: "#f5eddc", strokeWidth: 0.6 }, hover: { fill: "#c5b894" }, selected: { fill: "#2f6db5" } },
    markers: MARKER_KEYS.map((k) => ({ name: PLACES[k].name + " · " + PLACES[k].sub, coords: PLACES[k].ll })),
    markerStyle: { initial: { fill: "#d9a21b", stroke: "#14213d", strokeWidth: 2, r: 8 }, hover: { fill: "#ffe39a", cursor: "pointer" } },
    onMarkerClick: (e, i) => showPlace(MARKER_KEYS[i], true),
    onRegionTooltipShow: (e, tip, code) => { if (code === "DE") tip.text("Alemanha 🇩🇪"); },
  });
  addEventListener("resize", () => map.updateSize());
}
const btnBox = $("#place-buttons");
Object.entries(PLACES).forEach(([k, p]) => {
  const b = document.createElement("button");
  b.dataset.place = k;
  b.innerHTML = `${p.name}<small>${p.sub}</small>`;
  b.addEventListener("click", () => showPlace(k, true));
  btnBox.appendChild(b);
});
function showPlace(k, fly) {
  const p = PLACES[k];
  $$("#place-buttons button").forEach((b) => b.classList.toggle("on", b.dataset.place === k));
  $("#place-info").innerHTML = `<h3>${p.name}</h3><p><em>${p.sub}</em></p><p>${p.text}</p>`;
  if (map && fly) map.setFocus(k === "mundo" ? { scale: 1, coords: [20, 0], animate: true } : k === "alemanha" ? { regions: ["DE"], animate: true } : { coords: p.ll, scale: p.z, animate: true });
}
showPlace("alemanha", false);
$$("[data-fly]").forEach((a) => a.addEventListener("click", () => setTimeout(() => showPlace(a.dataset.fly, true), 600)));

/* ---------- Contadores ---------- */
const countObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
    const from = to > 1000 ? to - 200 : 0, t0 = performance.now(), dur = 1600;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), v = from + (to - from) * (1 - Math.pow(1 - k, 3));
      el.textContent = to > 1000 ? Math.round(v) : fmt(v, dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    countObs.unobserve(el);
  });
}, { threshold: 0.6 });
$$(".num").forEach((n) => countObs.observe(n));

const BREWERIES = ["Augustiner", "Hacker-Pschorr", "Hofbräu", "Löwenbräu", "Paulaner", "Spaten"];
$("#breweries").innerHTML = BREWERIES.map((b) => `<span>🍺 ${b}</span>`).join("");

/* ---------- Linha do tempo ---------- */
const TIMELINE = [
  ["1810", "O casamento real", "A 12 de outubro, o príncipe herdeiro Ludwig casa com a princesa Therese. Munique festeja com uma corrida de cavalos num prado que passa a chamar-se Theresienwiese, em honra da noiva."],
  ["1811", "A festa repete-se", "A festa volta no ano seguinte e junta-lhe uma feira agrícola. Nasce a tradição de a repetir todos os anos."],
  ["1887", "O desfile dos taberneiros", "Começa o desfile em que os donos das tendas e as cervejeiras chegam ao recinto em carroças decoradas."],
  ["1950", "O primeiro «O’zapft is!»", "O presidente da câmara Thomas Wimmer abre o primeiro barril e grita «O’zapft is!». A tradição mantém-se até hoje."],
  ["2020", "Um festival cancelado", "Por causa da pandemia de COVID-19, o Oktoberfest não se realizou em 2020 nem em 2021."],
  ["2023", "Recorde de visitantes", "Cerca de 7,2 milhões de pessoas visitam o festival, que nesse ano durou 18 dias."],
  ["2025", "A 190.ª edição", "O festival abre com o tradicional «O’zapft is!» na tenda Schottenhamel."],
  ["2026", "Novo recorde", "A 191.ª edição, aberta pelo presidente da câmara Dominik Krause, recebe 7,4 milhões de visitantes em 16 dias."],
];
const tl = $("#timeline");
TIMELINE.forEach(([y], i) => {
  const b = document.createElement("button");
  b.textContent = y; b.setAttribute("role", "tab");
  b.addEventListener("click", () => showYear(i));
  tl.appendChild(b);
});
function showYear(i) {
  const [y, h, t] = TIMELINE[i];
  $$("#timeline button").forEach((b, j) => { b.classList.toggle("on", j === i); b.setAttribute("aria-selected", j === i); });
  const card = $("#timeline-card");
  card.innerHTML = `<div class="year">${y}</div><div><h3>${h}</h3><p>${t}</p></div>`;
  card.classList.remove("pop"); void card.offsetWidth; card.classList.add("pop");
}
showYear(0);
document.addEventListener("keydown", (e) => {
  if (!document.activeElement || !document.activeElement.closest("#timeline")) return;
  const cur = $$("#timeline button").findIndex((b) => b.classList.contains("on"));
  if (e.key === "ArrowRight" && cur < TIMELINE.length - 1) { showYear(cur + 1); $$("#timeline button")[cur + 1].focus(); }
  if (e.key === "ArrowLeft" && cur > 0) { showYear(cur - 1); $$("#timeline button")[cur - 1].focus(); }
});

/* ---------- Cartões e dicionário ---------- */
$$(".flip").forEach((c) => c.addEventListener("click", () => c.classList.toggle("flipped")));

const WORDS = [
  ["O’zapft is!", "O zapft is", "«Está aberto!» — grito de abertura do festival"],
  ["Prost!", "Prost", "Saúde! — diz-se ao brindar"],
  ["Maß", "Mass", "Caneca de um litro"],
  ["Wiesn", "Wiesn", "Nome local do festival e do recinto"],
  ["Brezn", "Brezn", "O pretzel bávaro, pão em forma de laço"],
  ["Dirndl", "Dirndl", "Vestido tradicional feminino"],
  ["Lederhosen", "Lederhosen", "Calções de couro tradicionais"],
  ["Gemütlichkeit", "Gemütlichkeit", "Ambiente acolhedor e alegre"],
];
const canSpeak = "speechSynthesis" in window;
$("#words").innerHTML = WORDS.map(([w, say, pt], i) => `
  <div class="word"><span class="de">${w}${canSpeak ? `<button data-say="${i}" aria-label="Ouvir ${w}">🔊</button>` : ""}</span><span class="pt">${pt}</span></div>`).join("");
$$("[data-say]").forEach((b) => b.addEventListener("click", () => {
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(WORDS[b.dataset.say][1]);
  u.lang = "de-DE"; u.rate = 0.85;
  const de = speechSynthesis.getVoices().find((v) => v.lang && v.lang.startsWith("de"));
  if (de) u.voice = de;
  speechSynthesis.speak(u);
}));

/* ---------- Minijogo: enche a Maß ---------- */
const PX_PER_L = 160, BOTTOM = 220, MAX_L = 1.25, RATE = 0.42; // litros por segundo
const beer = $("#beer"), foam = $("#foam"), bubbles = $("#bubbles"), litresEl = $("#litres"), msg = $("#game-msg");
let level = 0, pouring = false, last = 0, tries = [], round = 0, best = 0;
try { best = +(localStorage.getItem("okt-best") || 0); } catch (e) {}
$("#best").textContent = best ? best + " pontos" : "–";

function drawMug() {
  const h = Math.min(level, MAX_L) * PX_PER_L, f = level > 0.05 ? Math.min(18, 6 + level * 10) : 0;
  beer.setAttribute("y", BOTTOM - h); beer.setAttribute("height", h);
  foam.setAttribute("y", BOTTOM - h - f); foam.setAttribute("height", f);
  litresEl.textContent = fmt(level, 2);
}
function addBubble() {
  const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  const x = 30 + Math.random() * 100, r = 1.5 + Math.random() * 2.5;
  c.setAttribute("cx", x); c.setAttribute("cy", BOTTOM - 4); c.setAttribute("r", r); c.setAttribute("fill", "rgba(255,255,255,.7)");
  bubbles.appendChild(c);
  const top = BOTTOM - level * PX_PER_L, t0 = performance.now();
  const up = (t) => {
    const k = (t - t0) / 900, y = BOTTOM - 4 - k * (BOTTOM - top);
    c.setAttribute("cy", y);
    if (k < 1) requestAnimationFrame(up); else c.remove();
  };
  requestAnimationFrame(up);
}
function loop(t) {
  if (!pouring) return;
  const dt = (t - last) / 1000; last = t;
  level += RATE * dt * (1 + level * 0.35); // enche um pouco mais depressa no fim
  if (Math.random() < 0.35) addBubble();
  drawMug();
  if (level >= MAX_L) { level = MAX_L + 0.01; stopPour(); return; }
  requestAnimationFrame(loop);
}
function startPour(e) {
  if (e) e.preventDefault();
  if (pouring || round >= 3) return;
  level = 0; drawMug(); msg.innerHTML = "&nbsp;";
  pouring = true; last = performance.now(); requestAnimationFrame(loop);
}
function stopPour() {
  if (!pouring) return;
  pouring = false; round++;
  let pts, text;
  if (level > MAX_L) { pts = 0; text = "Entornou! 🫗 0 pontos"; $(".mug-stage").classList.add("shake"); setTimeout(() => $(".mug-stage").classList.remove("shake"), 450); }
  else {
    const diff = Math.abs(level - 1);
    pts = Math.max(0, Math.round(100 - diff * 400));
    text = diff < 0.02 ? "Perfeito! Um verdadeiro profissional! 🏆" : diff < 0.06 ? "Muito bem! Quase exato! 👏"
      : level < 1 ? "Cerveja a menos… o cliente vai reclamar! 😅" : "Demasiada cerveja, mas o cliente agradece! 😄";
    text += ` ${pts} pontos`;
  }
  tries.push(pts);
  msg.textContent = text;
  $("#tries").innerHTML = tries.map((p, i) => `<span>Tentativa ${i + 1}: ${p}</span>`).join("");
  if (round >= 3) {
    const total = tries.reduce((a, b) => a + b, 0);
    msg.textContent += ` · Total: ${total}/300`;
    if (total > best) { best = total; try { localStorage.setItem("okt-best", best); } catch (e) {} $("#best").textContent = best + " pontos (novo recorde!)"; }
    const btn = $("#pour-btn"); btn.textContent = "🔄 Jogar outra vez";
  }
}
const pourBtn = $("#pour-btn");
pourBtn.addEventListener("pointerdown", (e) => {
  if (round >= 3) { round = 0; tries = []; level = 0; drawMug(); $("#tries").innerHTML = ""; msg.innerHTML = "&nbsp;"; pourBtn.textContent = "🍺 Carrega para encher"; return; }
  pourBtn.setPointerCapture(e.pointerId); startPour(e);
});
pourBtn.addEventListener("pointerup", stopPour);
pourBtn.addEventListener("pointercancel", stopPour);
pourBtn.addEventListener("contextmenu", (e) => e.preventDefault());
const gameVisible = () => { const r = $("#jogo").getBoundingClientRect(); return r.top < innerHeight * 0.6 && r.bottom > innerHeight * 0.4; };
addEventListener("keydown", (e) => { if (e.code === "Space" && gameVisible() && !e.repeat) { e.preventDefault(); startPour(); } });
addEventListener("keyup", (e) => { if (e.code === "Space" && pouring) { e.preventDefault(); stopPour(); } });
drawMug();

/* ---------- Separadores ---------- */
$$(".tabs button").forEach((b) => b.addEventListener("click", () => {
  $$(".tabs button").forEach((x) => x.setAttribute("aria-selected", x === b));
  $$(".tab-panel").forEach((p) => p.classList.toggle("active", p.id === "tab-" + b.dataset.tab));
}));

/* ---------- Quiz ---------- */
const QUIZ = [
  ["Em que cidade se realiza o Oktoberfest?", ["Munique", "Berlim", "Hamburgo", "Colónia"], "Munique, a capital da Baviera."],
  ["Que acontecimento deu origem ao festival, em 1810?", ["O casamento do príncipe Ludwig com Therese", "O fim de uma guerra", "Uma colheita recorde", "O aniversário do rei"], "Foi a festa do casamento real, a 12 de outubro de 1810."],
  ["O que significa «O’zapft is!»?", ["Está aberto!", "Saúde!", "Mais uma!", "Bem-vindos!"], "Diz-se quando se abre o primeiro barril."],
  ["Quanta cerveja leva uma Maß?", ["1 litro", "0,5 litros", "2 litros", "0,33 litros"], "A Maß é a caneca de um litro."],
  ["Quantas cervejeiras podem servir no recinto?", ["6", "3", "12", "20"], "Só as seis cervejeiras de Munique."],
  ["Quantos visitantes teve o Oktoberfest em 2026?", ["7,4 milhões", "1 milhão", "3 milhões", "12 milhões"], "Foi um recorde: 7,4 milhões em 16 dias."],
  ["Como se chama o recinto do festival?", ["Theresienwiese", "Marienplatz", "Englischer Garten", "Olympiapark"], "O nome homenageia a princesa Therese."],
  ["Qual é o traje tradicional feminino?", ["Dirndl", "Lederhosen", "Kimono", "Sari"], "As lederhosen são o traje masculino."],
  ["Em que país fica Blumenau, com uma das maiores Oktoberfest do mundo?", ["Brasil", "Canadá", "Estados Unidos", "Áustria"], "Blumenau fica no sul do Brasil."],
  ["Quem abre o primeiro barril?", ["O presidente da câmara de Munique", "O chanceler alemão", "O rei da Baviera", "O cervejeiro mais velho"], "É ele quem grita «O’zapft is!»."],
];
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
let qi = 0, score = 0, order = [];
const qbox = $("#quiz-box");
function startQuiz() { qi = 0; score = 0; order = shuffle(QUIZ.map((_, i) => i)); showQ(); }
function showQ() {
  const [q, opts, why] = QUIZ[order[qi]];
  const right = opts[0];
  qbox.innerHTML = `
    <div class="progress"><div style="width:${(qi / QUIZ.length) * 100}%"></div></div>
    <div class="qnum">Pergunta ${qi + 1} de ${QUIZ.length} · ${score} certas</div>
    <h3>${q}</h3>
    <div class="opts">${shuffle(opts).map((o) => `<button>${o}</button>`).join("")}</div>
    <p class="explain"></p>`;
  $$(".opts button", qbox).forEach((b) => b.addEventListener("click", () => {
    const ok = b.textContent === right;
    if (ok) score++;
    $$(".opts button", qbox).forEach((x) => { x.disabled = true; if (x.textContent === right) x.classList.add("right"); });
    if (!ok) b.classList.add("wrong");
    $(".explain", qbox).textContent = (ok ? "Certo! " : "Errado. ") + why;
    const next = document.createElement("button");
    next.className = "btn next"; next.textContent = qi < QUIZ.length - 1 ? "Próxima pergunta →" : "Ver resultado";
    next.addEventListener("click", () => { qi++; qi < QUIZ.length ? showQ() : showResult(); });
    qbox.appendChild(next); next.focus();
  }));
}
function showResult() {
  const msgs = [[10, "Perfeito! És um verdadeiro especialista do Wiesn! 🏆"], [8, "Muito bom! Já podes ir ao Oktoberfest. 🍻"], [5, "Nada mal! Mais uma volta pelo site e chegas lá."], [0, "Volta a ler o site e tenta outra vez! 😉"]];
  const m = msgs.find(([n]) => score >= n)[1];
  qbox.innerHTML = `<div class="result">
    <div class="progress"><div style="width:100%"></div></div>
    <p>A tua pontuação</p><div class="score">${score}/${QUIZ.length}</div>
    <div class="mugs-row">${"🍺".repeat(score)}${"<span style='opacity:.25'>🍺</span>".repeat(QUIZ.length - score)}</div>
    <p>${m}</p><button class="btn" id="quiz-again">Jogar outra vez</button></div>`;
  $("#quiz-again").addEventListener("click", startQuiz);
}
startQuiz();

/* ---------- Lightbox ---------- */
const lb = $("#lightbox");
$$("[data-lightbox]").forEach((img) => img.addEventListener("click", () => {
  $("img", lb).src = img.src; $("img", lb).alt = img.alt; $("p", lb).textContent = img.alt;
  lb.hidden = false; $("button", lb).focus();
}));
lb.addEventListener("click", (e) => { if (e.target !== $("img", lb)) lb.hidden = true; });
addEventListener("keydown", (e) => { if (e.key === "Escape") lb.hidden = true; });

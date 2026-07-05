import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  onValue,
  push,
  ref,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDBtTnf1d-YKcbmbqPHOQ6DBifphFiPSSM",
  authDomain: "team-mira-tohoku-ohen.firebaseapp.com",
  databaseURL: "https://team-mira-tohoku-ohen-default-rtdb.firebaseio.com",
  projectId: "team-mira-tohoku-ohen",
  storageBucket: "team-mira-tohoku-ohen.firebasestorage.app",
  messagingSenderId: "251457536322",
  appId: "1:251457536322:web:f1f7356943a05b48ae08db",
  measurementId: "G-GJQ5TBKL0D",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const votesRef = ref(db, "ouen/votes");

const STYLES = [
  { id: "supporter", emoji: "🙋", label: "現地でサポーターとして参加する" },
  { id: "listen", emoji: "👂", label: "演説を聴きに行く" },
  { id: "stream", emoji: "📺", label: "配信・中継があれば見る" },
  { id: "heart", emoji: "❤️", label: "行けないけど応援してる" },
];

const PREFECTURES = [
  {
    id: "aomori",
    name: "青森",
    x: 232,
    y: 58,
    path: "M143 31 L196 13 L262 21 L320 11 L355 39 L334 82 L293 99 L255 86 L218 107 L165 91 L128 69 Z",
    cities: [
      { id: "aomori-city", name: "青森市", x: 228, y: 57 },
      { id: "hirosaki", name: "弘前市", x: 170, y: 75 },
      { id: "hachinohe", name: "八戸市", x: 308, y: 75 },
      { id: "goshogawara", name: "五所川原市", x: 184, y: 41 },
      { id: "other-aomori", name: "青森県内その他", x: 254, y: 91 },
    ],
  },
  {
    id: "iwate",
    name: "岩手",
    x: 290,
    y: 178,
    path: "M252 100 L306 93 L347 119 L358 186 L336 256 L292 274 L254 235 L239 167 Z",
    cities: [
      { id: "morioka", name: "盛岡市", x: 291, y: 160 },
      { id: "hanamaki", name: "花巻市", x: 282, y: 201 },
      { id: "kitakami", name: "北上市", x: 277, y: 219 },
      { id: "ichinoseki", name: "一関市", x: 266, y: 253 },
      { id: "miyako", name: "宮古市", x: 329, y: 177 },
      { id: "other-iwate", name: "岩手県内その他", x: 317, y: 229 },
    ],
  },
  {
    id: "akita",
    name: "秋田",
    x: 183,
    y: 169,
    path: "M166 91 L219 107 L238 166 L252 238 L220 276 L172 257 L141 209 L130 142 Z",
    cities: [
      { id: "akita-city", name: "秋田市", x: 178, y: 174 },
      { id: "yokote", name: "横手市", x: 216, y: 223 },
      { id: "odate", name: "大館市", x: 187, y: 116 },
      { id: "daisen", name: "大仙市", x: 199, y: 199 },
      { id: "other-akita", name: "秋田県内その他", x: 158, y: 231 },
    ],
  },
  {
    id: "yamagata",
    name: "山形",
    x: 202,
    y: 312,
    path: "M172 257 L220 276 L248 331 L235 405 L199 426 L162 388 L151 322 Z",
    cities: [
      { id: "yamagata-city", name: "山形市", x: 207, y: 345 },
      { id: "tsuruoka", name: "鶴岡市", x: 168, y: 311 },
      { id: "sakata", name: "酒田市", x: 169, y: 276 },
      { id: "yonezawa", name: "米沢市", x: 219, y: 394 },
      { id: "other-yamagata", name: "山形県内その他", x: 187, y: 374 },
    ],
  },
  {
    id: "miyagi",
    name: "宮城",
    x: 282,
    y: 327,
    path: "M248 255 L292 274 L337 258 L350 320 L326 379 L273 370 L248 331 L220 276 Z",
    cities: [
      { id: "sendai", name: "仙台市", x: 282, y: 331 },
      { id: "ishinomaki", name: "石巻市", x: 327, y: 314 },
      { id: "osaki", name: "大崎市", x: 281, y: 292 },
      { id: "natori", name: "名取市", x: 284, y: 354 },
      { id: "other-miyagi", name: "宮城県内その他", x: 318, y: 354 },
    ],
  },
  {
    id: "fukushima",
    name: "福島",
    x: 258,
    y: 433,
    path: "M199 426 L235 405 L273 370 L326 379 L357 444 L334 500 L268 508 L214 487 Z",
    cities: [
      { id: "fukushima-city", name: "福島市", x: 248, y: 421 },
      { id: "koriyama", name: "郡山市", x: 267, y: 462 },
      { id: "iwaki", name: "いわき市", x: 329, y: 478 },
      { id: "aizuwakamatsu", name: "会津若松市", x: 217, y: 459 },
      { id: "other-fukushima", name: "福島県内その他", x: 293, y: 431 },
    ],
  },
];

const state = {
  selectedPrefectureId: null,
  selectedCityId: null,
  mapScale: "tohoku",
  submitted: false,
  votes: [],
  isSubmitting: false,
};

const els = {
  totalCount: document.querySelector("#total-count"),
  prefectureGrid: document.querySelector("#prefecture-grid"),
  cityGrid: document.querySelector("#city-grid"),
  styleGrid: document.querySelector("#style-grid"),
  stepPrefecture: document.querySelector("#step-prefecture"),
  stepCity: document.querySelector("#step-city"),
  stepStyle: document.querySelector("#step-style"),
  selectedPrefectureName: document.querySelector("#selected-prefecture-name"),
  backToPrefecture: document.querySelector("#back-to-prefecture"),
  scaleTohoku: document.querySelector("#scale-tohoku"),
  scalePrefecture: document.querySelector("#scale-prefecture"),
  submittedMsg: document.querySelector("#submitted-msg"),
  resetBtn: document.querySelector("#reset-btn"),
  mapSvg: document.querySelector("#map-svg"),
  mapTitle: document.querySelector("#map-title"),
  mapSubtitle: document.querySelector("#map-subtitle"),
  mapScalePill: document.querySelector("#map-scale-pill"),
  legend: document.querySelector("#legend"),
  outsideArea: document.querySelector("#outside-area"),
  statsList: document.querySelector("#stats-list"),
};

function prefectureById(id) {
  return PREFECTURES.find((prefecture) => prefecture.id === id);
}

function cityById(prefecture, cityId) {
  return prefecture?.cities.find((city) => city.id === cityId);
}

function styleById(id) {
  return STYLES.find((style) => style.id === id);
}

function countVotes(filter = {}) {
  return state.votes.filter((vote) => {
    return Object.entries(filter).every(([key, value]) => vote[key] === value);
  }).length;
}

function voteStyles(filter = {}) {
  const ids = new Set(
    state.votes
      .filter((vote) => Object.entries(filter).every(([key, value]) => vote[key] === value))
      .map((vote) => vote.styleId)
  );
  return STYLES.filter((style) => ids.has(style.id)).map((style) => style.emoji).join(" ");
}

function bubbleRadius(count) {
  if (!count) return 7;
  return Math.min(27, 8 + Math.sqrt(count) * 7);
}

function createButton(className, text, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function renderPrefectureButtons() {
  els.prefectureGrid.innerHTML = "";
  PREFECTURES.forEach((prefecture) => {
    const count = countVotes({ prefectureId: prefecture.id });
    const suffix = count ? `（${count}）` : "";
    const button = createButton("region-btn", `${prefecture.name}${suffix}`, () => selectPrefecture(prefecture.id));
    if (state.selectedPrefectureId === prefecture.id) button.classList.add("is-selected");
    els.prefectureGrid.appendChild(button);
  });

  const outside = createButton("region-btn outside", "🗾 東北外から応援", () => {
    state.selectedPrefectureId = "outside";
    state.selectedCityId = "outside";
    state.mapScale = "tohoku";
    render();
    showStyleStep();
  });
  if (state.selectedPrefectureId === "outside") outside.classList.add("is-selected");
  els.prefectureGrid.appendChild(outside);
}

function renderCityButtons() {
  els.cityGrid.innerHTML = "";
  const prefecture = prefectureById(state.selectedPrefectureId);
  if (!prefecture) return;

  prefecture.cities.forEach((city) => {
    const count = countVotes({ cityId: city.id });
    const suffix = count ? `（${count}）` : "";
    const button = createButton("region-btn", `${city.name}${suffix}`, () => selectCity(city.id));
    if (state.selectedCityId === city.id) button.classList.add("is-selected");
    els.cityGrid.appendChild(button);
  });
}

function renderStyleButtons() {
  els.styleGrid.innerHTML = "";
  STYLES.forEach((style) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "status-btn";
    button.disabled = state.isSubmitting;
    button.innerHTML = `<span class="emoji">${style.emoji}</span><span>${style.label}</span>`;
    button.addEventListener("click", () => submitVote(style.id));
    els.styleGrid.appendChild(button);
  });
}

function renderLegend() {
  els.legend.innerHTML = STYLES.map((style) => {
    return `<div class="legend-item"><span>${style.emoji}</span><span>${style.label}</span></div>`;
  }).join("");
}

function selectPrefecture(prefectureId) {
  state.selectedPrefectureId = prefectureId;
  state.selectedCityId = null;
  state.mapScale = "prefecture";
  render();
}

function selectCity(cityId) {
  state.selectedCityId = cityId;
  state.mapScale = "prefecture";
  render();
  showStyleStep();
}

function showStyleStep() {
  els.stepStyle.classList.remove("is-hidden");
  els.stepStyle.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function submitVote(styleId) {
  const prefectureId = state.selectedPrefectureId;
  const cityId = state.selectedCityId;
  if (!prefectureId || !cityId || state.isSubmitting) return;

  state.isSubmitting = true;
  renderStyleButtons();

  try {
    await push(votesRef, {
      prefectureId,
      cityId,
      styleId,
      createdAt: serverTimestamp(),
    });

    state.submitted = true;
    const prefecture = prefectureById(prefectureId);
    const city = cityById(prefecture, cityId);
    const style = styleById(styleId);
    const areaName = prefecture ? `${prefecture.name}・${city.name}` : "東北外";

    els.submittedMsg.innerHTML = `<strong>応援ありがとうございます！</strong>${areaName}から「${style.emoji} ${style.label}」で受け取りました。`;
    els.submittedMsg.classList.remove("is-hidden");
    els.resetBtn.classList.remove("is-hidden");
    els.stepStyle.classList.add("is-hidden");
  } catch (error) {
    els.submittedMsg.innerHTML = `<strong>送信できませんでした</strong>少し時間を置いて、もう一度お試しください。`;
    els.submittedMsg.classList.remove("is-hidden");
    console.error(error);
  } finally {
    state.isSubmitting = false;
    render();
  }
}

function resetForm() {
  state.selectedPrefectureId = null;
  state.selectedCityId = null;
  state.mapScale = "tohoku";
  state.submitted = false;
  els.submittedMsg.classList.add("is-hidden");
  els.resetBtn.classList.add("is-hidden");
  els.stepStyle.classList.add("is-hidden");
  render();
}

function renderMap() {
  const selectedPrefecture = prefectureById(state.selectedPrefectureId);
  const showCities = state.mapScale === "prefecture" && selectedPrefecture;
  const viewBox = showCities ? "110 70 270 450" : "100 0 270 520";

  els.mapSvg.setAttribute("viewBox", viewBox);
  els.mapTitle.textContent = showCities ? `${selectedPrefecture.name} 応援マップ` : "東北 応援マップ";
  els.mapSubtitle.textContent = showCities
    ? "市ごとの応援人数を円の大きさで表示しています"
    : "県ごとの応援人数を円の大きさで表示しています";
  els.mapScalePill.textContent = showCities ? "県 > 市" : "東北 > 県";

  const shapes = PREFECTURES.map((prefecture) => {
    const muted = showCities && prefecture.id !== selectedPrefecture.id ? " is-muted" : "";
    return `<path class="pref-shape${muted}" d="${prefecture.path}"></path>`;
  }).join("");

  const bubbles = showCities
    ? selectedPrefecture.cities.map((city) => {
        const count = countVotes({ cityId: city.id });
        const r = bubbleRadius(count);
        const labelY = city.y + r + 13;
        const selected = state.selectedCityId === city.id ? " has-support" : "";
        return `<g>
          <circle class="bubble${count || selected ? " has-support" : ""}" cx="${city.x}" cy="${city.y}" r="${r}"></circle>
          <text class="city-label" x="${city.x}" y="${labelY}">${city.name.replace("県内その他", "その他")}</text>
        </g>`;
      }).join("")
    : PREFECTURES.map((prefecture) => {
        const count = countVotes({ prefectureId: prefecture.id });
        const r = bubbleRadius(count);
        const labelY = prefecture.y + r + 15;
        return `<g>
          <circle class="bubble${count ? " has-support" : ""}" cx="${prefecture.x}" cy="${prefecture.y}" r="${r}"></circle>
          <text class="map-label" x="${prefecture.x}" y="${labelY}">${prefecture.name}</text>
        </g>`;
      }).join("");

  els.mapSvg.innerHTML = shapes + bubbles;
}

function renderStats() {
  const outsideCount = countVotes({ prefectureId: "outside" });
  if (outsideCount) {
    const emojis = voteStyles({ prefectureId: "outside" });
    els.outsideArea.textContent = `🗾 東北外からも応援が届いています！ ${emojis}`;
    els.outsideArea.classList.remove("is-hidden");
  } else {
    els.outsideArea.classList.add("is-hidden");
  }

  const selectedPrefecture = prefectureById(state.selectedPrefectureId);
  const rows = selectedPrefecture && state.mapScale === "prefecture"
    ? selectedPrefecture.cities.map((city) => ({
        name: city.name,
        count: countVotes({ cityId: city.id }),
        emojis: voteStyles({ cityId: city.id }),
      }))
    : PREFECTURES.map((prefecture) => ({
        name: prefecture.name,
        count: countVotes({ prefectureId: prefecture.id }),
        emojis: voteStyles({ prefectureId: prefecture.id }),
      }));

  const activeRows = rows.filter((row) => row.count > 0);
  if (!activeRows.length) {
    els.statsList.innerHTML = `<div class="empty-state">まだ応援は届いていません</div>`;
    return;
  }

  els.statsList.innerHTML = activeRows
    .sort((a, b) => b.count - a.count)
    .map((row) => `<div class="region-stat"><span>${row.name}</span><span>${row.emojis} ${row.count}人</span></div>`)
    .join("");
}

function renderScaleTabs() {
  const showPrefecture = state.mapScale === "prefecture";
  els.scaleTohoku.classList.toggle("is-active", !showPrefecture);
  els.scalePrefecture.classList.toggle("is-active", showPrefecture);
}

function render() {
  const selectedPrefecture = prefectureById(state.selectedPrefectureId);
  els.totalCount.textContent = state.votes.length;

  els.stepPrefecture.classList.toggle("is-hidden", Boolean(state.selectedPrefectureId) || state.submitted);
  els.stepCity.classList.toggle("is-hidden", !selectedPrefecture || state.submitted);
  if (selectedPrefecture) {
    els.selectedPrefectureName.textContent = selectedPrefecture.name;
  }

  renderPrefectureButtons();
  renderCityButtons();
  renderStyleButtons();
  renderScaleTabs();
  renderMap();
  renderStats();
}

els.backToPrefecture.addEventListener("click", () => {
  state.selectedPrefectureId = null;
  state.selectedCityId = null;
  state.mapScale = "tohoku";
  els.stepStyle.classList.add("is-hidden");
  render();
});

els.scaleTohoku.addEventListener("click", () => {
  state.mapScale = "tohoku";
  render();
});

els.scalePrefecture.addEventListener("click", () => {
  state.mapScale = "prefecture";
  render();
});

els.resetBtn.addEventListener("click", resetForm);

renderLegend();
render();

onValue(votesRef, (snapshot) => {
  const data = snapshot.val() || {};
  state.votes = Object.entries(data).map(([id, vote]) => ({ id, ...vote }));
  render();
});

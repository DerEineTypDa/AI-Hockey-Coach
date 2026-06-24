const STORAGE_KEY = 'aiHockeyCoachSave';

// Core player attributes. Every system in the app reads from this single list.
const attributeNames = [
  'Schusskraft',
  'Schussgenauigkeit',
  'Skating',
  'Geschwindigkeit',
  'Ausdauer',
  'Technik',
  'Puckkontrolle',
  'Spielverständnis',
  'Defensive',
  'Teamplay',
  'Mentalität',
];

const trainingEffects = {
  Schusstraining: { Schusskraft: 2.2, Schussgenauigkeit: 2.6, Mentalität: 0.4 },
  Stickhandling: { Technik: 1.7, Puckkontrolle: 2.8, Spielverständnis: 0.6 },
  Krafttraining: { Schusskraft: 1.5, Ausdauer: 0.7, Defensive: 0.6, Mentalität: 0.4 },
  Sprinttraining: { Geschwindigkeit: 2.7, Skating: 1.4, Ausdauer: 0.5 },
  Ausdauertraining: { Ausdauer: 3.1, Mentalität: 0.7, Geschwindigkeit: 0.4 },
  Techniktraining: { Technik: 2.2, Skating: 1.6, Puckkontrolle: 1.1 },
  Matchsimulation: { Spielverständnis: 2.2, Teamplay: 1.8, Defensive: 1.0, Mentalität: 0.8 },
};

// Career progression is intentionally data-driven so thresholds and labels are easy to tune.
const careerStages = [
  'Nachwuchs',
  'U15',
  'U17',
  'U20',
  'Regionalliga',
  'Profi',
  'Nationalmannschaft',
  'NHL',
];

const achievements = [
  { id: 'firstGoal', title: 'Erstes Tor', text: 'Erziele dein erstes Tor.' },
  { id: 'shots100', title: '100 Schüsse', text: 'Sammle 100 Schüsse.' },
  { id: 'train50', title: '50 Trainings', text: 'Absolviere 50 Einheiten.' },
  { id: 'u17', title: 'U17 erreicht', text: 'Steige in die U17 auf.' },
  { id: 'national', title: 'Nationalspieler', text: 'Erreiche die Nationalmannschaft.' },
  { id: 'draft', title: 'NHL Draft', text: 'Erreiche NHL-Niveau.' },
  { id: 'cup', title: 'Stanley Cup Sieger', text: 'Gewinne die Profi-Finalserie.' },
  { id: 'balanced', title: 'Allrounder', text: 'Alle Attribute über 70.' },
];

const motivationTips = [
  'Kurze, harte Einheiten bringen Tempo. Lange Einheiten bauen die Basis.',
  'Gute Spieler trainieren Stärken. Sehr gute Spieler schließen Lücken.',
  'Nach intensiven Wochen steigt Verletzungsrisiko. Plane Regeneration ein.',
  'Spielverständnis wächst durch Matchsimulationen und Videoanalyse.',
  'Skating und Puckkontrolle sind die Basis für fast jede Position.',
];

const defaultState = {
  profile: {
    name: 'Mika Frost',
    age: 14,
    height: 172,
    weight: 66,
    position: 'Stürmer',
    hand: 'Links',
  },
  attributes: {
    Schusskraft: 68,
    Schussgenauigkeit: 61,
    Skating: 57,
    Geschwindigkeit: 64,
    Ausdauer: 59,
    Technik: 62,
    Puckkontrolle: 60,
    Spielverständnis: 58,
    Defensive: 52,
    Teamplay: 63,
    Mentalität: 66,
  },
  careerIndex: 0,
  season: 1,
  injury: { active: false, days: 0, text: 'fit' },
  trainingLog: [],
  games: [],
  events: [],
  unlocked: [],
  history: [{ label: 'Start', overall: 61, trainingHours: 0, career: 0, goals: 0, assists: 0 }],
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  sidebar: $('#sidebar'),
  pageTitle: $('#pageTitle'),
  sidebarRating: $('#sidebarRating'),
  sidebarRatingFill: $('#sidebarRatingFill'),
  heroName: $('#heroName'),
  heroCoach: $('#heroCoach'),
  overallScore: $('#overallScore'),
  careerBadge: $('#careerBadge'),
  profileSummary: $('#profileSummary'),
  dailyGoals: $('#dailyGoals'),
  dailyProgress: $('#dailyProgress'),
  coachAdvice: $('#coachAdvice'),
  scoutGrade: $('#scoutGrade'),
  scoutReport: $('#scoutReport'),
  attributeBars: $('#attributeBars'),
  profileForm: $('#profileForm'),
  nameInput: $('#nameInput'),
  ageInput: $('#ageInput'),
  heightInput: $('#heightInput'),
  weightInput: $('#weightInput'),
  positionInput: $('#positionInput'),
  handInput: $('#handInput'),
  profileRatingText: $('#profileRatingText'),
  ratingCircle: $('#ratingCircle'),
  ratingExplanation: $('#ratingExplanation'),
  trainingForm: $('#trainingForm'),
  trainingType: $('#trainingType'),
  trainingMinutes: $('#trainingMinutes'),
  trainingIntensity: $('#trainingIntensity'),
  injuryStatus: $('#injuryStatus'),
  trainingHours: $('#trainingHours'),
  trainingLog: $('#trainingLog'),
  careerStatus: $('#careerStatus'),
  careerTrack: $('#careerTrack'),
  achievementCount: $('#achievementCount'),
  achievements: $('#achievements'),
  seasonLabel: $('#seasonLabel'),
  gameResult: $('#gameResult'),
  lastGameStats: $('#lastGameStats'),
  seasonRecord: $('#seasonRecord'),
  seasonStats: $('#seasonStats'),
  careerPercent: $('#careerPercent'),
  calendarGrid: $('#calendarGrid'),
  weekGoal: $('#weekGoal'),
  eventFeed: $('#eventFeed'),
  toast: $('#toast'),
};

init();

function init() {
  bindNavigation();
  bindForms();
  render();
  showToast('AI Hockey Coach ist bereit. Dein Spielstand wird automatisch gespeichert.');
}

function bindNavigation() {
  $('#menuButton').addEventListener('click', () => elements.sidebar.classList.toggle('open'));
  $$('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      $$('.nav-item').forEach((item) => item.classList.remove('active'));
      $$('.view').forEach((view) => view.classList.remove('active'));
      button.classList.add('active');
      $(`#${button.dataset.view}`).classList.add('active');
      elements.pageTitle.textContent = button.textContent;
      elements.sidebar.classList.remove('open');
      renderCharts();
    });
  });

  $('#quickTrainButton').addEventListener('click', () => addTraining('Techniktraining', 45, 1));
  $('#eventButton').addEventListener('click', randomEvent);
  $('#promotionButton').addEventListener('click', checkPromotion);
  $('#seasonButton').addEventListener('click', finishSeason);
  $('#simulateGameButton').addEventListener('click', simulateGame);
}

function bindForms() {
  elements.profileForm.addEventListener('input', () => {
    state.profile = {
      name: elements.nameInput.value || 'Spieler',
      age: Number(elements.ageInput.value) || 14,
      height: Number(elements.heightInput.value) || 172,
      weight: Number(elements.weightInput.value) || 66,
      position: elements.positionInput.value,
      hand: elements.handInput.value,
    };
    saveAndRender();
  });

  elements.trainingForm.addEventListener('submit', (event) => {
    event.preventDefault();
    addTraining(
      elements.trainingType.value,
      Number(elements.trainingMinutes.value),
      Number(elements.trainingIntensity.value),
    );
  });
}

function addTraining(type, minutes, intensity) {
  if (state.injury.active && intensity > 1) {
    showToast('Der Physio stoppt harte Einheiten während einer Verletzung.');
    return;
  }

  const safeMinutes = clamp(minutes || 60, 15, 180);
  const fatigue = getWeeklyMinutes() / 420;
  const injuryRisk = Math.max(0, (safeMinutes / 180) * intensity * 0.18 + fatigue * 0.08 - avgAttribute('Ausdauer') / 900);

  // Training gains scale with duration and intensity, while injuries reduce the effect.
  Object.entries(trainingEffects[type]).forEach(([attribute, gain]) => {
    const injuryPenalty = state.injury.active ? 0.45 : 1;
    const minutesFactor = safeMinutes / 60;
    state.attributes[attribute] = clamp(
      state.attributes[attribute] + gain * minutesFactor * intensity * injuryPenalty,
      1,
      100,
    );
  });

  const entry = {
    type,
    minutes: safeMinutes,
    intensity,
    date: new Date().toISOString(),
  };
  state.trainingLog.unshift(entry);
  state.trainingLog = state.trainingLog.slice(0, 80);
  state.events.unshift({
    title: type,
    text: `${safeMinutes} Minuten, Intensität ${intensityText(intensity)}.`,
    date: entry.date,
  });

  if (Math.random() < injuryRisk) {
    state.injury = {
      active: true,
      days: 7 + Math.floor(Math.random() * 14),
      text: 'leichte Blessur',
    };
    state.events.unshift({
      title: 'Verletzungssystem',
      text: 'Überlastung erkannt. Harte Einheiten sind vorübergehend riskant.',
      date: new Date().toISOString(),
    });
  }

  pushHistory(type);
  updateAchievements();
  checkPromotion(true);
  saveAndRender();
  showToast(`${type} gespeichert. Attribute wurden aktualisiert.`);
}

function simulateGame() {
  const overall = getOverall();
  const offense = avgAttribute('Schusskraft', 'Schussgenauigkeit', 'Puckkontrolle', 'Spielverständnis');
  const mobility = avgAttribute('Skating', 'Geschwindigkeit', 'Ausdauer');
  const defense = avgAttribute('Defensive', 'Teamplay', 'Mentalität');
  const position = state.profile.position;
  const form = state.injury.active ? 0.72 : 1;
  const roll = () => Math.random();

  // The simulator favors the player's role but still leaves room for game-to-game variance.
  let shots = Math.max(0, Math.round((offense / 18 + mobility / 35 + roll() * 4) * form));
  let goals = 0;
  let assists = 0;

  if (position === 'Torwart') {
    shots = 0;
    goals = 0;
    assists = roll() < 0.06 ? 1 : 0;
  } else {
    goals = Array.from({ length: shots }).filter(() => roll() < (offense / 520) * form).length;
    assists = Math.floor(roll() * (overall / 32));
  }

  const plusMinus = Math.round((defense + offense - 115) / 18 + roll() * 3 - 1);
  const penalties = roll() < (100 - state.attributes.Mentalität) / 170 ? 2 : 0;
  const iceTime = Math.round(9 + overall / 6 + mobility / 10 + roll() * 4);
  const won = goals + assists + plusMinus + roll() * 2 > 2;

  const game = {
    date: new Date().toISOString(),
    goals,
    assists,
    shots,
    plusMinus,
    penalties,
    iceTime,
    won,
  };

  state.games.unshift(game);
  state.events.unshift({
    title: won ? 'Sieg in der Simulation' : 'Knappes Spiel',
    text: `${goals} Tore, ${assists} Assists, ${shots} Schüsse, ${iceTime} Minuten Eiszeit.`,
    date: game.date,
  });

  if (won && state.careerIndex >= 5 && overall > 88 && Math.random() > 0.74) {
    unlock('cup');
  }

  pushHistory('Spiel');
  updateAchievements();
  checkPromotion(true);
  saveAndRender();
  showToast(won ? 'Starkes Spiel simuliert.' : 'Spiel simuliert. Der Coach sieht Entwicklungspotenzial.');
}

function checkPromotion(silent = false) {
  const overall = getOverall();
  const games = state.games.length;
  const hours = getTrainingHours();
  const thresholds = [0, 52, 60, 68, 74, 80, 87, 92];
  const next = state.careerIndex + 1;

  if (next < careerStages.length && overall >= thresholds[next] && games + hours / 3 >= next * 3) {
    state.careerIndex = next;
    state.events.unshift({
      title: 'Karriere-Aufstieg',
      text: `Die KI stuft dich in ${careerStages[state.careerIndex]} ein.`,
      date: new Date().toISOString(),
    });
    updateAchievements();
    saveAndRender();
    showToast(`Aufstieg: ${careerStages[state.careerIndex]}!`);
    return;
  }

  if (!silent) {
    showToast('Noch kein Aufstieg. Verbessere OVR, Spielpraxis und Trainingskonstanz.');
  }
}

function finishSeason() {
  const games = getSeasonTotals();
  state.season += 1;
  state.injury = { active: false, days: 0, text: 'fit' };
  state.history.push({
    label: `Saison ${state.season - 1}`,
    overall: getOverall(),
    trainingHours: getTrainingHours(),
    career: state.careerIndex,
    goals: games.goals,
    assists: games.assists,
  });
  state.events.unshift({
    title: 'Saison abgeschlossen',
    text: `Neue Saison gestartet. Bilanz: ${games.goals} Tore, ${games.assists} Assists.`,
    date: new Date().toISOString(),
  });
  updateAchievements();
  saveAndRender();
  showToast(`Saison ${state.season} gestartet.`);
}

function randomEvent() {
  const events = [
    () => {
      const attr = weakestAttributes()[0].name;
      state.attributes[attr] = clamp(state.attributes[attr] + 2, 1, 100);
      return { title: 'Extra-Coaching', text: `Ein Spezialtrainer verbessert ${attr}.` };
    },
    () => {
      state.attributes.Mentalität = clamp(state.attributes.Mentalität + 2, 1, 100);
      return { title: 'Mentaltraining', text: 'Du wirkst in engen Spielen stabiler.' };
    },
    () => {
      state.injury = { active: true, days: 5, text: 'müde Beine' };
      return { title: 'Belastungswarnung', text: 'Der Coach empfiehlt leichtere Einheiten.' };
    },
    () => ({ title: 'Scout im Stadion', text: 'Ein Scout beobachtet deine nächsten Spiele genauer.' }),
  ];
  const event = events[Math.floor(Math.random() * events.length)]();
  state.events.unshift({ ...event, date: new Date().toISOString() });
  pushHistory('Event');
  saveAndRender();
  showToast(event.title);
}

function render() {
  updateProfileInputs();
  renderDashboard();
  renderAttributes();
  renderTraining();
  renderCareer();
  renderGames();
  renderCalendar();
  renderCharts();
}

function renderDashboard() {
  const overall = getOverall();
  const advice = getCoachAdvice();
  const scout = getScoutReport();

  elements.heroName.textContent = state.profile.name;
  elements.heroCoach.textContent = advice[0];
  elements.overallScore.textContent = overall;
  elements.sidebarRating.textContent = overall;
  elements.sidebarRatingFill.style.width = `${overall}%`;
  elements.careerBadge.textContent = careerStages[state.careerIndex];
  elements.scoutGrade.textContent = scout.grade;
  elements.scoutReport.textContent = scout.text;
  elements.profileRatingText.textContent = ratingTitle(overall);
  elements.ratingCircle.textContent = overall;
  elements.ratingExplanation.textContent = `Deine Bewertung basiert auf Attributen, Trainingsbalance, Spielpraxis und Karrierelevel. Aktuell bist du in der Stufe ${careerStages[state.careerIndex]}.`;

  elements.profileSummary.innerHTML = [
    ['Name', state.profile.name],
    ['Alter', `${state.profile.age}`],
    ['Größe', `${state.profile.height} cm`],
    ['Gewicht', `${state.profile.weight} kg`],
    ['Position', state.profile.position],
    ['Schusshand', state.profile.hand],
  ].map(([label, value]) => `<div class="summary-item"><span>${label}</span><strong>${value}</strong></div>`).join('');

  elements.coachAdvice.innerHTML = advice
    .map((text) => `<div class="coach-card">${text}</div>`)
    .join('');

  renderGoals();
}

function renderGoals() {
  const totals = getSeasonTotals();
  const weekMinutes = getWeeklyMinutes();
  const weakest = weakestAttributes()[0].name;
  const goals = [
    { text: `90 Minuten Training diese Woche`, done: weekMinutes >= 90 },
    { text: `Mindestens 1 Spiel simulieren`, done: state.games.length > 0 },
    { text: `${weakest} gezielt verbessern`, done: state.trainingLog.slice(0, 3).some((entry) => trainingEffects[entry.type][weakest]) },
  ];
  const done = goals.filter((goal) => goal.done).length;
  elements.dailyProgress.textContent = `${done}/${goals.length}`;
  elements.dailyGoals.innerHTML = goals
    .map((goal) => `<div class="goal-item ${goal.done ? 'done' : ''}"><span>${goal.text}</span><strong>${goal.done ? 'OK' : 'offen'}</strong></div>`)
    .join('');
  elements.weekGoal.textContent = `${Math.round(weekMinutes)} / 240 Minuten`;
  if (totals.shots >= 100) unlock('shots100');
}

function renderAttributes() {
  elements.attributeBars.innerHTML = attributeNames.map((name) => {
    const value = Math.round(state.attributes[name]);
    return `
      <div class="attribute-row">
        <div class="attribute-meta"><span>${name}</span><strong>${value}</strong></div>
        <div class="attribute-meter"><span style="width:${value}%"></span></div>
      </div>
    `;
  }).join('');
}

function renderTraining() {
  const hours = getTrainingHours();
  elements.trainingHours.textContent = `${hours.toFixed(1)} h`;
  elements.injuryStatus.textContent = state.injury.active ? `${state.injury.text}, ${state.injury.days} Tage` : 'fit';
  elements.trainingLog.innerHTML = state.trainingLog.length
    ? state.trainingLog.slice(0, 14).map((entry) => `
      <div class="timeline-item">
        <div><strong>${entry.type}</strong><span>${formatDate(entry.date)} · ${intensityText(entry.intensity)}</span></div>
        <strong>${entry.minutes} min</strong>
      </div>
    `).join('')
    : '<p class="report-text">Noch kein Training gespeichert.</p>';
}

function renderCareer() {
  elements.careerStatus.textContent = careerStages[state.careerIndex];
  elements.careerTrack.innerHTML = careerStages.map((stage, index) => `
    <div class="career-step ${index <= state.careerIndex ? 'reached' : ''} ${index === state.careerIndex ? 'current' : ''}">
      <strong>${stage}</strong>
      <span>${index <= state.careerIndex ? 'erreicht' : `OVR ${careerThreshold(index)}`}</span>
    </div>
  `).join('');

  const unlocked = achievements.filter((item) => state.unlocked.includes(item.id));
  elements.achievementCount.textContent = `${unlocked.length}/${achievements.length}`;
  elements.achievements.innerHTML = achievements.map((item) => `
    <div class="achievement ${state.unlocked.includes(item.id) ? 'unlocked' : ''}">
      <strong>${item.title}</strong>
      <span>${item.text}</span>
    </div>
  `).join('');
}

function renderGames() {
  const last = state.games[0];
  const totals = getSeasonTotals();
  elements.seasonLabel.textContent = `Saison ${state.season}`;
  elements.seasonRecord.textContent = `${state.games.length} Spiele`;
  elements.gameResult.textContent = last ? (last.won ? 'Sieg' : 'Niederlage') : 'kein Spiel';
  elements.lastGameStats.innerHTML = last
    ? gameStatMarkup(last)
    : '<p class="report-text">Noch kein Spiel simuliert.</p>';
  elements.seasonStats.innerHTML = [
    ['Spiele', state.games.length],
    ['Tore', totals.goals],
    ['Assists', totals.assists],
    ['Schüsse', totals.shots],
    ['Plus/Minus', totals.plusMinus],
    ['Strafminuten', totals.penalties],
    ['Ø Eiszeit', `${totals.avgIceTime} min`],
    ['Punkte', totals.goals + totals.assists],
  ].map(([label, value]) => `<div class="season-item"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderCalendar() {
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const recent = state.trainingLog.slice(0, 7);
  elements.calendarGrid.innerHTML = days.map((day, index) => {
    const entry = recent[index];
    return `
      <div class="calendar-day">
        <strong>${day}</strong>
        <span>${entry ? entry.type : recommendedTraining(index)}</span>
        <span>${entry ? `${entry.minutes} min` : 'geplant'}</span>
      </div>
    `;
  }).join('');

  const feedItems = state.events.slice(0, 8);
  elements.eventFeed.innerHTML = feedItems.length
    ? feedItems.map((event) => `
      <div class="feed-item">
        <div><strong>${event.title}</strong><span>${formatDate(event.date)}</span></div>
        <span>${event.text}</span>
      </div>
    `).join('')
    : `<div class="feed-item"><strong>Motivation</strong><span>${motivationTips[0]}</span></div>`;
}

function renderCharts() {
  drawLineChart($('#attributeChart'), state.history.map((item) => item.overall), 'OVR');
  drawBarChart($('#pointsChart'), [getSeasonTotals().goals, getSeasonTotals().assists], ['Tore', 'Assists'], [ '#58f0ff', '#66f2a2' ]);
  drawLineChart($('#trainingChart'), state.history.map((item) => item.trainingHours), 'Stunden');
  elements.careerPercent.textContent = `${Math.round((state.careerIndex / (careerStages.length - 1)) * 100)}%`;
  drawBarChart($('#careerChart'), careerStages.map((_, index) => (index <= state.careerIndex ? 1 : 0)), careerStages, careerStages.map((_, index) => index <= state.careerIndex ? '#58f0ff' : '#243943'));
}

function drawLineChart(canvas, values, label) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  paintChartBackground(ctx, width, height);
  const data = values.length > 1 ? values : [0, ...values];
  const max = Math.max(100, ...data);
  const min = Math.min(0, ...data);
  const points = data.map((value, index) => ({
    x: 36 + (index / Math.max(1, data.length - 1)) * (width - 72),
    y: height - 34 - ((value - min) / Math.max(1, max - min)) * (height - 72),
  }));
  ctx.strokeStyle = '#58f0ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
  ctx.stroke();
  ctx.fillStyle = '#ecfbff';
  ctx.font = '13px sans-serif';
  ctx.fillText(label, 34, 24);
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#baf4ff';
    ctx.fill();
  });
}

function drawBarChart(canvas, values, labels, colors) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  paintChartBackground(ctx, width, height);
  const max = Math.max(1, ...values);
  const gap = 16;
  const barWidth = (width - 70 - gap * (values.length - 1)) / values.length;
  values.forEach((value, index) => {
    const x = 35 + index * (barWidth + gap);
    const barHeight = (value / max) * (height - 78);
    const y = height - 34 - barHeight;
    ctx.fillStyle = colors[index] || '#58f0ff';
    ctx.fillRect(x, y, Math.max(8, barWidth), barHeight);
    ctx.fillStyle = '#ecfbff';
    ctx.font = '12px sans-serif';
    ctx.fillText(String(value), x, y - 8);
    ctx.fillStyle = '#96b6c0';
    ctx.fillText(labels[index].slice(0, 12), x, height - 12);
  });
}

function paintChartBackground(ctx, width, height) {
  ctx.fillStyle = 'rgba(236,251,255,0.035)';
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(186,244,255,0.12)';
  ctx.lineWidth = 1;
  for (let y = 36; y < height - 26; y += 42) {
    ctx.beginPath();
    ctx.moveTo(30, y);
    ctx.lineTo(width - 20, y);
    ctx.stroke();
  }
}

function getCoachAdvice() {
  const strongest = strongestAttributes().slice(0, 2);
  const weakest = weakestAttributes().slice(0, 2);
  const balance = getTrainingBalance();
  // Local "AI coach": rule-based analysis of strengths, weaknesses, balance and injury risk.
  const advice = [
    `Deine stärksten Bereiche sind ${strongest[0].name} und ${strongest[1].name}. Nutze diese Qualität in Spielen bewusst.`,
    `Deine größte Baustelle ist ${weakest[0].name}. Plane diese Woche mindestens zwei passende Einheiten ein.`,
  ];

  if (balance < 0.48) {
    advice.push('Du trainierst aktuell sehr einseitig. Für bessere Entwicklung solltest du Ausdauer, Technik und Spielverständnis gleichmäßiger einbauen.');
  } else {
    advice.push('Dein Trainingsmix ist solide. Halte die Balance und erhöhe langsam die Intensität.');
  }

  if (state.injury.active) {
    advice.push(`Verletzungsstatus: ${state.injury.text}. Reduziere harte Belastung, sonst sinkt deine Entwicklung.`);
  } else if (getWeeklyMinutes() > 360) {
    advice.push('Die Belastung ist hoch. Eine leichte Einheit oder Regeneration senkt dein Verletzungsrisiko.');
  }

  return advice;
}

function getScoutReport() {
  const overall = getOverall();
  const weak = weakestAttributes()[0];
  const strong = strongestAttributes()[0];
  const grade = overall >= 92 ? 'A+' : overall >= 84 ? 'A' : overall >= 76 ? 'B+' : overall >= 68 ? 'B' : overall >= 60 ? 'C+' : 'C';
  return {
    grade,
    text: `Scout-Bericht: ${state.profile.name} zeigt ${strong.name} auf hohem Niveau. Für den nächsten Karriereschritt muss ${weak.name} stabiler werden. Aktuelle Projektion: ${careerStages[Math.min(state.careerIndex + 1, careerStages.length - 1)]}.`,
  };
}

function updateAchievements() {
  const totals = getSeasonTotals();
  if (totals.goals > 0) unlock('firstGoal');
  if (totals.shots >= 100) unlock('shots100');
  if (state.trainingLog.length >= 50) unlock('train50');
  if (state.careerIndex >= 2) unlock('u17');
  if (state.careerIndex >= 6) unlock('national');
  if (state.careerIndex >= 7) unlock('draft');
  if (attributeNames.every((name) => state.attributes[name] >= 70)) unlock('balanced');
}

function unlock(id) {
  if (!state.unlocked.includes(id)) {
    state.unlocked.push(id);
  }
}

function pushHistory(label) {
  state.history.push({
    label,
    overall: getOverall(),
    trainingHours: getTrainingHours(),
    career: state.careerIndex,
    goals: getSeasonTotals().goals,
    assists: getSeasonTotals().assists,
  });
  state.history = state.history.slice(-30);
}

function updateProfileInputs() {
  elements.nameInput.value = state.profile.name;
  elements.ageInput.value = state.profile.age;
  elements.heightInput.value = state.profile.height;
  elements.weightInput.value = state.profile.weight;
  elements.positionInput.value = state.profile.position;
  elements.handInput.value = state.profile.hand;
}

function gameStatMarkup(game) {
  return [
    ['Tore', game.goals],
    ['Assists', game.assists],
    ['Schüsse', game.shots],
    ['Plus/Minus', game.plusMinus],
    ['Strafminuten', game.penalties],
    ['Eiszeit', `${game.iceTime} min`],
  ].map(([label, value]) => `<div class="game-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function recommendedTraining(index) {
  const weak = weakestAttributes();
  const options = Object.entries(trainingEffects)
    .filter(([, effects]) => effects[weak[index % weak.length].name])
    .map(([name]) => name);
  return options[0] || 'Techniktraining';
}

function getSeasonTotals() {
  const totals = state.games.reduce((sum, game) => {
    sum.goals += game.goals;
    sum.assists += game.assists;
    sum.shots += game.shots;
    sum.plusMinus += game.plusMinus;
    sum.penalties += game.penalties;
    sum.iceTime += game.iceTime;
    return sum;
  }, { goals: 0, assists: 0, shots: 0, plusMinus: 0, penalties: 0, iceTime: 0 });
  totals.avgIceTime = state.games.length ? Math.round(totals.iceTime / state.games.length) : 0;
  return totals;
}

function getOverall() {
  const average = attributeNames.reduce((sum, name) => sum + state.attributes[name], 0) / attributeNames.length;
  const careerBonus = state.careerIndex * 0.8;
  const gameBonus = Math.min(4, state.games.length * 0.18);
  return Math.round(clamp(average + careerBonus + gameBonus, 1, 100));
}

function getTrainingHours() {
  return state.trainingLog.reduce((sum, entry) => sum + entry.minutes, 0) / 60;
}

function getWeeklyMinutes() {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return state.trainingLog
    .filter((entry) => new Date(entry.date).getTime() >= weekAgo)
    .reduce((sum, entry) => sum + entry.minutes, 0);
}

function getTrainingBalance() {
  const recent = state.trainingLog.slice(0, 10);
  if (recent.length < 3) return 0.4;
  return new Set(recent.map((entry) => entry.type)).size / 7;
}

function strongestAttributes() {
  return attributeNames
    .map((name) => ({ name, value: state.attributes[name] }))
    .sort((a, b) => b.value - a.value);
}

function weakestAttributes() {
  return attributeNames
    .map((name) => ({ name, value: state.attributes[name] }))
    .sort((a, b) => a.value - b.value);
}

function avgAttribute(...names) {
  const selected = names.length ? names : attributeNames;
  return selected.reduce((sum, name) => sum + state.attributes[name], 0) / selected.length;
}

function ratingTitle(overall) {
  if (overall >= 92) return 'Elite Prospect';
  if (overall >= 84) return 'Top Talent';
  if (overall >= 76) return 'Starker Spieler';
  if (overall >= 68) return 'Solider Nachwuchs';
  return 'Entwicklungsprojekt';
}

function careerThreshold(index) {
  return [0, 52, 60, 68, 74, 80, 87, 92][index];
}

function intensityText(intensity) {
  if (intensity >= 1.2) return 'hart';
  if (intensity <= 0.85) return 'locker';
  return 'normal';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(new Date(value));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function saveAndRender() {
  saveState();
  render();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? mergeState(defaultState, JSON.parse(saved)) : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, saved) {
  return {
    ...structuredClone(base),
    ...saved,
    profile: { ...base.profile, ...saved.profile },
    attributes: { ...base.attributes, ...saved.attributes },
    injury: { ...base.injury, ...saved.injury },
  };
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => elements.toast.classList.remove('show'), 2600);
}

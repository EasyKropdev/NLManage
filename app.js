// ─────────────────────────────────────────────
//  FIREBASE CONFIG
//  ⚠️  Замініть значення нижче на ваші власні з
//  console.firebase.google.com → Project Settings
// ─────────────────────────────────────────────
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcG9y2Xjkd2hy_SqHND6kNwTUju8HQc0M",
  authDomain: "newlifemanage-70dd0.firebaseapp.com",
  databaseURL: "https://newlifemanage-70dd0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "newlifemanage-70dd0",
  storageBucket: "newlifemanage-70dd0.firebasestorage.app",
  messagingSenderId: "86188379825",
  appId: "1:86188379825:web:631f8f410bb4e363bb1c90",
  measurementId: "G-SN4D5RKR0R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

let tasksRef   = null;
let personsRef = null;
let currentUser = null;
let tasks   = {};
let persons = {};
let currentView = 'pie';
let editingTaskId = null;
let menuOpen = false;

const COLORS = [
  '#5B8DEF','#7B6CF6','#EF5B5B','#F0A44A',
  '#4BC6A8','#EF8DB0','#A3EF5B','#EF5BC6',
  '#5BCEEF','#F0D44A','#B05BEF','#EF775B',
];

const PERSON_COLORS = [
  '#5B8DEF','#7B6CF6','#4BC6A8','#F0A44A','#EF5B5B','#EF8DB0'
];

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    showApp(user);
    initDB();
  } else {
    currentUser = null;
    showAuthScreen();
  }
});

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(err => {
    console.error(err);
    showToast('Помилка входу. Спробуйте ще раз.');
  });
}

function signOut() {
  auth.signOut();
  closeUserMenu();
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  // Detach listeners
  if (tasksRef)   tasksRef.off();
  if (personsRef) personsRef.off();
}

function showApp(user) {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');

  // Set avatar initials or photo
  const initials = (user.displayName || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const avatar = document.getElementById('user-avatar');
  const menuAvatar = document.getElementById('menu-avatar');

  if (user.photoURL) {
    avatar.innerHTML = `<img src="${user.photoURL}" alt="">`;
    menuAvatar.innerHTML = `<img src="${user.photoURL}" alt="">`;
  } else {
    avatar.textContent = initials;
    menuAvatar.textContent = initials;
  }

  document.getElementById('menu-name').textContent  = user.displayName || 'Користувач';
  document.getElementById('menu-email').textContent = user.email || '';
}

// ─────────────────────────────────────────────
//  USER MENU
// ─────────────────────────────────────────────
function toggleUserMenu() {
  menuOpen = !menuOpen;
  document.getElementById('user-menu').classList.toggle('hidden', !menuOpen);
}

function closeUserMenu() {
  menuOpen = false;
  document.getElementById('user-menu').classList.add('hidden');
}

document.addEventListener('click', e => {
  if (menuOpen &&
      !e.target.closest('#user-menu') &&
      !e.target.closest('#user-avatar')) {
    closeUserMenu();
  }
});

// ─────────────────────────────────────────────
//  FIREBASE DB INIT + LISTENERS
// ─────────────────────────────────────────────
function initDB() {
  tasksRef   = db.ref('tasks');
  personsRef = db.ref('persons');

  tasksRef.on('value', snap => {
    tasks = snap.val() || {};
    render();
  });

  personsRef.on('value', snap => {
    persons = snap.val() || {};
    renderPersons();
    renderPersonSelect();
    render();
  });

  // Seed default data if empty
  tasksRef.once('value', snap => {
    if (snap.val()) return;
    const seed = [
      { name: 'Слово',        dur: 30, time: '00:00', color: '#5B8DEF', personId: '' },
      { name: 'Прославлення', dur: 20, time: '00:30', color: '#7B6CF6', personId: '' },
      { name: 'Стіл',         dur: 15, time: '00:50', color: '#4BC6A8', personId: '' },
      { name: 'Ігри',         dur: 35, time: '01:05', color: '#F0A44A', personId: '' },
      { name: 'Перерва',      dur:  5, time: '01:40', color: '#EF5B5B', personId: '' },
      { name: 'Завершення',   dur: 15, time: '01:45', color: '#EF8DB0', personId: '' },
    ];
    seed.forEach(t => tasksRef.child(uid()).set(t));
  });

  personsRef.once('value', snap => {
    if (snap.val()) return;
    const ppl = [
      { name: 'Андрій', role: 'Ігри' },
      { name: 'Ілля',   role: 'Прославлення' },
      { name: 'Маргоо', role: 'Організація столів' },
      { name: 'Маарго', role: 'Тайм-менеджер' },
    ];
    ppl.forEach(p => personsRef.child(uid()).set(p));
  });
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function getPersonName(id) {
  return persons[id] ? persons[id].name : '—';
}

function totalMin() {
  return Object.values(tasks).reduce((s, t) => s + (Number(t.dur) || 0), 0);
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2200);
}

// ─────────────────────────────────────────────
//  RENDER
// ─────────────────────────────────────────────
function render() {
  const sorted = Object.entries(tasks)
    .sort((a, b) => (a[1].time || '').localeCompare(b[1].time || ''));

  document.getElementById('event-duration').innerHTML =
    `Захід · ${totalMin()} хв <span class="sync-dot"></span>`;

  if (currentView === 'pie') renderPie(sorted);
  else renderLinear(sorted);

  renderLegend(sorted);
  renderTasks(sorted);
}

// ── PIE CHART ──
function renderPie(sorted) {
  const canvas = document.getElementById('pieCanvas');
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 240;
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  ctx.scale(dpr, dpr);

  const cx = size / 2, cy = size / 2;
  const outerR = 100, innerR = 60;
  const total = totalMin();

  ctx.clearRect(0, 0, size, size);
  document.getElementById('pie-total').textContent = total;

  if (!sorted.length) {
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
    ctx.fillStyle = '#1c1c21';
    ctx.fill();
    return;
  }

  let startAngle = -Math.PI / 2;
  const gap = 0.02;

  sorted.forEach(([, t]) => {
    const frac = (Number(t.dur) || 0) / (total || 1);
    const sweep = frac * Math.PI * 2 - gap;
    if (sweep <= 0) return;

    ctx.beginPath();
    ctx.moveTo(cx + innerR * Math.cos(startAngle + gap / 2),
               cy + innerR * Math.sin(startAngle + gap / 2));
    ctx.arc(cx, cy, outerR, startAngle + gap / 2, startAngle + sweep + gap / 2);
    ctx.arc(cx, cy, innerR, startAngle + sweep + gap / 2, startAngle + gap / 2, true);
    ctx.closePath();
    ctx.fillStyle = t.color || '#5B8DEF';
    ctx.fill();

    startAngle += sweep + gap;
  });
}

// ── LINEAR CHART ──
function renderLinear(sorted) {
  const container = document.getElementById('linear-chart');
  container.innerHTML = '';
  const total = totalMin() || 1;

  if (!sorted.length) {
    container.innerHTML = '<div class="empty-state"><span class="emoji">📋</span>Додайте частини заходу</div>';
    return;
  }

  sorted.forEach(([, t]) => {
    const pct = ((Number(t.dur) || 0) / total * 100).toFixed(1);
    const row = document.createElement('div');
    row.className = 'linear-row';
    row.innerHTML = `
      <div class="linear-label">${t.name || 'Без назви'}</div>
      <div class="linear-bar-wrap">
        <div class="linear-bar" style="width:${pct}%;background:${t.color || '#5B8DEF'}"></div>
      </div>
      <div class="linear-dur">${t.dur}хв</div>
    `;
    container.appendChild(row);
  });
}

// ── LEGEND ──
function renderLegend(sorted) {
  const el = document.getElementById('legend-list');
  el.innerHTML = '';
  sorted.forEach(([, t]) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <div class="legend-dot" style="background:${t.color || '#5B8DEF'}"></div>
      <span class="legend-name">${t.name || 'Без назви'}</span>
      <span class="legend-dur">${t.dur}хв</span>
    `;
    el.appendChild(item);
  });
}

// ── TASKS LIST ──
function renderTasks(sorted) {
  const el = document.getElementById('tasks-list');
  el.innerHTML = '';

  if (!sorted.length) {
    el.innerHTML = '<div class="empty-state"><span class="emoji">✨</span>Ще немає частин заходу.<br>Натисніть + щоб додати.</div>';
    return;
  }

  sorted.forEach(([id, t]) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.onclick = () => openModal(id);
    card.innerHTML = `
      <div class="task-color-bar" style="background:${t.color || '#5B8DEF'}"></div>
      <div class="task-info">
        <div class="task-name">${t.name || 'Без назви'}</div>
        <div class="task-meta">${t.time || '—'} · ${getPersonName(t.personId)}</div>
      </div>
      <div class="task-dur-badge">${t.dur}<span style="font-size:10px;font-weight:400;color:var(--text3)">хв</span></div>
    `;
    el.appendChild(card);
  });
}

// ── PERSONS GRID ──
function renderPersons() {
  const grid = document.getElementById('persons-grid');
  grid.innerHTML = '';

  if (!Object.keys(persons).length) {
    grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><span class="emoji">👥</span>Додайте учасників команди.</div>';
    return;
  }

  Object.entries(persons).forEach(([id, p], i) => {
    const color = PERSON_COLORS[i % PERSON_COLORS.length];
    const initials = (p.name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    const card = document.createElement('div');
    card.className = 'person-card';
    card.style.setProperty('--person-color', color);
    card.innerHTML = `
      <button class="person-delete" onclick="deletePerson(event,'${id}')">×</button>
      <div class="person-avatar" style="background:${color}20;color:${color}">${initials}</div>
      <div class="person-name-text">${p.name || '—'}</div>
      <div class="person-role-text">${p.role || 'Без ролі'}</div>
    `;
    grid.appendChild(card);
  });
}

function renderPersonSelect() {
  const sel = document.getElementById('f-person');
  const current = sel.value;
  sel.innerHTML = '<option value="">— оберіть —</option>';
  Object.entries(persons).forEach(([id, p]) => {
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  if (current) sel.value = current;
}

// ─────────────────────────────────────────────
//  VIEW SWITCH
// ─────────────────────────────────────────────
function switchView(v) {
  currentView = v;
  document.getElementById('btn-pie').classList.toggle('active', v === 'pie');
  document.getElementById('btn-linear').classList.toggle('active', v === 'linear');
  document.getElementById('chart-pie').classList.toggle('hidden', v !== 'pie');
  document.getElementById('chart-linear').classList.toggle('hidden', v !== 'linear');
  render();
}

// ─────────────────────────────────────────────
//  TASK MODAL
// ─────────────────────────────────────────────
function buildColorPicker(selected) {
  const cp = document.getElementById('color-picker');
  cp.innerHTML = '';
  COLORS.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'color-swatch' + (c === selected ? ' selected' : '');
    sw.style.background = c;
    sw.onclick = () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      sw.classList.add('selected');
      document.getElementById('f-color').value = c;
    };
    cp.appendChild(sw);
  });
}

function openModal(id) {
  editingTaskId = id || null;
  const t = id ? tasks[id] : null;
  document.getElementById('modal-title').textContent = t ? 'Редагувати' : 'Нова частина';
  document.getElementById('f-name').value  = t ? t.name  : '';
  document.getElementById('f-dur').value   = t ? t.dur   : '';
  document.getElementById('f-time').value  = t ? t.time  : '';
  document.getElementById('f-color').value = t ? t.color : COLORS[0];
  document.getElementById('f-edit-id').value = id || '';
  document.getElementById('delete-btn').classList.toggle('hidden', !id);
  renderPersonSelect();
  document.getElementById('f-person').value = t ? (t.personId || '') : '';
  buildColorPicker(t ? t.color : COLORS[0]);
  document.getElementById('task-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('f-name').focus(), 300);
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
  editingTaskId = null;
}

function saveTask() {
  const name     = document.getElementById('f-name').value.trim();
  const dur      = parseInt(document.getElementById('f-dur').value) || 0;
  const time     = document.getElementById('f-time').value.trim();
  const color    = document.getElementById('f-color').value;
  const personId = document.getElementById('f-person').value;

  if (!name) { document.getElementById('f-name').focus(); return; }
  if (!dur)  { document.getElementById('f-dur').focus();  return; }

  const id = editingTaskId || uid();
  tasksRef.child(id).set({ name, dur, time, color, personId });
  closeModal();
  showToast(editingTaskId ? '✓ Оновлено' : '✓ Додано');
}

function deleteTask() {
  if (!editingTaskId) return;
  tasksRef.child(editingTaskId).remove();
  closeModal();
  showToast('🗑 Видалено');
}

// ─────────────────────────────────────────────
//  PERSON MODAL
// ─────────────────────────────────────────────
function openPersonModal() {
  document.getElementById('p-name').value = '';
  document.getElementById('p-role').value = '';
  document.getElementById('person-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('p-name').focus(), 300);
}

function closePersonModal() {
  document.getElementById('person-modal').classList.add('hidden');
}

function savePerson() {
  const name = document.getElementById('p-name').value.trim();
  const role = document.getElementById('p-role').value.trim();
  if (!name) { document.getElementById('p-name').focus(); return; }
  personsRef.child(uid()).set({ name, role });
  closePersonModal();
  showToast('✓ Учасника додано');
}

function deletePerson(e, id) {
  e.stopPropagation();
  personsRef.child(id).remove();
  showToast('🗑 Учасника видалено');
}

// ── Close modals on overlay click ──
document.getElementById('task-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});
document.getElementById('person-modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closePersonModal();
});

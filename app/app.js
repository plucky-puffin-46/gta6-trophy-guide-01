// GTA VI Trophy Guide & Tracker — entry point.
// Loads the trophy data (app/data/trophies.json, fetched from this app's own
// files), restores progress from localStorage, and wires the tracker view,
// the roadmap view, the filters and spoiler settings, the detail panel and
// the export / import / reset controls. Nothing is fetched from the network:
// every file comes from beside this one.

import { loadEarned, saveEarned, loadSettings, saveSettings, clearProgress, exportText, parseImport } from './js/state.js';
import { renderTracker } from './js/tracker.js';
import { renderRoadmap } from './js/roadmap.js';
import { renderDetail } from './js/detail.js';

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

const ctx = {
  earned: loadEarned(),
  settings: loadSettings(),
  filters: { kind: 'all', grade: 'all', query: '', hideEarned: false },
  view: 'tracker',
};

const $ = (id) => document.getElementById(id);
const trackerView = $('tracker-view');
const roadmapView = $('roadmap-view');
const controls = $('tracker-controls');
const overlay = $('detail-overlay');
const detailBody = $('detail-body');
let openTrophy = null;

function totalPoints() {
  return trophies.reduce((sum, t) => sum + t.points, 0);
}

function updateProgress() {
  const earnedPoints = trophies.filter((t) => ctx.earned.has(t.id)).reduce((sum, t) => sum + t.points, 0);
  const total = totalPoints();
  const pct = Math.round((ctx.earned.size / trophies.length) * 100);
  $('progress-count').textContent = `${ctx.earned.size} of ${trophies.length} earned`;
  $('progress-points').textContent = `${earnedPoints} / ${total} pts`;
  $('progress-pct').textContent = `${pct}%`;
  $('progress-fill').style.width = `${(ctx.earned.size / trophies.length) * 100}%`;
}

function render() {
  ctx.filters.hideEarned = ctx.settings.hideEarned;
  if (ctx.view === 'tracker') {
    trackerView.hidden = false;
    roadmapView.hidden = true;
    controls.hidden = false;
    renderTracker(trackerView, trophies, ctx, onToggle, openDetail);
  } else {
    trackerView.hidden = true;
    roadmapView.hidden = false;
    controls.hidden = true;
    renderRoadmap(roadmapView, trophies, ctx, openDetail);
  }
  $('tab-tracker').classList.toggle('active', ctx.view === 'tracker');
  $('tab-roadmap').classList.toggle('active', ctx.view === 'roadmap');
  updateProgress();
  if (openTrophy) renderDetail(detailBody, openTrophy, ctx, onToggle);
}

function onToggle(id, checked) {
  if (checked) ctx.earned.add(id);
  else ctx.earned.delete(id);
  saveEarned(ctx.earned);
  render();
}

function openDetail(t) {
  openTrophy = t;
  renderDetail(detailBody, t, ctx, onToggle);
  overlay.hidden = false;
}

function closeDetail() {
  openTrophy = null;
  overlay.hidden = true;
}

// --- view tabs ---
$('tab-tracker').addEventListener('click', () => {
  ctx.view = 'tracker';
  render();
});
$('tab-roadmap').addEventListener('click', () => {
  ctx.view = 'roadmap';
  render();
});

// --- filters ---
$('kind-chips').addEventListener('click', (e) => {
  const chip = e.target.closest('[data-kind]');
  if (!chip) return;
  ctx.filters.kind = chip.dataset.kind;
  for (const c of $('kind-chips').querySelectorAll('.chip')) c.classList.toggle('active', c === chip);
  render();
});
$('grade-filter').addEventListener('change', (e) => {
  ctx.filters.grade = e.target.value;
  render();
});
$('search').addEventListener('input', (e) => {
  ctx.filters.query = e.target.value.trim();
  render();
});
$('hide-earned').addEventListener('change', (e) => {
  ctx.settings.hideEarned = e.target.checked;
  saveSettings(ctx.settings);
  render();
});

// --- spoiler settings ---
$('spoiler-shield').addEventListener('change', (e) => {
  ctx.settings.spoilerShield = e.target.checked;
  saveSettings(ctx.settings);
  render();
});
$('reveal-hidden').addEventListener('change', (e) => {
  ctx.settings.revealHidden = e.target.checked;
  saveSettings(ctx.settings);
  render();
});

// --- export / import / reset ---
$('export-btn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([exportText(ctx.earned)], { type: 'application/json' }));
  a.download = 'gta-vi-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  const msg = $('import-msg');
  if (!file) return;
  try {
    ctx.earned = parseImport(await file.text(), trophies);
    saveEarned(ctx.earned);
    msg.textContent = `Imported: ${ctx.earned.size} trophies marked earned.`;
    render();
  } catch (err) {
    msg.textContent = `Import failed: ${err.message}`;
  }
  e.target.value = '';
});
$('reset-btn').addEventListener('click', () => {
  if (!confirm('Reset all progress? Every earned tick will be cleared.')) return;
  ctx.earned = new Set();
  clearProgress();
  $('import-msg').textContent = 'Progress reset.';
  render();
});

// --- detail panel ---
$('detail-close').addEventListener('click', closeDetail);
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeDetail();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && openTrophy) closeDetail();
});

// --- restore control states from saved settings ---
$('spoiler-shield').checked = ctx.settings.spoilerShield;
$('reveal-hidden').checked = ctx.settings.revealHidden;
$('hide-earned').checked = ctx.settings.hideEarned;

// A small handle for automated checks of this page (harmless in normal use):
// the data, the live context, and the same export/import functions the
// buttons above call.
window.__trophyGuide = { trophies, ctx, render, exportText, parseImport };

render();

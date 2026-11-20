// Tracker view: the 55 trophies as cards grouped by roadmap stage, with the
// earned checkboxes, the kind / grade / search / hide-earned filters, and the
// two spoiler protections (the story spoiler shield and the hidden-trophy
// mask). Rendering is plain DOM built from textContent — no trophy text is
// ever injected as HTML.

import { STAGES } from './stages.js';

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  online: 'Online',
};

// A hidden trophy stays masked until the reader turns on "Reveal hidden
// trophies" — or earns it, since PlayStation reveals it then anyway.
export function isHiddenMasked(t, ctx) {
  return t.hidden && !ctx.settings.revealHidden && !ctx.earned.has(t.id);
}

// The spoiler shield hides story trophies (names and descriptions) until they
// are earned. The Platinum is exempt: it is the goal of the whole page, not a
// plot detail.
export function isStoryMasked(t, ctx) {
  return ctx.settings.spoilerShield && t.kind === 'story' && t.grade !== 'platinum' && !ctx.earned.has(t.id);
}

export function isMasked(t, ctx) {
  return isHiddenMasked(t, ctx) || isStoryMasked(t, ctx);
}

export function visibleName(t, ctx) {
  if (isHiddenMasked(t, ctx)) return 'Hidden Trophy';
  if (isStoryMasked(t, ctx)) return '??? — story trophy';
  return t.name;
}

export function visibleDescription(t, ctx) {
  if (isHiddenMasked(t, ctx)) return 'Hidden on PlayStation until earned. Turn on “Reveal hidden trophies” above to see it.';
  if (isStoryMasked(t, ctx)) return t.description; // rendered blurred by the caller
  return t.description;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function matchesFilters(t, ctx) {
  const f = ctx.filters;
  if (f.kind !== 'all' && !t.kinds.includes(f.kind)) return false;
  if (f.grade !== 'all' && t.grade !== f.grade) return false;
  if (f.hideEarned && ctx.earned.has(t.id)) return false;
  if (f.query) {
    if (isMasked(t, ctx)) return false; // never leak a masked trophy through search
    const hay = `${t.name} ${t.description} ${t.guide}`.toLowerCase();
    if (!hay.includes(f.query.toLowerCase())) return false;
  }
  return true;
}

function buildCard(t, ctx, onToggle, onOpen) {
  const card = el('article', 'card' + (ctx.earned.has(t.id) ? ' earned' : '') + (isMasked(t, ctx) ? ' masked' : ''));
  card.dataset.trophyId = String(t.id);

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = ctx.earned.has(t.id);
  box.setAttribute('aria-label', `Mark ${t.name} as earned`);
  box.addEventListener('change', () => onToggle(t.id, box.checked));
  box.addEventListener('click', (e) => e.stopPropagation());
  card.append(box);

  const name = el('div', 'name', visibleName(t, ctx));
  card.append(name);

  const desc = el('div', 'desc', visibleDescription(t, ctx));
  if (isStoryMasked(t, ctx)) desc.classList.add('blur-text');
  card.append(desc);

  const meta = el('div', 'meta');
  meta.append(el('span', `badge ${t.grade}`, t.grade));
  meta.append(el('span', 'tag kind', KIND_LABELS[t.kind] ?? t.kind));
  if (t.count !== null && t.count !== undefined) {
    meta.append(el('span', 'tag count', t.id === 14 ? 'Target: 100%' : `Target: ${t.count}`));
  }
  meta.append(el('span', 'tag', `${t.points} pts`));
  if (t.missable) meta.append(el('span', 'tag missable', '⚠ Missable'));
  if (t.hidden && !isHiddenMasked(t, ctx)) meta.append(el('span', 'tag hidden-tag', 'Hidden'));
  card.append(meta);

  card.addEventListener('click', () => onOpen(t));
  return card;
}

export function renderTracker(root, trophies, ctx, onToggle, onOpen) {
  root.replaceChildren();

  if (ctx.filters.kind === 'online') {
    root.append(
      el(
        'p',
        'empty-note',
        'GTA VI has no online trophies: all 55 trophies in the base game are offline and single-player, so this filter is empty by design. (PowerPyx’s roadmap counts “Online Trophies: 0”.)',
      ),
    );
    return;
  }

  let shown = 0;
  for (const stage of STAGES) {
    const inStage = trophies
      .filter((t) => t.stage === stage.n)
      .sort((a, b) => a.order - b.order)
      .filter((t) => matchesFilters(t, ctx));
    if (inStage.length === 0) continue;
    shown += inStage.length;

    const head = el('div', 'stage-head');
    head.append(el('h2', '', `Stage ${stage.n} · ${stage.title}`));
    const done = inStage.filter((t) => ctx.earned.has(t.id)).length;
    head.append(el('span', 'stage-count', `${done}/${inStage.length} earned here`));
    head.append(el('p', 'stage-blurb', stage.blurb));
    root.append(head);

    const grid = el('div', 'cards');
    for (const t of inStage) grid.append(buildCard(t, ctx, onToggle, onOpen));
    root.append(grid);
  }

  if (shown === 0) {
    root.append(el('p', 'empty-note', 'No trophies match those filters. Loosen the search, pick another kind, or untick “Hide earned”.'));
  }
}

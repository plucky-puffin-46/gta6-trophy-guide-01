// Progress store for the GTA VI trophy tracker.
// Earned trophy ids and the two spoiler settings live in localStorage; nothing
// leaves the browser. Export/import moves the same data through a JSON file.

const EARNED_KEY = 'vice-trophy-guide:earned:v1';
const SETTINGS_KEY = 'vice-trophy-guide:settings:v1';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

export function loadSettings() {
  const defaults = { spoilerShield: true, revealHidden: false, hideEarned: false };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return defaults;
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function clearProgress() {
  localStorage.removeItem(EARNED_KEY);
}

// The export file: a small JSON document naming this guide, so an import can
// be checked before it replaces anything.
export function exportText(earned) {
  return JSON.stringify(
    { app: 'gta-vi-trophy-guide', version: 1, earned: [...earned].sort((a, b) => a - b) },
    null,
    2,
  );
}

// Accepts this guide's export format, a bare array of trophy ids, or a bare
// array of trophy names (the shape simple checklists use). Returns a Set of
// ids limited to trophies that exist; throws on anything else.
export function parseImport(text, trophies) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data?.earned;
  if (!Array.isArray(list)) throw new Error('No earned list in that file.');
  const byId = new Set(trophies.map((t) => t.id));
  const byName = new Map(trophies.map((t) => [t.name, t.id]));
  const out = new Set();
  for (const item of list) {
    if (Number.isInteger(item) && byId.has(item)) out.add(item);
    else if (typeof item === 'string' && byName.has(item)) out.add(byName.get(item));
  }
  if (out.size === 0 && list.length > 0) throw new Error('That file names no trophies from this list.');
  return out;
}

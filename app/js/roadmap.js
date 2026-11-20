// Roadmap view: the road to the Platinum as stage cards, built from the
// official descriptions (which chapters and missions, which collectibles and
// counts, in what order) and cross-checked against the published roadmaps it
// cites. The missable warning and the save advice come first, because they
// are the only decisions a player cannot undo later.

import { STAGES } from './stages.js';
import { visibleName } from './tracker.js';

const ROADMAP_SOURCES = [
  { name: 'PowerPyx — GTA 6 Trophy Guide & Roadmap', url: 'https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/' },
  { name: 'GTABase — GTA 6 Trophies & Achievements List', url: 'https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series' },
  { name: 'games.gg — Complete GTA 6 Trophy List', url: 'https://games.gg/grand-theft-auto-vi/guides/complete-grand-theft-auto-6-trophy-list/' },
];

const STAGE_TIPS = {
  1: [
    'Do Lucia’s balcony meditation when it appears — check Jason’s kitchen in the morning, around the mission Down to Earth — and accept her invitation before the chapter ends.',
    'Keep a manual save at the start of Chapter 1 and another before you leave it. The game offers 15 manual slots; chapter-break saves are your only insurance, because there is no mission replay.',
    'Every story trophy is automatic: no gold medals, no difficulty setting, no special conditions.',
  ],
  2: [
    'Take optional missions as they appear rather than rushing chapters: several unlocks hang off them, including the jewelry jobs (Chapter 3) and the bank vault jobs (Chapter 4).',
    'Build two habits while travelling: scan unfamiliar vehicles with the WAiNK app, and study animals through the binoculars. Both counters feed the 100% checklist in stage 4.',
    'The named-mission trophies — Breakfast Run, The Cartel Heist, Child’s Play, Headliners, VCIA Takedown, Operation Savage Glory — pop on completion and cannot be missed.',
  ],
  3: [
    'Bank vault robberies always bring a 4-star Wanted Level and need your partner to carry the cash — so one vault job can advance Maximum Withdrawal and Hot Together together.',
    'Rob one Illegal Operation in each gang’s turf as you cross it: nine gangs, nine robberies for Pest Control (all 39 operations are a 100% checklist item).',
    'Mind the money order: the eight garages behind Little Boxes cost about $160,000 in total, and Treat Yo Self wants $100,000 spent across shops — buy the garages first.',
    'The secret trophies live here. Five of them were still unsolved in launch week; their guides in the tracker say honestly what is and is not confirmed.',
  ],
  4: [
    'Some checklist categories must be done in full: every robbery, all 33 underwater discoveries, all 42 shooting-range golds, all drone races and Bret’s quests.',
    'You may skip 10 of the 80 Challenges (the checklist needs 70) — leave the hardest until everything else is done.',
    'Several counters run past their own trophies: 300 stunts rather than 250, 200 of 277 vehicle scans, 100 of 255 animals studied, 15 card sets rather than 3.',
    'Nothing on the checklist is missable, and progress made during the story already counts.',
  ],
  5: [
    'Count strands with the trophy tracker, not by contacts met: the Andy, Billy and Tyrone strands do not count toward the eight (they carry their own trophies instead).',
    'Every quest giver tied to a trophy returns after the story, so a strand skipped during the campaign is a cleanup trip, not a lost trophy.',
  ],
  6: ['Earn the other 54 trophies and this one unlocks by itself.'],
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceLinks(sources) {
  const p = el('p', 'source-line', 'Sources: ');
  sources.forEach((s, i) => {
    if (i > 0) p.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    p.append(a);
  });
  return p;
}

export function renderRoadmap(root, trophies, ctx, onOpen) {
  root.replaceChildren();

  const intro = el('section', 'road-card');
  intro.append(el('h2', '', 'Before you start'));
  intro.append(
    el(
      'p',
      '',
      'The shape of the run, from the published roadmaps: estimated difficulty 4/10, roughly 200 hours to the Platinum, one playthrough, no online trophies, and free-roam after the story with no mission replay. The hardest trophy is A Long Road, the 100% completion Gold. Most of the list is lenient — the checklist behind it asks for closer to 60% of everything the game tracks.',
    ),
  );
  intro.append(
    el(
      'p',
      'warn',
      '⚠ The one potential missable: Positive Mental Attitude. One of its 18 meditation spots is offered only in Chapter 1 — Lucia’s invitation at Jason’s house — and cannot be reached after the chapter ends. Guides disagree on whether the trophy strictly needs it; do it anyway and keep a Chapter 1 save.',
    ),
  );
  const rules = el('ul');
  for (const line of [
    'Keep a manual save at the start and end of every chapter (15 slots): there is no mission replay to fall back on.',
    'Never use cheats on a trophy run — they disable trophies and saving.',
    'Avoid the Irredeemable criminal profile: it is permanent and makes the police more aggressive.',
    'Turn on the game’s progress and collectible notifications so counters are visible while you play.',
  ]) {
    rules.append(el('li', '', line));
  }
  intro.append(rules);
  intro.append(sourceLinks(ROADMAP_SOURCES));
  root.append(intro);

  for (const stage of STAGES) {
    const card = el('section', 'road-card');
    card.append(el('p', 'hours', stage.hours));
    card.append(el('h2', '', `Stage ${stage.n} · ${stage.title}`));
    card.append(el('p', '', stage.blurb));

    const tips = STAGE_TIPS[stage.n] ?? [];
    if (tips.length > 0) {
      card.append(el('h3', '', 'What to do'));
      const ul = el('ul');
      for (const tip of tips) ul.append(el('li', '', tip));
      card.append(ul);
    }

    const inStage = trophies.filter((t) => t.stage === stage.n).sort((a, b) => a.order - b.order);
    const done = inStage.filter((t) => ctx.earned.has(t.id)).length;
    card.append(el('h3', '', `Trophies in this stage — ${done}/${inStage.length} earned`));
    const chips = el('div', 'road-trophies');
    for (const t of inStage) {
      const b = el('button', ctx.earned.has(t.id) ? 'done' : '', visibleName(t, ctx));
      b.type = 'button';
      b.addEventListener('click', () => onOpen(t));
      chips.append(b);
    }
    card.append(chips);
    root.append(card);
  }
}

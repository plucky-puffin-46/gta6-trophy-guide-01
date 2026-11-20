// Trophy detail panel: the full guide for one trophy — the official name and
// description, a missable warning where one applies, the guide in this page's
// own words, its steps, and its sources as links the reader can follow (the
// app itself fetches nothing). Masked trophies stay masked here too: no guide
// text leaks through the panel while a spoiler protection is on.

import { KIND_LABELS, isMasked, isHiddenMasked, isStoryMasked, visibleName } from './tracker.js';
import { stageByNumber } from './stages.js';

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function sourceLink(s) {
  const a = document.createElement('a');
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = s.name;
  return a;
}

export function renderDetail(body, t, ctx, onToggle) {
  body.replaceChildren();

  const meta = el('div', 'meta');
  meta.append(el('span', `badge ${t.grade}`, t.grade));
  meta.append(el('span', 'tag kind', KIND_LABELS[t.kind] ?? t.kind));
  meta.append(el('span', 'tag', `Stage ${t.stage} · ${stageByNumber(t.stage).title}`));
  meta.append(el('span', 'tag', `${t.points} pts`));
  if (t.count !== null && t.count !== undefined) {
    meta.append(el('span', 'tag count', t.id === 14 ? 'PlayStation tracks: 100%' : `PlayStation tracks: ${t.count}`));
  }
  if (t.hidden) meta.append(el('span', 'tag hidden-tag', 'Hidden trophy'));
  body.append(meta);

  body.append(el('h2', '', visibleName(t, ctx)));

  if (isMasked(t, ctx)) {
    const why = isHiddenMasked(t, ctx)
      ? 'This trophy is hidden on PlayStation until it is earned, so its name, description and guide stay covered here too. Turn on “Reveal hidden trophies” in the tracker controls to read it now.'
      : 'The spoiler shield is on: story trophies stay covered until you earn them. Earn this one, or turn the shield off in the tracker controls, to read its guide.';
    body.append(el('p', 'official', why));
    return;
  }

  body.append(el('p', 'official', `“${t.description}” — official description`));

  if (t.missable) {
    body.append(
      el(
        'p',
        'warn',
        '⚠ Potentially missable: one meditation spot is offered only during Chapter 1 (Lucia’s invitation at Jason’s house) and cannot be reached afterwards. Whether the trophy strictly requires it is unconfirmed — do it anyway, and keep a Chapter 1 save. See the guide below.',
      ),
    );
  }

  body.append(el('h3', '', 'Guide'));
  body.append(el('p', '', t.guide));

  if (Array.isArray(t.steps) && t.steps.length > 0) {
    body.append(el('h3', '', 'Steps'));
    const ol = el('ol');
    for (const step of t.steps) ol.append(el('li', '', step));
    body.append(ol);
  }

  const earnLabel = el('label', 'detail-earn');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = ctx.earned.has(t.id);
  box.addEventListener('change', () => onToggle(t.id, box.checked));
  earnLabel.append(box, document.createTextNode(' Mark as earned'));
  body.append(earnLabel);

  if (Array.isArray(t.sources) && t.sources.length > 0) {
    body.append(el('h3', '', 'Sources'));
    const ul = el('ul');
    for (const s of t.sources) {
      const li = el('li');
      li.append(sourceLink(s));
      ul.append(li);
    }
    body.append(ul);
    body.append(el('p', 'source-line', 'Guides are this page’s own words; the sources are where each fact comes from. Links open only when you follow them.'));
  }
}

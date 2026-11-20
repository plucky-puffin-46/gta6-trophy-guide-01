// The roadmap's six stages. Trophies carry a stage number and an order inside
// it (see data/trophies.json); both the tracker sections and the roadmap view
// are built from this list. The shape follows the published roadmaps: story
// first, the 100% checklist after it, strangers and cleanup last — see the
// PowerPyx and GTABase guides cited in the roadmap view.

export const STAGES = [
  {
    n: 1,
    title: 'Chapter 1 — Welcome to Leonida',
    hours: 'The first hours of the story',
    blurb:
      'Play the opening chapter, and do the one thing the whole run depends on: Lucia\'s balcony meditation at Jason\'s house. Start the save habit here too — a manual save at the start and end of every chapter, because the game has no mission replay.',
  },
  {
    n: 2,
    title: 'Chapters 2–5 — Run the Story',
    hours: 'Story step · about 60–80 hours together with stage 1',
    blurb:
      'Finish the five chapters and the named story missions; every one of these trophies is automatic and cannot be missed. Take optional missions as they appear, and scan vehicles and study animals on the way — that progress already counts toward the 100% checklist later.',
  },
  {
    n: 3,
    title: 'Any Time — Habits, Crimes & Side Hustles',
    hours: 'Free-roam · during and after the story',
    blurb:
      'The open-world bulk of the list: robberies, partner crimes, money targets, exploration and the secret trophies. None of it is missable — free-roam continues after the story — so chip away at these whenever you pass them rather than grinding them in one sitting.',
  },
  {
    n: 4,
    title: 'After the Story — The 100% Checklist',
    hours: 'Roadmap step 2 · about 100 hours',
    blurb:
      'The credits unlock the 100% Completion checklist under Progress > Stats. Work it region by region: the big counters (stunts, challenges, shooting-range golds, drone races, card sets) live here, and finishing the checklist itself is the Gold trophy A Long Road.',
  },
  {
    n: 5,
    title: 'Cleanup — Strangers & Freaks',
    hours: 'Roadmap step 3 · about 10 hours',
    blurb:
      'The questlines the checklist does not ask for: eight counting stranger strands for the Silver, plus the character questlines for Andy, Kenton, Billy, Randy and Tyrone and Bret\'s unique-animal hunt. Quest givers tied to trophies return after the story, so nothing here can be locked away.',
  },
  {
    n: 6,
    title: 'The Platinum',
    hours: 'The final trophy',
    blurb:
      'When the other 54 are earned, Vice Got a Price! unlocks on its own. Nothing to hunt — just the moment the rest of this page turns cyan.',
  },
];

export function stageByNumber(n) {
  return STAGES.find((s) => s.n === n) ?? STAGES[0];
}

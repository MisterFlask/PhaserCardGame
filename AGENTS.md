# Agent instructions

Full house rules, commands, and definition of done live in **CLAUDE.md** at the
repo root — read it before changing anything. The non-negotiables, abbreviated:

- Verify before you finish: `npm run typecheck`, `npm test`, `npm run build`
  must all pass. Gameplay changes also need a driven browser check (see
  CLAUDE.md "Commands" for the harness).
- Game rules stay Phaser-free (`src/campaign/`, pure parts of `src/saveload/`);
  unit-test them with vitest.
- One currency (`GameState.moneyInVault`), one owner per piece of state
  (campaign state on `CampaignUiState`, combat/squad on `GameState`).
- Saves are HQ-only checkpoints; anything that can persist on a roster deck
  must be registered in `src/saveload/SaveRegistries.ts` (a lint test enforces
  this); bump `SAVE_FORMAT_VERSION` on save-shape changes.
- The old Slay-the-Spire node map is deliberately deleted — don't resurrect
  its patterns.
- HQ panels extend `AbstractHqPanel` and pull style from `src/ui/UIStyle.ts`.
- Work on a branch and open a PR; CI must be green before merge. Never push
  directly to master.
- Flavor voice: dry corporate humor over Lovecraftian dread; BBCode text;
  £ for money.

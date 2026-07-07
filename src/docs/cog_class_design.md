# Cog Class Identity (design, July 2026)

Lead-authored under owner-delegated authority. Ruling on the TODO's fork
("invest, or reconsider four classes"): **four classes stays** — the Cog's
fantasy is distinct and the worldbuilding (Clockwork Wastes, infernal
cybernetics, the Iron Choir) already carries it. This doc gives the class
its lore and deepens the kit around one legible mechanical identity.

## Identity: the Manufactory

**The Cog turns energy into material.** Where other classes play the cards
they brought, the Cog makes more — cheap, single-use, purpose-built
**manufactured tokens** stamped into the deck mid-fight — and improves the
gear it already carries (the self-upgrading strand that SelfUpgradingRevolver
and ReplicateArmaments already hint at). Identity pillars:

1. **Manufacture**: create token cards mid-combat (the runtime token
   pipeline already exists — TakeCover/EldritchSmoke etc. are manufactured
   by other cards today). Tokens are combat-transient: they never touch the
   master deck, the deck cap, or a save.
2. **Improvement**: cards that ratchet up with use, within a combat or
   across a sortie.
3. **Fragility**: lowest base HP in the game (25 — keep it). The machine is
   precise, not sturdy.

## Lore (becomes CogClass.longDescription — currently a placeholder)

The Cog is not employed by the Company; the Cog is INVENTORIED by it.
Assembled under Clockwork Wastes patents and leased to expeditions at a
per-quarter rate the Ledger books under Plant & Equipment, a Cog arrives
crated, self-assembles, and requisitions its own ammunition by stamping it
from scrap on the march. Implementing agent: write the final
longDescription in this register (2-3 sentences, matches the other
classes' length/voice — see ArchonClass).

## The token: Rivet

One token type in v1 (resist the urge for a token zoo):
**Rivet** — 0-cost Attack, deal 3 damage, Exhaust. Manufactured only,
never draftable, never persists. (If an existing token body fits better
mechanically, adapt — but the name stays in the manufacture register.)

## Six new cards (sketches — adapt numbers to the class's existing power
band after reading the current 15; STOP if the token pipeline can't
support a verb)

| Card | Rarity | Sketch |
|---|---|---|
| Stamp Press | common | 1⚡ Skill: Manufacture 2 Rivets into the draw pile. |
| Assembly Line | common | 1⚡ Skill: draw 1; Manufacture 1 Rivet into your hand. |
| Patent Infringement | uncommon | 1⚡ Skill: Manufacture a 0-cost exhausting copy of the top card of your discard pile. |
| Warranty Clause | uncommon | 2⚡ Skill: gain 8 Block; +4 if you played a manufactured card this turn. |
| Production Quota | rare | 2⚡ Power: at the start of your turn, Manufacture a Rivet into your hand. |
| Depreciation Schedule | rare | 1⚡ Power: whenever you play a manufactured card, gain 1 Strength this combat. (Name is the joke: the Cog appreciates.) |

Also: audit the existing 15 for identity fit — do NOT redesign them, but
where a card already touches manufacture/improvement, its (new, July 2026)
flavorText may be sharpened to the register above; mechanics untouched.

## Explicitly out of v1

New combat resources; token zoo; cross-class manufacture; Cog-specific
relics; any rework of the existing 15 cards' mechanics.

## Verification bar

typecheck + tests (SaveRegistriesLint — new cards must register per house
rule 4 since promotions can add them to master decks; Rivet must NOT
register as draftable — check how token cards are exempted today) + build
+ smoke, plus a headless combat proof (qa-spawn-style temp driver or the
existing debug hooks) showing a Rivet manufactured and played, and
Production Quota generating per turn.

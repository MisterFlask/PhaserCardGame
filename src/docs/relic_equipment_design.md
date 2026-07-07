# Relic Equipment Slots (design, July 2026)

Lead-authored under owner-delegated authority. Implements the design doc's
"Equipment: relics as assignable gear (2-3 slots), lost on death unless
insured" — the last unbuilt row of the economy table. Core trick: **the
slot decides only whether a relic is PRESENT in the sortie; combat's
squad-wide relic semantics stay untouched**, so combat code doesn't change.

## Model

- **Armoury** (new): `CampaignUiState.armoury: AbstractRelic[]` — the
  Company's owned, unassigned relics. Serialized (SAVE BUMP; serialize by
  relic name + any counter state — mirror the consumable pattern: a
  name→instance lookup on RelicsLibrary plus a SaveRegistries-style lint
  test asserting every acquirable relic resolves by name. Relics with
  constructor args (e.g. BelphegorsRounds(2)) need their state captured —
  inspect what varies; if only simple numeric state, add it to the DTO,
  else STOP and report the offenders).
- **Slots**: `PlayerCharacter.equippedRelics: AbstractRelic[]`, cap
  `relicSlots(level) = 2 + (level >= 6 ? 1 : 0)` (a leveling reward — pure
  helper in src/campaign/Leveling.ts next to deckCap). Serialized on
  CharacterDTO (same save bump; recruits/roster both already round-trip
  characters).
- **Insurance**: `insured: boolean` per equipped relic (£40 one-time,
  purchased at the Barracks; marker serializes). Register: "underwritten"
  language — Infernal Marine & Postal will be pleased.

## Sortie flow (mirrors the consumable loadout transfer)

- Dispatch (`SortieManager.startSortie`): deployed soldiers' equipped
  relics populate `GameState.relicsInventory` (plus nothing else — the
  legacy run-scoped inventory concept dies; see Migration).
- Mid-sortie acquisitions (events' `addLedgerItem`, shops): land in
  `GameState.relicsInventory` as today.
- Resolution (`resolveSortie`): equipped relics return to their owners'
  slots (they never left, conceptually — just remove them from the combat
  inventory); NEW relics acquired mid-sortie transfer to the **armoury**;
  combat inventory ends empty.
- Squad wipe: equipped relics on the dead are LOST unless `insured`
  (insured ones return to the armoury, insurance consumed, a debrief line
  in the register); mid-sortie acquisitions are lost with the squad.
- Individual death on a won sortie (applyCasualties): same per-soldier
  rule.

## Migration / cleanup

- `GameState.relicsInventory`'s `EmergencyTeleporter` seed moves to the
  fresh-campaign armoury.
- Saves are version-gated (no migration chains) — bump and move on.

## UI (Barracks, personnel-ledger style)

Selected soldier's detail column gains an EQUIPMENT strip: slot boxes
(n/cap), click an empty slot → picker overlay listing the armoury (name +
one-line effect + flavor), click equipped → unequip to armoury; an INSURE
£40 button per equipped uninsured relic. Armoury count shown. Dry register
throughout; BBCode/£.

## Explicitly out of v1

Relic shop at HQ (acquisition stays event/shop-in-sortie); per-relic
soldier-specific effects; more slot tiers; selling relics.

## Verification bar

typecheck + tests (armoury/equipped round-trip incl. insurance flag +
constructor-state offenders lint; relicSlots unit tests; wipe/death
loss-and-insurance logic if reachable purely) + build + smoke + browser:
equip/unequip/insure at Barracks, dispatch, verify equipped relics present
in combat inventory, return, verify armoury/slots restored; forced-wipe
(qa-spawn pattern) verifying uninsured lost + insured returned.

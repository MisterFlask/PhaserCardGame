/**
 * Phaser-free constants shared between the campaign layer and the
 * consumables system. src/campaign/ must never import ConsumablesLibrary or
 * any concrete AbstractConsumable subclass (house rule 1 — those pull in
 * Phaser transitively via ActionManager/BaseCharacter), so contract rewards
 * and stock caps are expressed here as plain strings/numbers. The UI layer
 * (which does import ConsumablesLibrary) resolves names back to instances.
 */

/** Total consumables a company may own at once (campaign stock, not the
 *  per-sortie loadout — every owned consumable is carried on every sortie). */
export const MAX_CONSUMABLE_STOCK = 3;

/**
 * Names of consumables ContractGenerator may offer as a reward. Kept as a
 * flat string table (not an import of ConsumablesLibrary) so the generator
 * stays Phaser-free. A lint test asserts every name here resolves via
 * ConsumablesLibrary.getConsumableByName.
 */
export const CONSUMABLE_REWARD_NAMES: readonly string[] = [
    "Health Potion",
    "Strength Elixir",
    "Adrenaline Charge",
    "Field Surgeon's Kit",
    "Signal Flare",
    "Reinforced Trench Coat",
    "Stoker's Tonic",
    "Precision Chronometer",
    "Soul-Collection Phylactery",
    "Surveyor's Field Glasses",
    "Bloodletting Kit",
    "Penitent's Scourge",
    "Sovereign's Purse",
];

/**
 * Merge campaign stock with sortie loadout, respecting the cap.
 * Generic over item type T (no consumable-specific knowledge).
 *
 * Returns a new array of at most `cap` items, keeping stock items first and
 * loadout items after (to preserve campaign stock priority). Discards
 * overflow from the end. Used at sortie resolution to transfer unused
 * loadout consumables back to campaign stock — the debug-only test tool can
 * overfill the loadout, so clamping is necessary (normal play never exceeds
 * the cap).
 *
 * `cap` defaults to the base MAX_CONSUMABLE_STOCK; this module stays pure
 * and project-ignorant (Capital Works Rebuild second wave: The Bonded
 * Warehouse widens the cap, but that fact lives on
 * CampaignUiState.getConsumableStockCap(), which callers pass in).
 */
export function mergeStockWithLoadout<T>(stock: T[], loadout: T[], cap: number = MAX_CONSUMABLE_STOCK): T[] {
    return [...stock, ...loadout].slice(0, cap);
}

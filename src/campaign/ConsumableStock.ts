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

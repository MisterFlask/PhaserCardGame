// Plain-data save format for at-HQ campaign persistence. No class instances,
// no Phaser types — everything here must survive JSON.stringify/parse.
// Class instances are reconstructed via SaveRegistries.

// v2: added contractsCompleted and per-project victory points.
// v3: added contract client and paymentClause (invoice-style flavor fields).
// v4: added standingOrders (active/pending order ids + bonus slots).
// v5: added per-character xp/level (Amendment: Soldier Levels & Promotions).
//     Perks ride the existing `traits` buff serialization (isPersonaTrait);
//     no new DTO shape needed for them.
// v6: added consumables (campaign-owned consumable stock; the per-sortie
//     loadout on GameState never serializes) and Contract.consumableRewardName.
// v7: added Contract.squadSize (2/3/4 muster requirement per contract).
export const SAVE_FORMAT_VERSION = 7;
export const SAVE_STORAGE_KEY = 'east-infernal-company-save';

export interface BuffDTO {
    /** Constructor name, resolved through the buff registry. */
    className: string;
    stacks: number;
    /** Mirrors AbstractBuff.moveToMainDescription (withoutShowingUpInBuffs). */
    hidden: boolean;
}

export interface CardDTO {
    /** Constructor name, resolved through the card registry. */
    className: string;
    /** Display name, which modifiers mutate (e.g. "Fire Revolver+🔮"). */
    displayName: string;
    buffs: BuffDTO[];
    // Numeric fields that card modifiers mutate in place.
    baseDamage: number;
    baseBlock: number;
    baseEnergyCost: number;
    baseMagicNumber: number;
}

export interface CharacterDTO {
    name: string;
    portraitName: string;
    /** BaseCharacterClass.name, resolved through the class registry. */
    className: string;
    maxHitpoints: number;
    weeksWoundedRemaining: number;
    traits: BuffDTO[];
    deck: CardDTO[];
    /** Cumulative XP; pending promotions are always derived (Leveling.ts), never stored. */
    xp: number;
    level: number;
}

export interface ContractDTO {
    name: string;
    description: string;
    type: string;
    client: string;
    paymentClause: string;
    act: number;
    segment: number;
    difficultyStars: number;
    numCombats: number;
    deadlineWeeks: number;
    durationWeeks: number;
    payout: number;
    squadSize: number;
    regionName: string;
    consumableRewardName?: string;
}

export interface ConsumableDTO {
    /** Display name, resolved through ConsumablesLibrary.getConsumableByName. */
    name: string;
    usesLeft: number;
}

export interface CalendarDTO {
    week: number;
    shareholderSatisfaction: number;
    currentDividendExpectation: number;
    boardEvents: { week: number; message: string; isWarning: boolean }[];
}

export interface OwnedProjectDTO {
    name: string;
    victoryPoints: number;
}

export interface StandingOrdersDTO {
    active: string[];
    pending: string[] | null;
    bonusSlots: number;
}

export interface CampaignSave {
    version: number;
    savedAtIso: string;
    moneyInVault: number;
    calendar: CalendarDTO;
    contracts: ContractDTO[];
    contractsCompleted: number;
    /** Matched by name against the canonical project instances on load so
     *  instance-identity checks in the investment UI keep working. */
    ownedProjects: OwnedProjectDTO[];
    roster: CharacterDTO[];
    standingOrders: StandingOrdersDTO;
    /** Campaign-owned consumable stock. The in-sortie loadout on
     *  GameState.consumables never serializes (saves are HQ-only). */
    consumables: ConsumableDTO[];
}

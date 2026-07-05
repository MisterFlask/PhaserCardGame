// Plain-data save format for at-HQ campaign persistence. No class instances,
// no Phaser types — everything here must survive JSON.stringify/parse.
// Class instances are reconstructed via SaveRegistries.

// v2: added contractsCompleted and per-project victory points.
export const SAVE_FORMAT_VERSION = 2;
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
}

export interface ContractDTO {
    name: string;
    description: string;
    type: string;
    act: number;
    segment: number;
    difficultyStars: number;
    numCombats: number;
    deadlineWeeks: number;
    durationWeeks: number;
    payout: number;
    regionName: string;
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
}

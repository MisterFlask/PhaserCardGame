// Pure, Phaser-free registry of "opposition" families -- who the squad is
// actually fighting, as distinct from the raw ActSegmentData encounter
// tables in src/encounters/EncounterManager.ts. Contracts name an
// opposition; encounter entries are tagged with the oppositions their
// enemies belong to; src/campaign/encounterSelection.ts biases the pick
// toward the contract's named opposition. House rule 1: nothing here may
// import anything Phaser-tainted.

export const OPPOSITION_IDS = [
    // act 1
    'boatmens-guild',
    'delta-fauna',
    'squatters-salvage',
    // act 2
    'grande-armee',
    'reichsinfernokorps',
    'rear-echelon',
    'paper-horrors',
    // act 3
    'stokers-union',
    'company-men',
    'foundry-vermin',
    // act 4
    'iron-choir',
    'barons-interests',
    'vent-fauna',
] as const;

export type OppositionId = typeof OPPOSITION_IDS[number];

export interface OppositionDefinition {
    displayName: string;
    act: number;
}

export const OPPOSITIONS: Record<OppositionId, OppositionDefinition> = {
    'boatmens-guild': { displayName: "The Boatmen's Guild", act: 1 },
    'delta-fauna': { displayName: "Delta Fauna", act: 1 },
    'squatters-salvage': { displayName: "Squatters & Salvage", act: 1 },

    'grande-armee': { displayName: "The Grande Armée Eternal", act: 2 },
    'reichsinfernokorps': { displayName: "The Reichsinfernokorps", act: 2 },
    'rear-echelon': { displayName: "The Rear Echelon", act: 2 },
    'paper-horrors': { displayName: "Paper Horrors", act: 2 },

    'stokers-union': { displayName: "The Stoker's Union", act: 3 },
    'company-men': { displayName: "Company Men", act: 3 },
    'foundry-vermin': { displayName: "Foundry Vermin", act: 3 },

    'iron-choir': { displayName: "The Iron Choir", act: 4 },
    'barons-interests': { displayName: "The Barons' Interests", act: 4 },
    'vent-fauna': { displayName: "Vent Fauna", act: 4 },
};

/** True if the given string is a recognized OppositionId. Used at the
 *  Phaser-tainted boundary (EncounterManager, save round-trip) where
 *  opposition ids cross as plain strings rather than the literal union. */
export function isOppositionId(id: string | undefined): id is OppositionId {
    return id !== undefined && Object.prototype.hasOwnProperty.call(OPPOSITIONS, id);
}

// Registry of class-specific perk pools (house rule 6: registries over
// if-this-class branches). Perks are randomized, class-specific passives
// granted at promotion levels 4 and 8 (see
// src/docs/strategic_layer_redesign.md, "Amendment: Soldier Levels &
// Promotions", and src/campaign/Leveling.ts).
//
// Every perk here MUST also be registered in src/saveload/SaveRegistries.ts
// (SaveRegistriesLint.test.ts enforces this) since perks ride the same
// isPersonaTrait serialization path as CharacterGenerator's persona traits.

import { AbstractBuff } from "../AbstractBuff";
import { CommandPresence } from "./archon/CommandPresence";
import { DrilledFormation } from "./archon/DrilledFormation";
import { ReadTheRiotAct } from "./archon/ReadTheRiotAct";
import { StiffUpperLip } from "./archon/StiffUpperLip";
import { ArsonistsInstinct } from "./blackhand/ArsonistsInstinct";
import { HairTriggerNerves } from "./blackhand/HairTriggerNerves";
import { PowderTemper } from "./blackhand/PowderTemper";
import { ScorchedEarthDoctrine } from "./blackhand/ScorchedEarthDoctrine";
import { OverpressuredValves } from "./cog/OverpressuredValves";
import { ReinforcedChassis } from "./cog/ReinforcedChassis";
import { SelfWindingMechanism } from "./cog/SelfWindingMechanism";
import { SurplusRequisitions } from "./cog/SurplusRequisitions";
import { GraveyardShift } from "./diabolist/GraveyardShift";
import { MarkedSoul } from "./diabolist/MarkedSoul";
import { PactWhisper } from "./diabolist/PactWhisper";
import { WardingSigil } from "./diabolist/WardingSigil";

type PerkCtor = new (stacks?: number) => AbstractBuff;

/** Keyed by BaseCharacterClass.name ("Archon", "Blackhand", "Cog", "Diabolist"). */
export const PERK_POOLS: Map<string, PerkCtor[]> = new Map([
    ["Archon", [CommandPresence, StiffUpperLip, DrilledFormation, ReadTheRiotAct]],
    ["Blackhand", [PowderTemper, ScorchedEarthDoctrine, HairTriggerNerves, ArsonistsInstinct]],
    ["Cog", [SelfWindingMechanism, ReinforcedChassis, OverpressuredValves, SurplusRequisitions]],
    ["Diabolist", [PactWhisper, GraveyardShift, MarkedSoul, WardingSigil]],
]);

/**
 * Rolls a random perk from the character's class pool, excluding perks the
 * character already owns (checked by display name against character.buffs),
 * and attaches it the same way persona traits attach (pushed directly onto
 * the persistent buffs array — perks are isPersonaTrait so they survive
 * combat-end/run-end pruning and the save round-trip).
 *
 * Returns null if the character's class has no pool or the pool is
 * exhausted (all perks already owned).
 */
export function grantRandomPerk(
    character: { characterClass: { name: string }; buffs: AbstractBuff[] },
    rng: () => number = Math.random
): AbstractBuff | null {
    const pool = PERK_POOLS.get(character.characterClass.name);
    if (!pool || pool.length === 0) {
        return null;
    }

    const ownedNames = new Set(character.buffs.map(b => b.getDisplayName()));
    const available = pool.filter(Ctor => !ownedNames.has(new Ctor().getDisplayName()));
    if (available.length === 0) {
        return null;
    }

    const chosenCtor = available[Math.floor(rng() * available.length)];
    const perk = new chosenCtor();
    character.buffs.push(perk);
    return perk;
}

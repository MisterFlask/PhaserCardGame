// Registries that map serialized class names back to live instances.
// Anything a save file can reference must be registered here; unknown names
// are skipped with a warning rather than crashing the load.

import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { Badass } from "../gamecharacters/buffs/persona/Badass";
import { BloodKnight } from "../gamecharacters/buffs/persona/BloodKnight";
import { CapitalistSoul } from "../gamecharacters/buffs/persona/CapitalistSoul";
import { Daring } from "../gamecharacters/buffs/persona/Daring";
import { HeavySmoker } from "../gamecharacters/buffs/persona/HeavySmoker";
import { Merchant } from "../gamecharacters/buffs/persona/Merchant";
import { Scholar } from "../gamecharacters/buffs/persona/Scholar";
import { StrongBack } from "../gamecharacters/buffs/persona/StrongBack";
import { Undersider } from "../gamecharacters/buffs/persona/Undersider";
import { WellDrilled } from "../gamecharacters/buffs/persona/WellDrilled";
import { CommandPresence } from "../gamecharacters/buffs/perks/archon/CommandPresence";
import { DrilledFormation } from "../gamecharacters/buffs/perks/archon/DrilledFormation";
import { ReadTheRiotAct } from "../gamecharacters/buffs/perks/archon/ReadTheRiotAct";
import { StiffUpperLip } from "../gamecharacters/buffs/perks/archon/StiffUpperLip";
import { ArsonistsInstinct } from "../gamecharacters/buffs/perks/blackhand/ArsonistsInstinct";
import { HairTriggerNerves } from "../gamecharacters/buffs/perks/blackhand/HairTriggerNerves";
import { PowderTemper } from "../gamecharacters/buffs/perks/blackhand/PowderTemper";
import { ScorchedEarthDoctrine } from "../gamecharacters/buffs/perks/blackhand/ScorchedEarthDoctrine";
import { OverpressuredValves } from "../gamecharacters/buffs/perks/cog/OverpressuredValves";
import { ReinforcedChassis } from "../gamecharacters/buffs/perks/cog/ReinforcedChassis";
import { SelfWindingMechanism } from "../gamecharacters/buffs/perks/cog/SelfWindingMechanism";
import { SurplusRequisitions } from "../gamecharacters/buffs/perks/cog/SurplusRequisitions";
import { GraveyardShift } from "../gamecharacters/buffs/perks/diabolist/GraveyardShift";
import { MarkedSoul } from "../gamecharacters/buffs/perks/diabolist/MarkedSoul";
import { PactWhisper } from "../gamecharacters/buffs/perks/diabolist/PactWhisper";
import { WardingSigil } from "../gamecharacters/buffs/perks/diabolist/WardingSigil";
import { Buster } from "../gamecharacters/buffs/playable_card/Buster";
import { Doubled } from "../gamecharacters/buffs/playable_card/Doubled";
import { Heavy } from "../gamecharacters/buffs/playable_card/Heavy";
import { Lightweight } from "../gamecharacters/buffs/playable_card/Lightweight";
import { Painful } from "../gamecharacters/buffs/playable_card/Painful";
import { Damaged } from "../gamecharacters/buffs/playable_card/SaleTags/Damaged";
import { OnSale } from "../gamecharacters/buffs/playable_card/SaleTags/OnSale";
import { BloodPriceBuff } from "../gamecharacters/buffs/standard/Bloodprice";
import { IncreaseBlood } from "../gamecharacters/buffs/standard/combatresource/IncreaseBlood";
import { IncreaseMettle } from "../gamecharacters/buffs/standard/combatresource/IncreaseMettle";
import { IncreaseAshes } from "../gamecharacters/buffs/standard/combatresource/IncreaseAshes";
import { IncreasePluck } from "../gamecharacters/buffs/standard/combatresource/IncreasePluck";
import { IncreaseSmog } from "../gamecharacters/buffs/standard/combatresource/IncreaseSmog";
import { IncreaseVenture } from "../gamecharacters/buffs/standard/combatresource/IncreaseVenture";
import { GrowingPowerBuff } from "../gamecharacters/buffs/standard/GrowingPower";
import { HellSellValue } from "../gamecharacters/buffs/standard/HellSellValue";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { Stress } from "../gamecharacters/buffs/standard/Stress";
import { SurfaceSellValue } from "../gamecharacters/buffs/standard/SurfaceSellValue";
import { BaseCharacterClass } from "../gamecharacters/BaseCharacterClass";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { ArchonClass } from "../gamecharacters/playerclasses/ArchonClass";
import { BlackhandClass } from "../gamecharacters/playerclasses/BlackhandClass";
import { Defend } from "../gamecharacters/playerclasses/cards/basic/Defend";
import { FireRevolver } from "../gamecharacters/playerclasses/cards/basic/FireRevolver";
import { Rummage } from "../gamecharacters/playerclasses/cards/basic/Rummage";
import { Jumpscare } from "../gamecharacters/playerclasses/cards/curse/Jumpscare";
import { CoinOnTheGround } from "../gamecharacters/playerclasses/cards/other/CoinOnTheGround";
import { CogClass } from "../gamecharacters/playerclasses/CogClass";
import { DiabolistClass } from "../gamecharacters/playerclasses/DiabolistClass";
import { SoulVacuum } from "../relics/uncommon/SoulBottler";
import { Berserk } from "../gamecharacters/statuses/curses/traumas/Berserk";
import { Greedy } from "../gamecharacters/statuses/curses/traumas/Greedy";
import { Idolatrous } from "../gamecharacters/statuses/curses/traumas/Idolatrous";
import { Paranoid } from "../gamecharacters/statuses/curses/traumas/Paranoid";
import { Vain } from "../gamecharacters/statuses/curses/traumas/Vain";

type BuffCtor = new (...args: any[]) => AbstractBuff;

const BUFF_CLASSES: BuffCtor[] = [
    // persona traits (CharacterGenerator pool)
    Scholar, WellDrilled, StrongBack, Undersider, Merchant,
    Badass, HeavySmoker, CapitalistSoul, Daring, BloodKnight,
    // class perks (promotion rewards at levels 4/8 — PerkPools.ts); these
    // ride the same isPersonaTrait serialization path as persona traits.
    CommandPresence, StiffUpperLip, DrilledFormation, ReadTheRiotAct,
    PowderTemper, ScorchedEarthDoctrine, HairTriggerNerves, ArsonistsInstinct,
    SelfWindingMechanism, ReinforcedChassis, OverpressuredValves, SurplusRequisitions,
    PactWhisper, GraveyardShift, MarkedSoul, WardingSigil,
    // buffs that can land on cards (starting decks + reward modifiers)
    IncreaseAshes, IncreaseMettle, IncreaseVenture, IncreaseSmog,
    IncreaseBlood, IncreasePluck, Lethality,
    Doubled, Lightweight, GrowingPowerBuff, Buster,
    SurfaceSellValue, HellSellValue, BloodPriceBuff,
    Damaged, OnSale, Heavy, Painful,
    // campaign-persistent afflictions carried on soldiers between sorties
    Stress,
];

// Saves store buff.constructor.name; renamed classes must keep resolving
// under the name older saves recorded (Pages→Ashes, Iron→Mettle, July 2026).
const LEGACY_BUFF_NAMES: Record<string, BuffCtor> = {
    IncreasePages: IncreaseAshes,
    IncreaseIron: IncreaseMettle,
};

export class SaveRegistries {
    private static buffByName?: Map<string, BuffCtor>;
    private static cardByName?: Map<string, () => PlayableCard>;

    public static createBuff(className: string, stacks: number): AbstractBuff | null {
        if (!this.buffByName) {
            this.buffByName = new Map(BUFF_CLASSES.map(c => [c.name, c]));
            for (const [legacyName, ctor] of Object.entries(LEGACY_BUFF_NAMES)) {
                this.buffByName.set(legacyName, ctor);
            }
        }
        const ctor = this.buffByName.get(className);
        if (!ctor) {
            console.warn(`SaveRegistries: unknown buff "${className}", skipping`);
            return null;
        }
        const buff = new ctor();
        buff.stacks = stacks;
        return buff;
    }

    public static createCharacterClass(className: string): BaseCharacterClass | null {
        switch (className) {
            case "Archon": return new ArchonClass();
            case "Blackhand": return new BlackhandClass();
            case "Diabolist": return new DiabolistClass();
            case "Cog": return new CogClass();
            default:
                console.warn(`SaveRegistries: unknown character class "${className}"`);
                return null;
        }
    }

    /**
     * Card factory by constructor name, built from every class's card pool
     * plus the basic/token cards that can end up in decks.
     */
    public static createCard(className: string): PlayableCard | null {
        if (!this.cardByName) {
            this.cardByName = new Map();
            const register = (card: PlayableCard) => {
                const key = card.constructor.name;
                if (!this.cardByName!.has(key)) {
                    // Store a factory that copies a pristine template.
                    this.cardByName!.set(key, () => card.Copy());
                }
            };
            [new ArchonClass(), new BlackhandClass(), new DiabolistClass(), new CogClass()]
                .forEach(characterClass => {
                    characterClass.initialize();
                    characterClass.availableCards.forEach(register);
                });
            // Basics plus cards that enter decks from outside the class pools
            // (relic/curse effects). The lint test enforces this list.
            [
                new FireRevolver(), new Defend(), new Rummage(),
                new CoinOnTheGround(), new Jumpscare(), new SoulVacuum(),
                // Trauma curses granted when Stress hits its threshold
                // (Stress.onCombatStart) — land on the master deck, so must
                // survive save/load.
                new Berserk(), new Greedy(), new Idolatrous(), new Paranoid(), new Vain(),
            ].forEach(register);
        }
        const factory = this.cardByName.get(className);
        if (!factory) {
            console.warn(`SaveRegistries: unknown card "${className}", skipping`);
            return null;
        }
        return factory();
    }
}

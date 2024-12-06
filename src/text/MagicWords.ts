import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { ErodingValue } from "../gamecharacters/buffs/playable_card/ErodingValue";
import { ExhaustBuff } from "../gamecharacters/buffs/playable_card/ExhaustBuff";
import { Figment } from "../gamecharacters/buffs/playable_card/Figment";
import { Fragile } from "../gamecharacters/buffs/playable_card/Fragile";
import { Heavy } from "../gamecharacters/buffs/playable_card/Heavy";
import { Lightweight } from "../gamecharacters/buffs/playable_card/Lightweight";
import { Painful } from "../gamecharacters/buffs/playable_card/Painful";
import { VolatileBuff } from "../gamecharacters/buffs/playable_card/VolatileCardBuff";
import { Blind } from "../gamecharacters/buffs/standard/Blind";
import { BloodPriceBuff } from "../gamecharacters/buffs/standard/Bloodprice";
import { Bulwark } from "../gamecharacters/buffs/standard/Bulwark";
import { Burning } from "../gamecharacters/buffs/standard/Burning";
import { Cursed } from "../gamecharacters/buffs/standard/Cursed";
import { DamageIncreaseOnKill } from "../gamecharacters/buffs/standard/DamageIncreaseOnKill";
import { Devil } from "../gamecharacters/buffs/standard/Devil";
import { DrawOneFewerCardNextNTurns } from "../gamecharacters/buffs/standard/DrawOneFewerCardNextNTurns";
import { EldritchHorror } from "../gamecharacters/buffs/standard/EldritchHorror";
import { ExplosiveFinishCardBuff } from "../gamecharacters/buffs/standard/ExplosiveFinishCardBuff";
import { FearGod } from "../gamecharacters/buffs/standard/FearGod";
import { Fearless } from "../gamecharacters/buffs/standard/Fearless";
import { Flying } from "../gamecharacters/buffs/standard/Flying";
import { GiantKiller } from "../gamecharacters/buffs/standard/GiantKiller";
import { GrowingPowerBuff } from "../gamecharacters/buffs/standard/GrowingPower";
import { HellSellValue } from "../gamecharacters/buffs/standard/HellSellValue";
import { Holy } from "../gamecharacters/buffs/standard/Holy";
import { NextTurnStrength } from "../gamecharacters/buffs/standard/NextTurnStrength";
import { Obsession } from "../gamecharacters/buffs/standard/Obsession";
import { Poisoned } from "../gamecharacters/buffs/standard/Poisoned";
import { ReactiveShielding } from "../gamecharacters/buffs/standard/ReactiveShielding";
import { Stress } from "../gamecharacters/buffs/standard/Stress";
import { StressReliefFinisher } from "../gamecharacters/buffs/standard/StressReliefFinisher";
import { Lethality } from "../gamecharacters/buffs/standard/Strong";
import { SurfaceSellValue } from "../gamecharacters/buffs/standard/SurfaceSellValue";
import { Swarm } from "../gamecharacters/buffs/standard/Swarm";
import { Tense } from "../gamecharacters/buffs/standard/Tense";
import { Terrifying } from "../gamecharacters/buffs/standard/Terrifying";
import { Titan } from "../gamecharacters/buffs/standard/Titan";
import { ValuableCargo } from "../gamecharacters/buffs/standard/ValuableCargo";
import { Vulnerable } from "../gamecharacters/buffs/standard/Vulnerable";
import { Ward } from "../gamecharacters/buffs/standard/Ward";
import { Weak } from "../gamecharacters/buffs/standard/Weak";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { EldritchSmoke } from "../gamecharacters/playerclasses/cards/diabolist/tokens/EldritchSmoke";


export class MagicWordsResult{
    buffs: AbstractBuff[] = [];
    cards: PlayableCard[] = [];
    concepts: MagicConcept[] = [];
    stringResult: string = "";
}

export class MagicConcept{
    constructor(name: string, description: string){
        this.name = name;
        this.description = description;
    }

    public name: string = "";
    public description: string = "";
}

export class MagicWords {
    cards = [
        new EldritchSmoke()
    ]
    allBuffsThatCouldPossiblyExist = [
        new Lethality(),
        new Weak(),
        new ErodingValue(),
        new ExhaustBuff(),
        new Figment(),
        new Fragile(),
        new Heavy(),
        new Lightweight(),
        new Painful(),
        new VolatileBuff(),
        new Ward(),
        new Blind(),
        new BloodPriceBuff(1),
        new Bulwark(),
        new Burning(),
        new Cursed(),
        new DamageIncreaseOnKill(),
        new Devil(),
        new DrawOneFewerCardNextNTurns(),
        new EldritchHorror(),
        new ExplosiveFinishCardBuff(1),
        new FearGod(),
        new Fearless(),
        new Flying(),
        new GiantKiller(),
        new GrowingPowerBuff(),
        new HellSellValue(),
        new Holy(),
        new NextTurnStrength(),
        new Obsession(),
        new Poisoned(),
        new ReactiveShielding(),
        new Stress(),
        new Terrifying(),
        new StressReliefFinisher(),
        new SurfaceSellValue(),
        new Swarm(),
        new Tense(),
        new Titan(1),
        new ValuableCargo(),
        new Vulnerable()
    ];

    private concepts: MagicConcept[] = [
        new MagicConcept("Exert", "Spend up to X energy after playing this card to activate an effect.")
    ];

    private flavorConcepts: MagicConcept[] = [
            new MagicConcept("Hell", "Some academics still insist that, no, there is no relationship to the Christian afterlife, and furthermore that everyone ought to call it 'The Maxwell-Babbage Adiabatic Dimension', which they most certainly will not."),
            new MagicConcept("Maxwell Coil", "Maxwell Coils are essential for maintaining the structural integrity of rifts, such as the Buckingham Rift, by counteracting the natural tendency of planar boundaries to collapse or destabilize under stress."),
            new MagicConcept("Stoker's Union", "The Stoker's Union operates the Furnace of Dis, nominally under the control of the Cinder Court. They also maintain the lesser furnaces scattered throughout the Maxwell-Babbage Adiabatic Dimension."),
            new MagicConcept("British Trade Delegation", "The British Trade Delegation uses technology and diplomacy to exploit Hell's resources. They are central to the operation of the Buckingham Rift and have legal dispensation to say which British companies may operate in Hell."),
            new MagicConcept("Artisanal Guilds", "An ancient order of craftsdevils, the Artisanal Guilds are threatened by the influx of British goods and the disruption of their longstanding economic structures."),
            new MagicConcept("Brimstone Barons", "Wealthy industrialists who control the heavy industries of Hell.  They guard their monopolies with private militias and ruthless tactics."),
            new MagicConcept("Cinder Court", "The ancient demonic noble houses of Hell.  They rule the Nine Circles by law and custom."),
            new MagicConcept("Cult of the Invasion", "This faction, primarily filled with academics and madmen, is continually scheming for a final ill-advised invasion of Heaven."),
            new MagicConcept("Underclass", "The weakest of the devils, the Underclass performs dangerous and degrading labor on behalf of the upper crust."),
            new MagicConcept("City of Dis", "The sprawling industrial heart of Hell, Dis is a cacophonous metropolis of gothic architecture and endless labor. It houses the Furnace of Dis and serves as the center of Infernal politics and commerce."),
            new MagicConcept("Furnace of Dis", "A colossal and ancient furnace that powers Hell's industry and possibly sustains its existence. The Stoker's Union tightly controls access."),
            new MagicConcept("Styx Delta", "A swampy labyrinth where the River Styx splits into countless channels.  Swimming not advised."),
            new MagicConcept("Brimstone Badlands", "A volcanic wasteland dominated by brimstone mines and controlled by the Brimstone Barons.  The Phlegothon runs through it; valuable exports include Phlegothon Oil and Brimstone Distillate."),
            new MagicConcept("Screaming Forests", "A primeval wilderness of sentient, wailing trees and dangerous creatures. Valuable exports include Screaming Timber and Sorrowvines."),
            new MagicConcept("Clockwork Wastes", "A desolate wasteland littered with ancient infernal machines and half-mechanical creatures used in a war long-forgotten.  Valuable exports include prelapsarian war machines and the occasional angelic artifact."),
            new MagicConcept("Abyssal Frontier", "The edge of Hell, where its reality fades into infinite darkness and alien geometries.")
        ]
    

    private static instance: MagicWords;
    private constructor() {}

    public static getInstance(): MagicWords {
        if (!MagicWords.instance) {
            MagicWords.instance = new MagicWords();
        }
        return MagicWords.instance;
    }



    public getMagicWordsResult(input: string): MagicWordsResult {
        const result = new MagicWordsResult();
        let modifiedString = input;

        modifiedString = this.colorizeAndRecordBuffs(input, result, modifiedString);

        result.stringResult = modifiedString;
        return result;
    }

    private colorizeAndRecordBuffs(input: string, result: MagicWordsResult, modifiedString: string) {
        for (const buff of this.allBuffsThatCouldPossiblyExist) {
            const buffName = buff.getDisplayName();
            // Case insensitive search with word boundaries
            const regex = new RegExp(`\\b${buffName}\\b`, 'gi');
            // If the buff name exists in the string
            if (regex.test(input)) {
                // Add the buff to the result
                result.buffs.push(buff);

                // Replace the text with yellow bbcode
                modifiedString = modifiedString.replace(regex, `[color=yellow]${buffName}[/color]`);
            }
        }

        for (const concept of this.concepts){
            const conceptName = concept.name;
            const regex = new RegExp(`\\b${conceptName}\\b`, 'gi');
            if (regex.test(input)) {
                result.concepts.push(concept);
                modifiedString = modifiedString.replace(regex, `[color=yellow]${conceptName}[/color]`);
            }
        }

        // get all cards from the array defined above
        for (const card of this.cards) {
            const cardName = card.name;
            const regex = new RegExp(`\\b${cardName}\\b`, 'gi');
            if (regex.test(input)) {
                result.cards.push(card);
                modifiedString = modifiedString.replace(regex, `[color=yellow]${cardName}[/color]`);
            }
        }
        return modifiedString;
    }

    public getFlavorMagicWordsResult(input: string): MagicWordsResult {
        const result = new MagicWordsResult();
        let modifiedString = input;

        // Check for flavor concepts
        for (const concept of this.flavorConcepts) {
            const conceptName = concept.name;
            const regex = new RegExp(`\\b${conceptName}\\b`, 'gi');
            if (regex.test(input)) {
                result.concepts.push(concept);
                modifiedString = modifiedString.replace(regex, `[color=yellow][area=${conceptName}]${conceptName}[/area][/color]`);
            }
        }

        result.stringResult = modifiedString;
        return result;
    }
}
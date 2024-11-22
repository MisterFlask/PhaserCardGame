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
    stringResult: string = "";
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
            const buffName = buff.getName();
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
}
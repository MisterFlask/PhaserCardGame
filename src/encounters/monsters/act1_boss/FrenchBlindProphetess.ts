import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator, SummonIntent } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { MothGod } from '../../../gamecharacters/buffs/enemy_buffs/MothGod';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { Titan } from '../../../gamecharacters/buffs/standard/Titan';
import { Vulnerable } from '../../../gamecharacters/buffs/standard/Vulnerable';
import { CardSize } from '../../../gamecharacters/Primitives';
import { GameState } from '../../../rules/GameState';
import { VeilCapacitor } from '../act1_segment1/VeilCapacitor';
export class FrenchBlindProphetess extends AutomatedCharacter {
    constructor() {
        super({
            name: "Doris Smith",
            portraitName: "Boss Zodiac Virgo",
            maxHitpoints: 200,
            description: "whispers of the Final Argument"
        });
        this.portraitTargetLargestDimension = 600;
        this.portraitOffsetXOverride = -100
        this.portraitOffsetYOverride = 0
        this.size = CardSize.SMALL;
        // Apply initial MothGod buff
        this.buffs.push(new MothGod(2));
        this.buffs.push(new Titan(2))
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            this.getSummonOrAttackIntent(),
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Vulnerable(2), owner: this }).withTitle("Fascinating Prophecy"),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Stress(1), owner: this }).withTitle("Unnerving Knowledge")
            ],
            [
                new AttackIntent({ baseDamage: 15, owner: this }).withTitle("KNOW THY FOLLY")
            ],
        ];

        return IntentListCreator.iterateIntents(intents);
    }
    getSummonOrAttackIntent(): AbstractIntent[] {

        const gameState = GameState.getInstance();
        const veilCapacitorCount = gameState.combatState.enemies.filter(enemy => enemy instanceof VeilCapacitor).length;

        if (veilCapacitorCount >= 3) {
            return [
                new AttackAllPlayerCharactersIntent({ baseDamage: 10, owner: this }).withTitle("REGRET YOUR HUBRIS")
            ];
        }

        return [
            new SummonIntent({monsterToSummon: new VeilCapacitor(), owner: this}).withTitle("Conjure Veil Capacitor"),
            new SummonIntent({monsterToSummon: new VeilCapacitor(), owner: this}).withTitle("Conjure Veil Capacitor"),
        ];
    }
}

import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { MothGod } from '../../../gamecharacters/buffs/enemy_buffs/MothGod';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { Vulnerable } from '../../../gamecharacters/buffs/standard/Vulnerable';
import { Weak } from '../../../gamecharacters/buffs/standard/Weak';
import { CardSize } from '../../../gamecharacters/Primitives';
export class FrenchBlindProphetess extends AutomatedCharacter {
    constructor() {
        super({
            name: "La Prophétesse Aveugle",
            portraitName: "Eldritch Blind Prophetess",
            maxHitpoints: 200,
            description: "whispers of the Final Argument"
        });
        
        this.size = CardSize.LARGE;
        // Apply initial MothGod buff
        this.buffs.push(new MothGod(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Weak(2), owner: this }).withTitle("Enfeebling Vision")
            ],
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Vulnerable(2), owner: this }).withTitle("Fascinating Prophecy"),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Stress(1), owner: this }).withTitle("Unnerving Knowledge")
            ],
            [
                new AttackIntent({ baseDamage: 30, owner: this }).withTitle("KNOW THY FOLLY")
            ],
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}

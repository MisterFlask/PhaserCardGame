import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { MothGod } from '../../../gamecharacters/buffs/enemy_buffs/MothGod';
import { Stress } from '../../../gamecharacters/buffs/standard/Stress';
import { Vulnerable } from '../../../gamecharacters/buffs/standard/Vulnerable';
import { Weak } from '../../../gamecharacters/buffs/standard/Weak';
export class FrenchBlindProphetess extends AutomatedCharacter {
    constructor() {
        super({
            name: "La Prophétesse Aveugle",
            portraitName: "Eldritch Blind Prophetess",
            maxHitpoints: 200,
            description: "whispers of the Final Argument"
        });
        
        // Apply initial MothGod buff
        this.buffs.push(new MothGod(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Weak(2), owner: this }).withTitle("Enfeebling Vision")
            ],
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Vulnerable(2), owner: this }).withTitle("Revealing Prophecy"),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Stress(1), owner: this }).withTitle("Terrible Knowledge")
            ],
            [
                new AttackIntent({ baseDamage: 30, owner: this }).withTitle("KNOW THY FOLLY")
            ],
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}

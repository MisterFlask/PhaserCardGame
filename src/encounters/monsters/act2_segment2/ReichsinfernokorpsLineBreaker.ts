import { AbstractIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { RustMonster } from "../../../gamecharacters/buffs/enemy_buffs/RustMonster";

export class ReichsinfernokorpsLineBreaker extends AutomatedCharacter {
    constructor() {
        super({
            name: "Reichsinfernokorps Line-Breaker",
            portraitName: "Eldritch Soldier Gunner",
            maxHitpoints: 135,
            description: "Whatever Berlin fitted this one with in place of an arm, it fires in a register I felt in my back teeth. It doesn't so much attack our defences as make a study of them - every hit seems to find the weak seam in whatever we'd braced with, and the seam stays weak. Ostensibly this unit exists to liberate the trenches from Bonapartiste tyranny. In practice it has liberated our shield-wall from ever holding twice in the same place."
        });
        this.buffs.push(new RustMonster(3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 17, owner: this }).withTitle('Seam-Finder')
            ],
            [
                new AttackIntent({ baseDamage: 9, owner: this }).withTitle('Suppressing Fire'),
                new AttackIntent({ baseDamage: 9, owner: this }).withTitle('Suppressing Fire')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

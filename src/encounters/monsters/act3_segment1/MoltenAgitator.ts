import { AbstractIntent, ApplyBuffToAllEnemyCharactersIntent, ApplyDebuffToAllPlayerCharactersIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, DoSomethingIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Burning } from "../../../gamecharacters/buffs/standard/Burning";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { RevolutionaryFervor } from "../../../gamecharacters/buffs/standard/RevolutionaryFervor";
import { BurningImmune } from "../../../gamecharacters/buffs/standard/BurningImmune";
import { TargetingUtils } from "../../../utils/TargetingUtils";

export class MoltenAgitator extends AutomatedCharacter {
    constructor(){
        super({
            name: 'Molten Agitator',
            portraitName: 'fiery-orator',
            maxHitpoints: 50,
            description: 'A fanatic spouting incendiary rhetoric.'
        });
        this.buffs.push(new RevolutionaryFervor(4));
        this.buffs.push(new BurningImmune());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new DoSomethingIntent({
                    owner: this,
                    imageName: 'fire-breath',
                    action: () => {
                        for (const ally of TargetingUtils.getInstance().selectAllEnemyCharacters()) {
                            this.actionManager.applyBuffToCharacter(ally, new Lethality(2));
                        }
                        const everyone = [...TargetingUtils.getInstance().selectAllEnemyCharacters(), ...TargetingUtils.getInstance().selectAllPlayerCharacters()];
                        for (const c of everyone) {
                            this.actionManager.applyBuffToCharacter(c, new Burning(3));
                        }
                    }
                }).withTitle('Inflammatory Speech')
            ],
            [
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle('Thrown Slag'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Burning(2), owner: this })
            ],
            [
                new AttackIntent({ baseDamage: 15, owner: this }).withTitle('Boiling Blood')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

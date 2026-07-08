import { AbstractIntent, AttackIntent, DoSomethingIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { TargetingUtils } from "../../../utils/TargetingUtils";

// Ally-wide heal+buff idiom reused from Molten Agitator / Wildcat Striker
// (DoSomethingIntent iterating TargetingUtils.selectAllEnemyCharacters()).
// HP band: a support unit alongside Company Overseer (70) + ~20% ≈ 84.
export class ChoirCantor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Choir Cantor",
            portraitName: "",
            maxHitpoints: 84,
            description: "Cavendish survey note: senior to the novices by voice alone, so far as I can determine - there is no visible rank insignia, only a deeper register and a considerably more confident hymn. Leads the compound's other residents through what I can only call a working chorus: wounds close, tempers rise, and the whole line seems to draw breath together on her cue. I did not enjoy standing near her. None of us did."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new DoSomethingIntent({
                    owner: this,
                    imageName: 'round-shield',
                    action: () => {
                        for (const ally of TargetingUtils.getInstance().selectAllEnemyCharacters()) {
                            this.actionManager.heal(ally, 8);
                            this.actionManager.applyBuffToCharacter(ally, new Lethality(2));
                        }
                    }
                }).withTitle('Working Chorus')
            ],
            [ new AttackIntent({ baseDamage: 9, owner: this }).withTitle('Censer Strike') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

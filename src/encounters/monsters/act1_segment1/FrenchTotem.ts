import { AbstractIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';

export class FrenchTotem extends AutomatedCharacter {
    constructor() {
        super({
            name: "Veil Capacitor",
            portraitName: "Stress Totem",
            maxHitpoints: 5,
            description: "A small, unsettling totem.  Probably not worth worrying about."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 1, owner: this }).withTitle("Hateful Aura")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}

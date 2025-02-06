import { AbstractIntent, ApplyBuffToAllEnemyCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { Lethality } from '../../../gamecharacters/buffs/standard/Lethality';

export class VeilCapacitor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Obelisk of Pentacles",
            portraitName: "veil-capacitor",
            maxHitpoints: 14,
            description: "A small, unsettling totem.  Probably not worth worrying about."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyBuffToAllEnemyCharactersIntent({ debuff: new Lethality(2), owner: this }).withTitle("Gathering Eldritch Energy")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}

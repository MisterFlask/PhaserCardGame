import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { DrawOneFewerCardNextNTurns } from "../../../gamecharacters/buffs/standard/DrawOneFewerCardNextNTurns";

export class CompanyBailiff extends AutomatedCharacter {
    constructor() {
        super({
            name: "Company Bailiff",
            portraitName: "capitalist_2",
            maxHitpoints: 88,
            description: "Arrived with a writ, a smile, and a considerably larger colleague standing just behind him, and informed us we were operating under-strength for our licensed tonnage. The remedy, apparently, is a formal requisition against our own capacity - fewer hands drawing tools, he called it, filling out the form even as he spoke, in a hand far too neat for the circumstances. I have met bailiffs on the surface. This one at least has the decency to smoke while he ruins you."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new DrawOneFewerCardNextNTurns(1), owner: this }).withTitle('Requisition Order')
            ],
            [
                new AttackIntent({ baseDamage: 16, owner: this }).withTitle('Seize Assets')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

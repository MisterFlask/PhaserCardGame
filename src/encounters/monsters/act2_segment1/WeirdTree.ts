import { AbstractIntent, AddCardToPileIntent, AttackIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Sap } from "../../../gamecharacters/statuses/Sap";

export class WeirdTree extends AutomatedCharacter {
    constructor() {
        super({
            name: "Weird Tree",
            portraitName: "Eldritch Corruption Treant",
            maxHitpoints: 45,
            description: "A twisted tree that drips with sticky sap. Its branches reach out menacingly."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        return [
            new AttackIntent({ baseDamage: 15, owner: this }).withTitle("Sap Strike"),
            new AddCardToPileIntent({ 
                cardToAdd: new Sap(),
                pileName: 'draw',
                owner: this
            }).withTitle("Drip Sap")
        ];
    }
}

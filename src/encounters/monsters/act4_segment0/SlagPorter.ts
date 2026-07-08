import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Bulwark } from "../../../gamecharacters/buffs/standard/Bulwark";

// HP band: a segment-0 "sturdy but not scary" body, set between act-3
// segment-0's lightweights (15-38) and its segment-1 tanks (88+) since this
// is a beast of burden, not a combatant, scaled ~20% over an act-3 analog.
export class SlagPorter extends AutomatedCharacter {
    constructor() {
        super({
            name: "Slag Porter",
            portraitName: "slag-porter",
            maxHitpoints: 66,
            description: "Cavendish survey note: a yoked pack-beast bred (or built - the distinction is not always clear down here) to haul raw brimstone off the vent field, and it has apparently decided this particular haul is beneath it. Refuses to move, plants all four feet, and simply absorbs whatever is thrown at it with the aggrieved patience of a creature that has filed a grievance and is waiting on a reply. Its kick, when it finally deigns to deliver one, carries the full weight of its objection."
        });
        this.buffs.push(new Bulwark(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new BlockForSelfIntent({ blockAmount: 16, owner: this }).withTitle('Plant Feet') ],
            [ new AttackIntent({ baseDamage: 7, owner: this }).withTitle('Aggrieved Kick') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

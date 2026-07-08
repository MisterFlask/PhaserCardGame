import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Bulwark } from "../../../gamecharacters/buffs/standard/Bulwark";
import { CardSize } from "../../../gamecharacters/Primitives";

// HP band: act-3 segment-2's heaviest single body, Ironclad Picket (120),
// + ~20% ≈ 144, in line with an Iron Choir elite guarding the compound's
// inner ring.
export class FoundrySeraph extends AutomatedCharacter {
    constructor() {
        super({
            name: "Foundry Seraph",
            portraitName: "foundry-seraph",
            maxHitpoints: 144,
            description: "Cavendish survey note: the Iron Choir's own, and unmistakably a cut above the compound's rank-and-file wardens - wings of hammered plate, welded rather than worn, and a bearing that suggests it considers combat a liturgical function rather than a chore. Alternates without variation between two postures: a defensive one, wings folded close, that shrugs off everything thrown at it, and an offensive one, wings flared, that puts a very great deal back. The Choir apparently regards the pattern as a hymn. I regarded it as entirely predictable and no less dangerous for it."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Bulwark(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new BlockForSelfIntent({ blockAmount: 30, owner: this }).withTitle('Wings Folded') ],
            [ new AttackIntent({ baseDamage: 28, owner: this }).withTitle('Wings Flared') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

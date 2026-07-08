import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { SelfDestruct } from "../../../gamecharacters/buffs/enemy_buffs/SelfDestruct";

// "Explodes on death" per the design doc: no on-death hook exists on
// AutomatedCharacter/BaseCharacter (checked AbstractIntent, AutomatedCharacter,
// SelfDestruct itself), so per the doc's documented fallback this reuses the
// SelfDestruct buff verbatim (Overpressure Stoker, act 3) as a timed 3-turn
// fuse instead. HP band: Overpressure Stoker (90) + ~20% ≈ 108.
export class InterdictedHauler extends AutomatedCharacter {
    constructor() {
        super({
            name: "Interdicted Hauler",
            portraitName: "",
            maxHitpoints: 108,
            description: "Cavendish survey note: a freight-engine seized under the interdict and left standing on the compound apron with its cargo of raw brimstone still loaded and its boiler, evidently, still lit. Nobody among the Choir's toll-men would approach it closely enough to explain why. The gauge is climbing at a rate I'd call alarming if the Choir seemed alarmed by it, which they conspicuously do not. Recommend distance."
        });
        this.buffs.push(new SelfDestruct(26, 3));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new AttackIntent({ baseDamage: 13, owner: this }).withTitle('Freight Ram') ],
            [
                new BlockForSelfIntent({ blockAmount: 12, owner: this }).withTitle('Seal the Boiler'),
                new AttackIntent({ baseDamage: 7, owner: this }).withTitle('Seal the Boiler')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { ReactiveShielding } from "../../../gamecharacters/buffs/standard/ReactiveShielding";
import { StunnedBuff } from "../../../gamecharacters/buffs/playable_card/Stunned";

// Reactive shielding idiom reused verbatim from Ironclad Picket (act 3); the
// stun-adjacent debuff idiom (StunnedBuff, next-cards-drawn cost bump) reused
// from Union Enforcer (act 3). HP band: Ironclad Picket (120) + ~20% ≈ 144.
export class BellWarden extends AutomatedCharacter {
    constructor() {
        super({
            name: "Bell-Warden",
            portraitName: "bell-warden",
            maxHitpoints: 144,
            description: "Cavendish survey note: stationed at the compound's inner gate, cast rather than born by the look of the joints, and rings faintly with every step whether struck or not. The first blow any of us landed was answered a beat later by a wall of plating none of us saw him raise - the same trick the Furnace Belt's ironclads favour, though this one rings a clear, precise note when it happens, as if logging the transaction for someone's benefit. His counter-toll left two of the party fumbling their next draw."
        });
        this.buffs.push(new ReactiveShielding(14));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new AttackIntent({ baseDamage: 15, owner: this }).withTitle('Clapper Strike') ],
            [
                new AttackIntent({ baseDamage: 9, owner: this }).withTitle('Warding Peal'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new StunnedBuff(2), owner: this }).withTitle('Warding Peal')
            ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

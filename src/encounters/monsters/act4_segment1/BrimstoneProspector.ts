import { AbstractIntent, ApplyDebuffToRandomCharacterIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";

// No enemy-side £-theft-from-player idiom exists in the buff library (only
// player-facing money debits and self-buffing "gain £ on X" enemy buffs like
// GreedIncarnate, which is the opposite direction) — per the design doc's
// documented fallback, this applies Weak and cycles a flees-style retreat
// beat instead of stealing coin. HP band: a scout-tier unit alongside Choir
// Novice/Union Runner analogues (~50), + ~20% over an act-3 skirmisher.
export class BrimstoneProspector extends AutomatedCharacter {
    constructor() {
        super({
            name: "Brimstone Prospector",
            portraitName: "",
            maxHitpoints: 52,
            description: "Cavendish survey note: independent, unlicensed, and considerably faster on his feet than his claim stakes suggest he ought to be. Works a knife with the casual confidence of a man who has never once had to finish a fight he started, mostly because he doesn't - lands one cut, judges the ground unfavourable, and is three fissures away before anyone can press the advantage. The Barons class him a nuisance. I'd class him sensible."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 9, owner: this }).withTitle('Opportunist Cut'),
                new ApplyDebuffToRandomCharacterIntent({ debuff: new Weak(2), owner: this })
            ],
            [ new BlockForSelfIntent({ blockAmount: 12, owner: this }).withTitle('Judge the Ground and Flee') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

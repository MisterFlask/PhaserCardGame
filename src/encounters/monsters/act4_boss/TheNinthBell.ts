import { AbstractIntent, AttackAllPlayerCharactersIntent, DoSomethingIntent, IntentListCreator, SummonIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { Armored } from "../../../gamecharacters/buffs/standard/Armored";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { CardSize } from "../../../gamecharacters/Primitives";
import { ChoirNovice } from "../act4_segment0/ChoirNovice";

/**
 * The Ninth Bell — a campanile-construct the Iron Choir will not admit to
 * casting. Multi-phase, modeled on the Act 3 bosses' half-HP branch pattern
 * (RegionalManager's reorgTriggered flag): a rotation of tolling
 * (party-wide damage that builds each toll, mirroring Regional Manager's
 * GrowingPowerBuff-flavored escalation but implemented as a rising baseDamage
 * so the toll itself visibly gets louder) and Choir Novice summons, until it
 * cracks at half HP — its Armored block engine is stripped and it gains
 * Lethality for the remainder of the fight, trading survivability for
 * offense exactly once.
 */
export class TheNinthBell extends AutomatedCharacter {
    private cracked: boolean = false;
    private tollCount: number = 0;

    constructor() {
        super({
            name: "The Ninth Bell",
            portraitName: "",
            maxHitpoints: 380,
            description: "Cavendish survey note, and I choose my words with some care: the Iron Choir maintains that it does not ring its own bells, that the compound's campanile has always rung itself, and that this has never once been remarked upon as unusual. Having now stood beneath it during an engagement, I am inclined to believe the second claim and disbelieve the first with equal conviction. It counts its tolls audibly, and each one lands heavier than the last, as though the bell itself is keeping a ledger and the ledger is coming due. Struck hard enough, the bronze audibly cracks - and whatever mechanism was holding its shape in check goes with it. What follows the crack rings considerably less like a hymn."
        });
        this.size = CardSize.LARGE;
        this.buffs.push(new Armored(6));
    }

    override generateNewIntents(): AbstractIntent[] {
        if (!this.cracked && this.hitpoints <= this.maxHitpoints / 2) {
            this.cracked = true;
            return [
                new DoSomethingIntent({
                    owner: this,
                    imageName: 'sword-array',
                    action: () => {
                        this.actionManager.removeBuffFromCharacter(this, new Armored(1).getDisplayName());
                        this.actionManager.applyBuffToCharacter(this, new Lethality(6));
                    }
                }).withTitle('The Bell Cracks')
            ];
        }

        const noviceA = new ChoirNovice(); noviceA.maxHitpoints = 30; noviceA.hitpoints = 30;
        const noviceB = new ChoirNovice(); noviceB.maxHitpoints = 30; noviceB.hitpoints = 30;

        this.tollCount++;
        const intents: AbstractIntent[][] = [
            [ new AttackAllPlayerCharactersIntent({ baseDamage: 8 + this.tollCount * 2, owner: this }).withTitle(`Toll the ${this.tollCount}th`) ],
            [
                new SummonIntent({ monsterToSummon: noviceA, owner: this }).withTitle('Ring the Novices'),
                new SummonIntent({ monsterToSummon: noviceB, owner: this }).withTitle('Ring the Novices')
            ],
            [ new AttackAllPlayerCharactersIntent({ baseDamage: 8 + this.tollCount * 2, owner: this }).withTitle(`Toll the ${this.tollCount}th`) ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

import { AbstractBuff } from "../AbstractBuff";
import { Lethality } from "./Lethality";

export class Stress extends AbstractBuff {
    override getDisplayName(): string {
        return "Stress";
    }

    override getDescription(): string {
        return `If you have ${this.secondaryStacks} Stress stacks, lose all Stress and then gain 1 Trauma and lose 2 Strength.`;
    }

    override id: string = "stress";
    constructor(stacks: number = 0) {
        super();
        this.imageName = "shattered-heart"; // Replace with actual icon name
        this.stacks = stacks;
        this.stackable = true;
        this.isPersistentBetweenCombats = true;
        this.secondaryStacks = 10;
        this.showSecondaryStacks = true;
    }

    override onCombatStart(): void {
        if (this.stacks < this.secondaryStacks) {
            return;
        }

        const owner = this.getOwnerAsCharacter();
        if (!owner) {
            return;
        }

        // Lose all Stress.
        this.actionManager.applyBuffToCharacter(owner, new Stress(-this.stacks));

        // Gain 1 Trauma: a random trauma curse card lands in hand and joins
        // the owner's master deck, mirroring ActionManager.stateBasedEffects'
        // (dormant, case-mismatched) trauma grant. Assign ownership explicitly
        // so the curse lands on the character who actually broke, rather than
        // whichever party member CardOwnershipManager would guess at.
        //
        // TraumaLibrary is dynamic-imported rather than statically imported:
        // Stress.ts sits very early in the module graph (buffs/standard/ is
        // imported from dozens of places), and a static import here reaches
        // TraumaLibrary -> PlayableCard -> ... -> ActionManager -> Stress,
        // closing a cycle that breaks webpack's init order ("Class extends
        // value undefined" at boot -- same failure class root-caused for
        // AbstractEvent in ActionManagerFetcher.initServicesAsync; see the
        // comment there). applyBuffToCharacter/createCardToHand/
        // addCardToMasterDeck all enqueue onto ActionManager's action queue
        // rather than mutating synchronously, so queuing them from inside
        // this async callback (instead of synchronously in onCombatStart)
        // preserves ordering relative to the rest of combat start.
        import("../../statuses/curses/traumas/TraumaLibrary").then(({ TraumaLibrary }) => {
            const trauma = TraumaLibrary.getRandomTrauma();
            trauma.owningCharacter = owner;
            this.actionManager.createCardToHand(trauma);
            this.actionManager.addCardToMasterDeck(trauma);
        });

        // Lose 2 Strength (Lethality is the Strength-equivalent stat).
        this.actionManager.applyBuffToCharacter(owner, new Lethality(-2));

        this.actionManager.displaySubtitle(`${owner.name} breaks under the Stress and suffers a Trauma.`, 1500);
    }

}

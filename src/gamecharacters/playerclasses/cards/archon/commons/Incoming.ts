import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { TakeCover } from "../tokens/TakeCover";

export class Incoming extends PlayableCard {
    constructor() {
        super({
            name: "Incoming",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 2; // Number of Take Cover cards to add
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        for (let i = 0; i < this.getBaseMagicNumberAfterResourceScaling(); i++) {
            BasicProcs.getInstance().ManufactureCardToHand(new TakeCover().withOwner(this.owningCharacter!));
        }
    }

    override get description(): string {
        return `Add ${this.getDisplayedMagicNumber()} Take Cover to your hand.`;
    }
}

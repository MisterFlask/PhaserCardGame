import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { EldritchSmoke } from "../tokens/EldritchSmoke";

export class SorcerousDisplay extends PlayableCard {
    constructor() {
        super({
            name: "Sorcerous Display",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.baseMagicNumber = 2;
    }

    override get description(): string {
        return `Manufacture 2 Eldritch Smoke to your hand. Draw ${this.getDisplayedMagicNumber()} cards.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        for (let i = 0; i < this.getBaseMagicNumberAfterResourceScaling(); i++) {
            BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke());
        }
        
        this.actionManager.drawCards(this.getBaseMagicNumberAfterResourceScaling());
    }
}

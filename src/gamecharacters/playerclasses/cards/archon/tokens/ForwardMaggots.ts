import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { TemporaryLethality } from "../../../../buffs/standard/TemporaryLethality";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
export class ForwardMaggots extends PlayableCard {
    constructor() {
        super({
            name: "Forward Maggots",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.baseMagicNumber = 4;
    }

    override get description(): string {
        return `Grant ${this.getBaseMagicNumberAfterResourceScaling()} temporary strength to a character. Exhaust.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            this.actionManager.applyBuffToCharacter(targetCard as BaseCharacter, new TemporaryLethality(this.getBaseMagicNumberAfterResourceScaling()));
        }
        this.actionManager.exhaustCard(this);
    }
}

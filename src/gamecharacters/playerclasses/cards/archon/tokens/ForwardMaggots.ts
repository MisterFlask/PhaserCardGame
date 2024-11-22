import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { TemporaryStrengthBuff } from "../../../../buffs/standard/TemporaryStrengthBuff";

export class ForwardMaggots extends PlayableCard {
    constructor() {
        super({
            name: "Forward Maggots",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new TemporaryStrengthBuff(2));
    }

    override get description(): string {
        return `Grant 2 temporary strength to a character. Exhaust.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard) {
            this.actionManager.applyBuffToCharacter(targetCard as BaseCharacter, new TemporaryStrengthBuff(2));
        }
        this.actionManager.exhaustCard(this);
    }
}

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Painful } from "../../../../buffs/playable_card/Painful";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
export class ToughItOut extends PlayableCard {
    constructor() {
        super({
            name: "Tough It Out",
            cardType: CardType.SKILL,
            targetingType: TargetingType.ALLY,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 1;
        this.baseBlock = 13;
        this.buffs.push(new Painful(1)); // Starts with Painful(1) debuff
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
            this.actionManager.applyBuffToCard(this, new Painful(1)); 
        }
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} Block to target.  On play adds 1 more Painful stack.`;
    }
}

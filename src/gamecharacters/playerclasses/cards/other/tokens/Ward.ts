import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Ward extends PlayableCard {
    constructor() {
        super({
            name: "Ward",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseBlock = 4;
        this.baseEnergyCost = 0;
        this.buffs.push(new ExhaustBuff());
    }

    override get description(): string {
        return `Gain ${this.getDisplayedBlock()} block. Exhaust.`;
    }

    override InvokeCardEffects(target?: BaseCharacter): void {
        this.forEachAlly(ally => {
            if (ally) {
                this.applyBlockToTarget(ally);
            }
        });
    }
}

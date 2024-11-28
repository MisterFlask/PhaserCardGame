import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";

class IronWillBuff extends AbstractBuff {
    constructor() {
        super();
    }

    override getDisplayName(): string {
        return "Iron Will";
    }

    override getDescription(): string {
        return "For three turns, this character takes half damage.";
    }

    override getAdditionalPercentCombatDamageTakenModifier(): number {
        return -50
    }
}

export class IronWill extends PlayableCard {
    constructor() {
        super({
            name: "Iron Will",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.buffs.push(new ExhaustBuff());
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const owner = this.owner;

        if (owner) {
            // Owner gains 2 stress
            owner.stress += 2;

            // Apply Iron Will buff to the owner
            const ironWillBuff = new IronWillBuff();
            owner.buffs.push(ironWillBuff);
        }
    }

    override get description(): string {
        return `Owner gains 2 stress. For three turns, this character takes half damage.`;
    }
}

import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { AbstractBuff } from "../../../buffs/AbstractBuff";
import { RetainBuff } from "../../../buffs/playable_card/Retain";
import { EntityRarity, PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";


export class DisruptShielding extends PlayableCard {
    constructor() {
        super({
            name: "Avaunt!",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.id = "DISRUPT_SHIELDING";
        this.buffs.push(new RetainBuff())
    }

    override InvokeCardEffects(target: BaseCharacter): void {
    }
}

export class PlanarShielding extends AbstractBuff {
    constructor(damageReductionPercent: number = 50) {
        super();
        this.isDebuff = false;
        this.stacks = damageReductionPercent;
        this.secondaryStacks = 0; // Number of Disrupt Shielding cards played this turn
    }

    override getDisplayName(): string {
        return "Planar Shielding";
    }

    override getDescription(): string {
        return `Reduces damage taken by ${this.stacks}%. If Avaunt! is played in a turn, this effect is negated.`;
    }

    override onTurnStart(): void {
        this.secondaryStacks = 0; // Reset count of Disrupt Shielding cards played
    }

    override onAnyCardPlayedByAnyone(cardPlayed: PlayableCard): void {
        if (cardPlayed.id == "DISRUPT_SHIELDING") {
            this.secondaryStacks++;
        }
    }

    override getAdditionalPercentCombatDamageTakenModifier(): number {
        // Only reduce damage if one or fewer Disrupt Shielding cards have been played this turn
        if (this.secondaryStacks >= 1) {
            return -100;
        }
        return 0;
    }
}

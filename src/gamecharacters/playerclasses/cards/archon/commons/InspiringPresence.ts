import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { IncreasePluckPerTurn } from "../../../../buffs/standard/combatresource/IncreasePluckPerTurn";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class InspiringPresence extends PlayableCard {
    constructor() {
        super({
            name: "Inspiring Presence",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 1; // Amount of Pluck gained
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) {
            console.error("InspiringPresence was invoked without an owning character.");
            return;
        }
        // Gain Pluck
        this.actionManager.applyBuffToCharacter(this.owningCharacter!, new IncreasePluckPerTurn(this.   getBaseMagicNumberAfterResourceScaling()));
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Pluck each turn.`;
    }
}

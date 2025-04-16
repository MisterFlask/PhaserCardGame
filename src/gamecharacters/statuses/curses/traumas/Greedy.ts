/**
 * Hazardous (2).  Cost 0, lose 3 SIN.
 */
import { TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { Hazardous } from "../../../buffs/playable_card/Hazardous";

export class Greedy extends PlayableCard {
    constructor() {
        super({
            name: "Greedy",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new Hazardous(2));
        this.portraitName = "greedy-curse";
    }

    override get description(): string {
        return "Hazardous (2). Lose 3 SIN.";
    }

    override InvokeCardEffects(): void {
        // Decrease SIN by 3
        this.gameState.sovereignInfernalNotes -= 3;
    }
}
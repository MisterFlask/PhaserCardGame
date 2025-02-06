import { TargetingType } from "../AbstractCard";
import { EntityRarity } from "../EntityRarity";
import { PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { ExhaustBuff } from "../buffs/playable_card/ExhaustBuff";

export class Cigar extends PlayableCard {
    constructor() {
        super({
            name: "Cigar",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new ExhaustBuff());
    }

    override get description(): string {
        return "Gain 1 Smog, then take 1 damage for each Smog you have. Exhaust.";
    }

    override InvokeCardEffects(): void {
        // Gain 1 smog
        this.actionManager.modifySmog(1);

        // Take damage equal to smog count
        if (this.owningCharacter) {
            const currentSmog = this.gameState.combatState.combatResources.smog;
            this.actionManager.dealDamage({
                baseDamageAmount: currentSmog.value,
                target: this.owningCharacter,
                sourceCard: this
            });
        }
    }
}

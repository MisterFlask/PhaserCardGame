import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class EldritchMutter extends PlayableCard {
    constructor() {
        super({
            name: "Eldritch Mutter",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 5;
        this.baseBlock = 2;
        this.baseEnergyCost = 0;
        this.buffs.push(new ExhaustBuff());
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to a target. Gain ${this.getDisplayedBlock()} block to all allies. Gain 1 stress.`;
    }

    override InvokeCardEffects(target: BaseCharacter): void {
        if (!target) {
            return;
        }
        this.dealDamageToTarget(target);
        this.forEachAlly(ally => {
            if (ally) {
                this.applyBlockToTarget(ally);
            }
        });
    }
}

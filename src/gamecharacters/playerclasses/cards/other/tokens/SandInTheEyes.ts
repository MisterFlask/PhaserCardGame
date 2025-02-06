import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Weak } from "../../../../buffs/standard/Weak";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class SandInTheEyes extends PlayableCard {
    constructor() {
        super({
            name: "Sand in the Eyes",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 2;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply 1 Weak.`;
    }

    override InvokeCardEffects(target: BaseCharacter): void {
        if (!target) {
            return;
        }
        this.dealDamageToTarget(target);
        this.actionManager.applyBuffToCharacter(target, new Weak(1));
    }
}

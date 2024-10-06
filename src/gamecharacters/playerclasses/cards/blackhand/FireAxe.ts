import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { PlayableCard } from "../../../PlayableCard";

export class FireAxe extends PlayableCard {
    constructor() {
        super({
            name: "Fire Axe",
            description: `_`,
            portraitName: "fire-axe",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 6;
        this.energyCost = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage(this.hoveredCharacter)} damage. Double damage if the target is Smoldering.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            let damageAmount = this.baseDamage;
            if (targetCard.buffs.some(buff => buff instanceof Smoldering)) {
                damageAmount *= 2;
            }
            
            this.actionManager.dealDamage({
                baseDamageAmount: damageAmount,
                target: targetCard,
                sourceCharacter: this.owner!,
                fromAttack: true,
                sourceCard: this
            });
            
            console.log(`Dealt ${damageAmount} damage to ${targetCard.name}`);
        }
    }
}

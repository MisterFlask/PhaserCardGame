import { PlayableCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";

export class Shoot extends PlayableCard {
    constructor() {
        super({
            name: "Shoot",
            description: `_`,
            portraitName: "gun",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 6;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage(this.hoveredCharacter)} damage.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.baseDamage,
                target: targetCard,
                sourceCharacter: this.owner!,
                fromAttack: true,
                sourceCard: this
            });
            console.log(`Dealt ${this.getDisplayedDamage(targetCard)} damage to ${targetCard.name}`);
        }
    }
}

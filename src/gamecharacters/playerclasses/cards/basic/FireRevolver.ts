import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";

export class FireRevolver extends PlayableCard {

    constructor() {
        super({
            name: "Fire Revolver",
            description: `_`,
            portraitName: "gun",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 6;
        this.baseEnergyCost = 1;
        this.rarity = EntityRarity.BASIC;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
        }
    }
}

import { PlayableCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";

export class FlamePistol extends PlayableCard {
    constructor() {
        super({
            name: "Flame Pistol",
            description: `_`,
            portraitName: "flame-pistol",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 3;
        this.magicNumber = 1;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage(this.hoveredCharacter)} damage and apply ${this.magicNumber} Smoldering to the target.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.actionManager.applyBuffToCharacter(targetCard, new Smoldering(this.magicNumber));
        }
    }
}

import { GameState } from "../../../../rules/GameState";
import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Smoldering } from "../../../buffs/blackhand/Smoldering";
import { PlayableCard } from "../../../PlayableCard";

export class FlamePistol extends PlayableCard {
    constructor() {
        super({
            name: "Flame Pistol",
            description: `_`,
            portraitName: "fire-ray",
            targetingType: TargetingType.ENEMY,
        });
        this.baseDamage = 3;
        this.baseMagicNumber = 1;
        this.energyCost = 2;

        this.resourceScalings.push({
            resource: GameState.getInstance().combatState.combatResources.thunder,
            attackScaling: 1
        })
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Smoldering to the target.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.actionManager.applyBuffToCharacter(targetCard, new Smoldering(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
        }
    }
}

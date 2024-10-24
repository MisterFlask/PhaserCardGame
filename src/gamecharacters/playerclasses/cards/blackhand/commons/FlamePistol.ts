import { GameState } from "../../../../../rules/GameState";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class FlamePistol extends PlayableCard {
    constructor() {
        super({
            name: "Flame Pistol",
            description: `_`,
            portraitName: "fire-ray",
            targetingType: TargetingType.ENEMY,
            cardType: CardType.ATTACK,
        });
        this.baseDamage = 4;
        this.baseMagicNumber = 2;
        this.energyCost = 1;

        this.resourceScalings.push({
            resource: GameState.getInstance().combatState.combatResources.powder,
            attackScaling: 1
        })
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Burning to the target.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            this.actionManager.applyBuffToCharacter(targetCard, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
        }
    }
}

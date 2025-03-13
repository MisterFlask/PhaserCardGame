import { GameState } from "../../../../../rules/GameState";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Burning } from "../../../../buffs/standard/Burning";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class FlamePistol extends PlayableCard {
    constructor() {
        super({
            name: "Flame Revolver",
            description: `_`,
            portraitName: "fire-ray",
            targetingType: TargetingType.NO_TARGETING,
            cardType: CardType.ATTACK,
        });
        this.baseDamage = 4;
        this.baseMagicNumber = 1;
        this.baseEnergyCost = 1;

        this.resourceScalings.push({
            resource: GameState.getInstance().combatState.combatResources.smog,
            magicNumberScaling: 1
        })
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage and apply ${this.getDisplayedMagicNumber()} Burning to up to two random enemies.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        const enemies = this.combatState.enemies.filter(e => !e.isDead);
        const targets = enemies.sort(() => Math.random() - 0.5).slice(0, 2);

        for (const enemy of targets){
            this.dealDamageToTarget(enemy);
            this.actionManager.applyBuffToCharacterOrCard(enemy, new Burning(this.getBaseMagicNumberAfterResourceScaling()), this.owningCharacter as BaseCharacter);
        }
    }
}

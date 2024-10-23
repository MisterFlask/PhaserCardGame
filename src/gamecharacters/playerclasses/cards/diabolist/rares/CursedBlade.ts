import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";

class WeThirstBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        
    }

    override getName(): string {
        return "WE THIRST";
    }

    override getDescription(): string {
        return `At end of combat, take ${this.getStacksDisplayText()} damage.`;
    }

    override onLethal(target: BaseCharacter | null): void {
        this.stacks = 0;
    }

    /// concept: each combat start, this will already exist on the playable card.  We need to apply it to the character who owns it.
    override onCombatStart(){
        const owner = this.getOwnerAsCharacter();
        if (owner){
            this.actionManager.applyBuffToCharacter(owner, new WeThirstBuff(this.stacks));
        }
    }

    override onCombatEnd(){
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                target: owner,
                fromAttack: false
            });
        }
        this.stacks = 0;
    }
}

export class CursedBlade extends PlayableCard {
    constructor() {
        super({
            name: "Cursed Blade",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 1;
        this.baseDamage = 14;
        this.resourceScalings.push({
            resource: this.iron,
            attackScaling: 1,
        });
        this.buffs.push(new WeThirstBuff(4));
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage. On combat start, gain 10 "WE THIRST".`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const target = targetCard as BaseCharacter;
        if (!target) return;

        this.dealDamageToTarget(target);
    }

    override onAcquisition(newOwner: BaseCharacter): void {
        const gameState = GameState.getInstance();
       
    }
}

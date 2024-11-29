import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";

class IllFatedBladeBuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Cursed Blade";
    }

    override getDescription(): string {
        return `On combat start, apply ${this.getStacksDisplayText()} We Thirst to owner.  If this card kills someone, remove We Thirst.`;
    }

    override onCombatStart() {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new WeThirstDebuff(this.stacks));
        }
    }

    override onFatal(killedUnit: BaseCharacter): void {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.removeBuffFromCharacter(owner, "We Thirst");
        }
    }
}

class WeThirstDebuff extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "We Thirst";
    }

    override getDescription(): string {
        return `At end of combat, take ${this.getStacksDisplayText()} damage.`;
    }

    override onCombatEnd() {
        const owner = this.getOwnerAsCharacter();
        if (owner) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                target: owner,
                fromAttack: false,
                ignoresBlock: true
            });
        }
    }
}

export class IllFatedBlade extends PlayableCard {
    constructor() {
        super({
            name: "Cursed Blade",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 14;
        this.resourceScalings.push({
            resource: this.mettle,
            attackScaling: 1,
        });
        this.buffs.push(new IllFatedBladeBuff(10));
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const target = targetCard as BaseCharacter;
        if (!target) return;

        this.dealDamageToTarget(target);
    }
}

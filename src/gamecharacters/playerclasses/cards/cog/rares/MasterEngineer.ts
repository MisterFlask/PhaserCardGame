// Manufactured cards do 5 greater damage and provide 3 greater block.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";

class ManufacturedEnhancementBuff extends AbstractBuff {
    constructor(damageBonus: number = 5, blockBonus: number = 3) {
        super();
        this.stacks = damageBonus;
        this.secondaryStacks = blockBonus;
        this.showSecondaryStacks = true;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Manufactured Enhancement";
    }

    override getDescription(): string {
        return `Manufactured cards do ${this.stacks} greater damage and provide ${this.secondaryStacks} greater block.`;
    }

    override getCombatDamageDealtModifier(target?: BaseCharacter, cardPlayed?: PlayableCard): number {
        if (cardPlayed?.wasManufactured()) {
            return this.stacks;
        }
        return 0;
    }

    override getBlockSentModifier(): number {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard?.wasManufactured()) {
            return this.secondaryStacks;
        }
        return 0;
    }
}

export class MasterEngineer extends PlayableCard {
    constructor() {
        super({
            name: "Master Engineer",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 2;
    }

    override get description(): string {
        return "Manufactured cards do 5 greater damage and provide 3 greater block.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;
        
        this.actionManager.applyBuffToCharacterOrCard(
            this.owningCharacter,
            new ManufacturedEnhancementBuff()
        );
    }
}

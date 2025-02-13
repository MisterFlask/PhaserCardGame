// Cost 1.  Draw a card.  Whenever you play a Power card, deal 15 damage to ALL enemies.  This is a power.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

class PowerCoreBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Power Core";
    }

    override getDescription(): string {
        return "Whenever you play a Power card, deal 15 damage to ALL enemies.";
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        if (playedCard.cardType === CardType.POWER && playedCard.owningCharacter === owner) {
            this.forEachEnemy(enemy => {
                this.actionManager.dealDamage({
                    baseDamageAmount: 15,
                    target: enemy,
                    sourceCharacter: owner,
                    fromAttack: false
                });
            });
        }
    }
}

export class PowerCore extends PlayableCard {
    constructor() {
        super({
            name: "Power Core",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return "Draw a card. Whenever you play a Power card, deal 15 damage to ALL enemies.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        // Draw a card
        this.actionManager.drawCards(1);
        
        // Apply the buff that triggers on Power card plays
        this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter, new PowerCoreBuff());
    }
}



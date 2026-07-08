// Cost 2.  Power.  At the start of your turn, Manufacture a Rivet into your hand.

import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { Rivet } from "../tokens/Rivet";

class ProductionQuotaBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Production Quota";
    }

    override getDescription(): string {
        return "At the start of your turn, Manufacture a Rivet into your hand.";
    }

    override onTurnStart(): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;
        BasicProcs.getInstance().ManufactureCardToHand(new Rivet().withOwner(owner));
    }
}

export class ProductionQuota extends PlayableCard {
    constructor() {
        super({
            name: "Production Quota",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
            portraitName: "production-quota-card-art",
        });
        this.baseEnergyCost = 2;
        this.flavorText = "The line does not stop for lunch, injury, or the sound of screaming.";
    }

    override get description(): string {
        return "At the start of your turn, Manufacture a Rivet into your hand.";
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) return;

        this.actionManager.applyBuffToCharacterOrCard(
            this.owningCharacter,
            new ProductionQuotaBuff()
        );
    }
}

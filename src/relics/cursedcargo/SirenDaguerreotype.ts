import { TargetingType } from "../../gamecharacters/AbstractCard";
import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { CardType } from "../../gamecharacters/Primitives";
import { AbstractBuff } from "../../gamecharacters/buffs/AbstractBuff";
import { Stress } from "../../gamecharacters/buffs/standard/Stress";

class SirenDaguerreotypeBuff extends AbstractBuff {
    constructor() {
        super();
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Siren Daguerreotype";
    }

    override getDescription(): string {
        return "Retained: all characters take 1 Stress.";
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (!ownerCard) return;

        ownerCard.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacter(ally, new Stress(1));
        });
    }

    override onCombatStart(): void {
        this.forEachAlly(ally => {
            this.actionManager.applyBuffToCharacter(ally, new Stress(-1));
        });
    }

}

export class SirenDaguerreotype extends PlayableCard {
    constructor() {
        super({
            name: "Siren Daguerreotype",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 2;
        this.buffs.push(new SirenDaguerreotypeBuff());
    }

    override get description(): string {
        return `All allies heal 1 stress before combat.`;
    }
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        // Intentionally left blank, as the effect happens on combat start and on retain.
    }
}

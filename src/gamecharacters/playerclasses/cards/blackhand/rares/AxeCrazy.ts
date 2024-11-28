import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class AxeCrazy extends PlayableCard {
    constructor() {
        super({
            name: "Axe Crazy",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Whenever you play a card with "Axe" in its name, gain 2 Blood.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.actionManager.applyBuffToCharacterOrCard(this.owningCharacter!, new AxeCrazyBuff(1));
    }
}

class AxeCrazyBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.stacks = stacks;
        this.imageName = "axe-crazy";
    }

    override getDisplayName(): string {
        return "Axe Crazy";
    }

    override getDescription(): string {
        return `Whenever you play a card with "Axe" in its name, gain 2 Blood.`;
    }

    override onAnyCardPlayedByAnyone(card: AbstractCard): void {
        if (card.owningCharacter !== this.getOwnerAsCharacter()) return;
        if (card.name.toLowerCase().includes("axe")) {
            GameState.getInstance().combatState.combatResources.modifyBlood(2);
        }
    }
}

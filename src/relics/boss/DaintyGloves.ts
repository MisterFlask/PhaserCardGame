import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class DaintyGloves extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.BOSS;
    }

    override getDisplayName(): string {
        return "Dainty Gloves";
    }

    override getDescription(): string {
        return "Whenever you exhaust a card, gain 1 Ashes.";
    }

    override onAnyCardExhausted(card: PlayableCard): void {
        this.combatState.combatResources.modifyAshes(1);
    }
}
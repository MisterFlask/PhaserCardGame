import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class DaintyGloves extends AbstractRelic {
    constructor() {
        super();
        this.name = "Dainty Gloves";
        this.description = "Whenever you exhaust a card, gain 1 Ashes.";
        this.rarity = EntityRarity.BOSS;
    }

    override onCardExhausted(card: PlayableCard): void {
        this.combatState.combatResources.modifyAshes(1);
    }
}
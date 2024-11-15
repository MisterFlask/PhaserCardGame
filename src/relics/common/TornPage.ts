import { CardRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class TornPage extends AbstractRelic {
    constructor() {
        super();
        this.name = "Torn Page";
        this.description = "At the start of combat, increase your Pages by 2.";
        this.rarity = CardRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyPages(2);
    }
}

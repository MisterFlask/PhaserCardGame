import { CardRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class IronFilings extends AbstractRelic {
    constructor() {
        super();
        this.name = "Iron Filings";
        this.description = "At the start of combat, increase your Iron by 2.";
        this.tier = CardRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyIron(2);
    }
}

import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class IronFilings extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    getDisplayName(): string {
        return "Iron Filings";
    }

    getDescription(): string {
        return "At the start of combat, increase your Mettle by 2.";
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyMettle(2);
    }
}

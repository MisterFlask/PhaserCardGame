import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class TornPage extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    getDisplayName(): string {
        return "Torn Page";
    }

    getDescription(): string {
        return "At the start of combat, increase your Pages by 2.";
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyAshes(2);
    }
}

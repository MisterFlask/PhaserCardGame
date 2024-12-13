import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class FrozenDew extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    getDisplayName(): string {
        return "Frozen Dew";
    }

    getDescription(): string {
        return "At the start of combat, increase your Pluck by 2.";
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyPluck(2);
    }
}

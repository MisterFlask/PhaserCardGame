import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class MistBottle extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    getDisplayName(): string {
        return "Bottle of Fine London Mist";
    }

    getDescription(): string {
        return "At the start of combat, increase your Smog by 2.";
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifySmog(2);
    }
}

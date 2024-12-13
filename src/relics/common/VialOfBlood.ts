import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class VialOfBlood extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    getDisplayName(): string {
        return "Vial of Blood";
    }

    getDescription(): string {
        return "At the start of combat, increase your Blood by 2.";
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyBlood(2);
    }
}

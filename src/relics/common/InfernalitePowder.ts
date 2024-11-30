import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class VialOfBlood extends AbstractRelic {
    constructor() {
        super();
        this.name = "Vial of Blood";
        this.description = "At the start of combat, increase your Powder by 2.";
        this.rarity = EntityRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyBlood(2);
    }
}

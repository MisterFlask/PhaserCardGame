import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class MistBottle extends AbstractRelic {
    constructor() {
        super();
        this.name = "Bottle of Fine London Mist";
        this.description = "At the start of combat, increase your Smog by 2.";
        this.rarity = EntityRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifySmog(2);
    }
}

import { CardRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class MistBottle extends AbstractRelic {
    constructor() {
        super();
        this.name = "Bottle of London Mist";
        this.description = "At the start of combat, increase your Fog by 2.";
        this.tier = CardRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyFog(2);
    }
}

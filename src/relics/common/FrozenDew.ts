import { CardRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class FrozenDew extends AbstractRelic {
    constructor() {
        super();
        this.name = "Frozen Dew";
        this.description = "At the start of combat, increase your Pluck by 2.";
        this.tier = CardRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyPluck(2);
    }
}

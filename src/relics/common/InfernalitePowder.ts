import { CardRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class InfernalitePowder extends AbstractRelic {
    constructor() {
        super();
        this.name = "Infernalite Powder";
        this.description = "At the start of combat, increase your Powder by 2.";
        this.rarity = CardRarity.COMMON;
    }

    onCombatStart(): void {
        this.combatState.combatResources.modifyPowder(2);
    }
}

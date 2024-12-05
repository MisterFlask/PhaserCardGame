import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class FancyHat extends AbstractRelic {
    constructor() {
        super();
        this.name = "Fancy Hat";
        this.description = "At the start of combat, gain 3 Venture.";
        this.rarity = EntityRarity.BOSS;
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyVenture(3);
    }
}

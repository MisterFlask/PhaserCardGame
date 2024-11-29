import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";
export class BasicEnergyRelic extends AbstractRelic {
    constructor() {
        super();
        this.name = "Basic Energy Relic";
        this.description = "At the start of combat, gain 1 additional Energy.";
        this.rarity = EntityRarity.BOSS;
    }

    override onCombatStart(): void {
        this.actionManager.modifyMaxEnergy(1);
    }
}

import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";
export class BasicEnergyRelic extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.BOSS;
    }

    override getDisplayName(): string {
        return "Basic Energy Relic";
    }

    override getDescription(): string {
        return "At the start of combat, gain 1 additional Energy.";
    }

    override passivePerTurnEnergyModifier(): number {
        return 1;
    }
}

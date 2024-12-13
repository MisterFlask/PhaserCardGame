import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class FancyHat extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.BOSS;
    }

    override getDisplayName(): string {
        return "Fancy Hat";
    }

    override getDescription(): string {
        return "At the start of combat, gain 3 Venture.";
    }

    override onCombatStart(): void {
        this.combatState.combatResources.modifyVenture(3);
    }
}

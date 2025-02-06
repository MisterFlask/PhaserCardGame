import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { GameState } from "../../rules/GameState";
import { AbstractRelic } from "../AbstractRelic";

export class BurningAntlers extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.BOSS;
    }

    override getDisplayName(): string {
        return "Burning Antlers";
    }

    override getDescription(): string {
        return "At the beginning of each turn, subtract one of a random combat resource and gain 1 energy.";
    }

    override onTurnStart(): void {
        const gameState = GameState.getInstance();
        const resources = gameState.combatState.combatResources.resources();
        
        // Filter out resources with value > 0
        const availableResources = resources.filter(resource => resource.value > 0);
        
        if (availableResources.length > 0) {
            // Select a random resource
            const randomResource = availableResources[Math.floor(Math.random() * availableResources.length)];
            
            // Subtract 1 from the selected resource
            randomResource.value -= 1;

            // Gain 1 energy
            this.actionManager.modifyEnergy(1);
        }
    }
}

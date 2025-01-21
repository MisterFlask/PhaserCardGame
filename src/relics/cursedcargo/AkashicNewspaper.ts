import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class DissonantMonument extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    override getDisplayName(): string {
        return "Dissonant Monument";
    }

    override getDescription(): string {
        return "At the end of combat, if you have fewer than 5 Ash, lose 20 Denarians.";
    }

    override onCombatEnd(): void {
        if (this.combatResources.ashes.value < 5) {
            this.gameState.hellCurrency -= 20;
        }
    }

  
}


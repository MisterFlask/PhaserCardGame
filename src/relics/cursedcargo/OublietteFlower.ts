import { Bastion } from "../../gamecharacters/buffs/persona/Bastion";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { AbstractRelic } from "../AbstractRelic";

export class OublietteFlower extends AbstractRelic {

    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    getDisplayName(): string {
        return "Oubliette Flower";
    }

    getDescription(): string {
        return "Every 20 cards played, all allies lose 1 Bastion. (Persists between combats)";
    }

    onAnyCardPlayedByAnyone(): void {
        this.stacks++;
        
        if (this.stacks >= 20) {
            this.stacks = 0;
            
            this.forEachAlly((ally) => {
                this.actionManager.applyBuffToCharacterOrCard(ally, new Bastion(-1));
            });
        }
    }

    getDetailedDescription(): string {
        return `Every 20 cards played, all allies lose 1 Bastion. (Persists between combats)\n\nCards played: ${this.stacks}/20`;
    }
}

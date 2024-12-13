import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { LocationCard } from "../../maplogic/LocationCard";
import { AbstractRelic } from "../AbstractRelic";

export class BaitedHook extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.BOSS;
    }

    override getDisplayName(): string {
        return "Baited Hook";
    }

    override getDescription(): string {
        return "Gain 1 Energy at the start of each turn. All future treasure chests are mimics.";
    }

    override passivePerTurnEnergyModifier(): number {
        return 1;
    }

    override onLocationEntered(location: LocationCard): void {
        /// TODO
    }
}

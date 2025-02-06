import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { LocationCard, RestSiteCard } from "../../maplogic/LocationCard";
import { AbstractRelic } from "../AbstractRelic";

export class HopeCandle extends AbstractRelic {
    private readonly BASE_STRESS_RELIEF = 1;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }
    
    getDisplayName(): string {
        return "Hope Candle";
    }

    getDescription(): string {
        return `At rest sites, decrease your Stress by ${this.BASE_STRESS_RELIEF * this.stacks}.`;
    }

    onLocationEntered(location: LocationCard): void {
        if (location instanceof RestSiteCard) {
            for (const character of this.gameState.combatState.playerCharacters) {
                this.actionManager.relieveStressFromCharacter(character, this.BASE_STRESS_RELIEF * this.stacks);
            }
        }
    }
}

import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { LocationCard, RestSiteCard } from "../../maplogic/LocationCard";
import { AbstractRelic } from "../AbstractRelic";

export class HopeCandle extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }
    
    getDisplayName(): string {
        return "Hope Candle";
    }

    getDescription(): string {
        return "At rest sites, decrease your Stress by 1.";
    }


    onLocationEntered(location: LocationCard): void {
        if (location instanceof RestSiteCard) {
            for (const character of this.gameState.combatState.playerCharacters) {
                this.actionManager.relieveStressFromCharacter(character, 1);
            }
        }
    }
}

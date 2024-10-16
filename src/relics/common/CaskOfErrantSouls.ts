import { CardRarity } from "../../gamecharacters/PlayableCard";
import { LocationCard, RestSiteCard } from "../../maplogic/LocationCard";
import { AbstractRelic } from "../AbstractRelic";
export class CaskOfErrantSouls extends AbstractRelic {
    constructor() {
        super();
        this.name = "Cask of Errant Souls";
        this.description = "Each time you enter a rest site, gain 10 Hell Currency.";
        this.tier = CardRarity.COMMON;
    }

    override onLocationEntered(location: LocationCard): void {
        if (location instanceof RestSiteCard) {
            this.gameState.hellCurrency += 10;
            console.log("Gained 10 Hell Currency from Cask of Errant Souls.");
        }
    }
}

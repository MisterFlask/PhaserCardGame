import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { LocationCard, RestSiteCard } from "../../maplogic/LocationCard";
import { AbstractRelic } from "../AbstractRelic";

export class CaskOfErrantSouls extends AbstractRelic {
    private readonly BASE_CURRENCY = 10;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    override getDisplayName(): string {
        return "Cask of Errant Souls";
    }

    override getDescription(): string {
        return `Each time you enter a rest site, gain ${this.BASE_CURRENCY * this.stacks} Hell Currency.`;
    }

    override onLocationEntered(location: LocationCard): void {
        if (location instanceof RestSiteCard) {
            this.gameState.sovereignInfernalNotes += this.BASE_CURRENCY * this.stacks;
            console.log(`Gained ${this.BASE_CURRENCY * this.stacks} Hell Currency from Cask of Errant Souls.`);
        }
    }
}

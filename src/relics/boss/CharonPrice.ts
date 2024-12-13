import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class CharonPrice extends AbstractRelic {
    private readonly PRICE = 100; // The price Charon demands

    constructor() {
        super();
        this.rarity = EntityRarity.BOSS;
    }

    override getDisplayName(): string {
        return "Charon's Price";
    }

    override getDescription(): string {
        return `At the end of your run, you must pay ${this.PRICE} Hell Currency or face Charon's wrath.`;
    }
}

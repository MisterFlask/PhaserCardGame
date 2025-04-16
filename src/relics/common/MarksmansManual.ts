import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class MarksmansManual extends AbstractRelic {
    private readonly BASE_DAMAGE = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Marksman's Manual";
    }

    getDescription(): string {
        return `Revolver cards deal ${this.BASE_DAMAGE * this.stacks} more damage.`;
    }

    public getCombatDamageDealtModifier(target: BaseCharacter, card: PlayableCard): number {
        if (card.name.toLowerCase().includes("revolver")) {
            return this.BASE_DAMAGE * this.stacks;
        }
        return 0;
    }
}

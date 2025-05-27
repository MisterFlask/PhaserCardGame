import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../AbstractRelic";

export class BelphegorsRounds extends AbstractRelic {
    private readonly BONUS_DAMAGE = 2;

    constructor(stacks: number = 1) {
        super();
        this.rarity = EntityRarity.UNCOMMON;
        this.stackable = true;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Belphegor's Rounds";
    }

    override getDescription(): string {
        return `Revolver cards deal ${this.BONUS_DAMAGE * this.stacks} more damage.`;
    }

    override getCombatDamageDealtModifier(target: BaseCharacter, card: PlayableCard): number {
        if (card.name.toLowerCase().includes("revolver")) {
            return this.BONUS_DAMAGE * this.stacks;
        }
        return 0;
    }
}

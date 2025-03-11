import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { FireRevolver } from "../../gamecharacters/playerclasses/cards/basic/FireRevolver";
import { AbstractRelic } from "../AbstractRelic";

export class Catspaw extends AbstractRelic {
    private readonly BASE_DAMAGE = 2;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    getDisplayName(): string {
        return "Catspaw";
    }

    getDescription(): string {
        return `Shoot cards deal ${this.BASE_DAMAGE * this.stacks} more damage.`;
    }

    public getCombatDamageDealtModifier(target: BaseCharacter, card: PlayableCard): number {
        if (card instanceof FireRevolver) {
            return this.BASE_DAMAGE * this.stacks;
        }
        return 0;
    }
}

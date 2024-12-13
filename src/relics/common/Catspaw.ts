import { BaseCharacter } from "../../gamecharacters/BaseCharacter";
import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { Shoot } from "../../gamecharacters/playerclasses/cards/basic/Shoot";
import { AbstractRelic } from "../AbstractRelic";

export class Catspaw extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
    }

    getDisplayName(): string {
        return "Catspaw";
    }

    getDescription(): string {
        return "Shoot cards deal 2 more damage.";
    }

    public getCombatDamageDealtModifier(target: BaseCharacter, card: PlayableCard): number {
        if (card instanceof Shoot) {
            return 2;
        }
        return 0;
    }
}

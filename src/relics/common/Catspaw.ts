import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { Shoot } from "../../gamecharacters/playerclasses/cards/basic/Shoot";
import { AbstractRelic, DamageModifier } from "../AbstractRelic";

export class Catspaw extends AbstractRelic {
    constructor() {
        super();
        this.name = "Catspaw";
        this.description = "Shoot cards deal 2 more damage.";
        this.rarity = EntityRarity.COMMON;
    }

    public damageModifierOnCardPlayed(card: PlayableCard): DamageModifier {
        if (card instanceof Shoot) {
            return new DamageModifier({flatDamageMod: 2});
        }
        return new DamageModifier();
    }
}

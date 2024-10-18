import { CardRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { AbstractRelic, DamageModifier } from "../AbstractRelic";

export class Catspaw extends AbstractRelic {
    constructor() {
        super();
        this.name = "Catspaw";
        this.description = "Shoot cards deal 2 more damage.";
        this.tier = CardRarity.COMMON;
    }

    public damageModifierOnCardPlayed(card: PlayableCard): DamageModifier {
        if (card.name === "Shoot") {
            return new DamageModifier({flatDamageMod: 2});
        }
        return new DamageModifier();
    }
}

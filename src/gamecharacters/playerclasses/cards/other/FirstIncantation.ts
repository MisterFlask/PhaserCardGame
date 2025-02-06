import { PileName } from "../../../../rules/DeckLogicHelper";
import { AbstractCard, TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";

export class FirstIncantation extends PlayableCard {
    constructor() {
        super({
            name: "First Incantation",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(): void {
        this.actionManager.moveCardToPile(new SecondIncantation(), PileName.Draw);
    }

    override get description(): string {
        return `Add a Second Incantation to your draw pile.`;
    }
}

export class SecondIncantation extends PlayableCard {
    constructor() {
        super({
            name: "Second Incantation",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(): void {
        this.actionManager.moveCardToPile(new ThirdIncantation(), PileName.Draw);
    }

    override get description(): string {
        return `Add a Third Incantation to your draw pile.`;
    }
}

export class ThirdIncantation extends PlayableCard {
    constructor() {
        super({
            name: "Third Incantation",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(): void {
        this.actionManager.moveCardToPile(new FourthIncantation(), PileName.Draw);
    }

    override get description(): string {
        return `Add a Fourth Incantation to your draw pile.`;
    }
}

export class FourthIncantation extends PlayableCard {
    constructor() {
        super({
            name: "Fourth Incantation",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.baseDamage = 999;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.dealDamageToTarget(targetCard as BaseCharacter);
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage.`;
    }
}

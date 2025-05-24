import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { Ethereal } from "../../../../buffs/playable_card/Ethereal";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class WarmYourself extends PlayableCard {
    constructor() {
        super({
            name: "Warm Yourself",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 2;
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new Ethereal());
    }

    override get description(): string {
        return "Remove all Frostbite from yourself. Exhaust.";
    }

    override InvokeCardEffects(_target?: BaseCharacter): void {
        const owner = this.owningCharacter;
        if (owner) {
            this.actionManager.removeBuffFromCharacter(owner, "Frostbite");
        }
    }
}

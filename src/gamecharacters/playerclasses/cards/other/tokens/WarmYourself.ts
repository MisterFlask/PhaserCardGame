import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { Transient } from "../../../../buffs/playable_card/Transient";
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
        this.buffs.push(new Transient());
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

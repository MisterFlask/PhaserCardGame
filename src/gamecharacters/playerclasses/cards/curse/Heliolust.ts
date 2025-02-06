import { TargetingType } from "../../../AbstractCard";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { AbstractBuff } from "../../../buffs/AbstractBuff";
import { ExhaustBuff } from "../../../buffs/playable_card/ExhaustBuff";
import { Transient } from "../../../buffs/playable_card/Transient";
import { Burning } from "../../../buffs/standard/Burning";
import { Stress } from "../../../buffs/standard/Stress";

class StressOnRetainBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Stress on Retain";
    }

    override getDescription(): string {
        return "When this card is retained, gain 1 Stress.";
    }

    override onInHandAtEndOfTurn(): void {
        const owner = this.getCardOwner();
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Stress(1), owner);
        }
    }
}

export class Heliolust extends PlayableCard {
    constructor() {
        super({
            name: "Heliolust",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.MENACE,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new Transient());
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new StressOnRetainBuff());
    }

    override get description(): string {
        return "Apply 3 Burning to yourself. Exhaust. Retained: Gain 1 Stress.";
    }

    override InvokeCardEffects(): void {
        const owner = this.owningCharacter;
        if (owner) {
            this.actionManager.applyBuffToCharacterOrCard(owner, new Burning(3), owner);
        }
    }
}

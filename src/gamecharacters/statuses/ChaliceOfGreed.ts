import { TargetingType } from "../AbstractCard";
import { EntityRarity, PlayableCard } from "../PlayableCard";
import { CardType } from "../Primitives";
import { AbstractBuff } from "../buffs/AbstractBuff";
import { ExhaustBuff } from "../buffs/playable_card/ExhaustBuff";

// Define the energy loss buff
class LoseEnergyNextTurnBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Less Energy Next Turn";
    }

    override getDescription(): string {
        return "Lose 1 Energy next turn.";
    }

    override onTurnStart(): void {
        this.actionManager.modifyEnergy(-1 * this.stacks);
        this.stacks = 0; // Remove the buff after it triggers
    }
}

export class ChaliceOfGreed extends PlayableCard {
    constructor() {
        super({
            name: "Chalice of Greed",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new LoseEnergyNextTurnBuff());
        this.buffs.push(new ExhaustBuff());
    }

    override get description(): string {
        return "Gain 4 Hell Currency.";
    }

    override InvokeCardEffects(): void {
        this.actionManager.modifyDenarians(4);
        if (this.owningCharacter) {
            this.actionManager.applyBuffToCharacter(this.owningCharacter, new LoseEnergyNextTurnBuff());
        }
    }
}

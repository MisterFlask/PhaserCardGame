import { AbstractCombatEvent } from "../../../../../rules/AbstractCombatEvent";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { SacrificeEvent } from "../../../../procs/BasicProcs";

export class BloodSacrifistBuff extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "blood_drop";  // assuming we have this icon
        this.stackable = true;
        this.isDebuff = false;
    }

    getDisplayName(): string {
        return "Blood Sacrifist";
    }

    getDescription(): string {
        return `Whenever a card is sacrificed, gain ${this.getStacksDisplayText()} Blood.`;
    }

    onCombatEvent(event: AbstractCombatEvent): void {
        if (event instanceof SacrificeEvent) {
            const owner = this.getCardOwner();
            if (owner) {
                this.actionManager.modifyBlood(this.stacks);
                this.pulseBuff();
            }
        }
    }

}

export class ExpertOccultist extends PlayableCard {
    constructor() {
        super({
            name: "Expert Occultist",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 1; // Amount of Blood gained per sacrifice
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (!this.owningCharacter) {
            console.error("ExpertOccultist was played without an owner");
            return;
        }
        this.actionManager.applyBuffToCharacter(
            this.owningCharacter,
            new BloodSacrifistBuff()
        );
    }

    override get description(): string {
        return `Whenever a card is sacrificed, gain ${this.getDisplayedMagicNumber()} Blood.`;
    }

} 
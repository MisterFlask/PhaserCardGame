import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { SacrificeBuff } from "../../../../buffs/standard/SacrificeBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { EldritchSmoke } from "../tokens/EldritchSmoke";

export class UnnaturalVigor extends PlayableCard {
    constructor() {
        super({
            name: "Unnatural Vigor",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 1;
        this.baseMagicNumber = 2;
        this.buffs.push(new SacrificeBuff());
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Venture.  Manufacture an Eldritch Smoke to your hand.`; 
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        this.actionManager.modifyVenture(this.getBaseMagicNumberAfterResourceScaling());
        BasicProcs.getInstance().ManufactureCardToHand(new EldritchSmoke());
    }
}

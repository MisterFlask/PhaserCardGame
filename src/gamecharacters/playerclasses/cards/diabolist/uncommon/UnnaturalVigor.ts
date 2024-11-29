import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { SacrificeBuff } from "../../../../buffs/standard/SacrificeBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

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
        return `Gain ${this.getDisplayedMagicNumber()} Blood.`; 
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        this.actionManager.modifyBlood(this.getBaseMagicNumberAfterResourceScaling());
    }
}

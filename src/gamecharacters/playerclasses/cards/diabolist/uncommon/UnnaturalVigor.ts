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
        this.baseEnergyCost = 2;
        this.baseMagicNumber = 2; // Iron
        this.buffs.push(new SacrificeBuff());
    }

    override get description(): string {
        return `Gain ${this.getDisplayedMagicNumber()} Iron.`; 
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        this.actionManager.modifyIron(this.getBaseMagicNumberAfterResourceScaling());
    }

    override OnPurchase(): void {
        // Logic for when the card is purchased, if needed
    }
}

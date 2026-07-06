import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { BloodPriceBuff } from "../gamecharacters/buffs/standard/Bloodprice";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class BloodlettingKit extends AbstractConsumable {
    private bloodpriceAmount: number = 2;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING; // Not directly usable
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 200;
        this.uses = 1;
        this.tint = 0xFF0000; // Red tint for blood theme
    }

    override getDisplayName(): string {
        return "Bloodletting Kit";
    }

    override getDescription(): string {
        return `All cards in hand gain Bloodprice (${this.bloodpriceAmount}).`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Lancet, tourniquet, and a small brass bowl. The manual calls it "encouraging the merchandise."[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Bloodletting Kit", () => {
            gameState.combatState.currentHand.forEach((card: PlayableCard) => {
                // Only add Bloodprice if the card doesn't already have it
                if (!card.buffs.some((buff: AbstractBuff) => buff instanceof BloodPriceBuff)) {
                    this.actionManager.applyBuffToCharacterOrCard(card, new BloodPriceBuff(this.bloodpriceAmount));
                }
            });
        });
        return true;
    }

    override onPurchase(): void {
        console.log("Bloodletting Kit purchased!");
    }
}
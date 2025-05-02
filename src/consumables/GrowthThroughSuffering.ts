import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractBuff } from "../gamecharacters/buffs/AbstractBuff";
import { Painful } from "../gamecharacters/buffs/playable_card/Painful";
import { GrowingPowerBuff } from "../gamecharacters/buffs/standard/GrowingPower";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { PlayableCard } from "../gamecharacters/PlayableCard";
import { GameState } from "../rules/GameState";
import { AbstractConsumable } from "./AbstractConsumable";

export class GrowthThroughSuffering extends AbstractConsumable {
    private growingPowerAmount: number = 1;
    private painfulAmount: number = 2;

    constructor() {
        super();
        this.targetingType = TargetingType.NO_TARGETING; // Not directly usable
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 200;
        this.uses = 1;
        this.tint = 0x800080; // Purple tint for growth and suffering theme
    }

    override getDisplayName(): string {
        return "Form 9-f: Growth Through Suffering";
    }

    override getDescription(): string {
        return `All cards in hand gain Growing Power (${this.growingPowerAmount}) and Painful (${this.painfulAmount}).`;
    }

    override onUse(target: BaseCharacter): boolean {
        const gameState = GameState.getInstance();
        this.actionManager.DoAThing("Apply Growth Through Suffering", () => {
            gameState.combatState.currentHand.forEach((card: PlayableCard) => {
                // Only add Growing Power if the card doesn't already have it
                if (!card.buffs.some((buff: AbstractBuff) => buff instanceof GrowingPowerBuff)) {
                    this.actionManager.applyBuffToCharacterOrCard(card, new GrowingPowerBuff(this.growingPowerAmount));
                }
                // Only add Painful if the card doesn't already have it
                if (!card.buffs.some((buff: AbstractBuff) => buff instanceof Painful)) {
                    this.actionManager.applyBuffToCharacterOrCard(card, new Painful(this.painfulAmount));
                }
            });
        });
        return true;
    }

    override onPurchase(): void {
        console.log("Growth Through Suffering purchased!");
    }
} 
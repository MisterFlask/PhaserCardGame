import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class StokersTonic extends AbstractConsumable {
    private lethalityAmount: number = 2;

    constructor() {
        super();
        this.targetingType = TargetingType.ALLY;
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 175;
        this.uses = 1;
        this.tint = 0xFF00FF; // Purple tint for lethality
    }

    override getDisplayName(): string {
        return "Stoker's Tonic";
    }

    override getDescription(): string {
        return `Gain ${this.lethalityAmount} Lethality this turn.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]Furnace-brewed, unlabeled, and off the books. Tastes of brimstone and bad decisions.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Stoker's Tonic", () => {
            this.actionManager.applyBuffToCharacterOrCard(target, new Lethality(this.lethalityAmount));
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Stoker's Tonic purchased!");
    }
}
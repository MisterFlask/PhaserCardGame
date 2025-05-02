import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class TemporaryEmpowermentPermit extends AbstractConsumable {
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
        return "Form 1-aa: Temporary Empowerment Permit";
    }

    override getDescription(): string {
        return `Gain ${this.lethalityAmount} Lethality this turn.`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Temporary Empowerment Permit", () => {
            this.actionManager.applyBuffToCharacterOrCard(target, new Lethality(this.lethalityAmount));
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Temporary Empowerment Permit purchased!");
    }
} 
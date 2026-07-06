import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { AbstractConsumable } from "./AbstractConsumable";

export class SoulCollectionPhylactery extends AbstractConsumable {
    private damageAmount: number = 5;

    constructor() {
        super();
        this.targetingType = TargetingType.ENEMY;
        this.rarity = EntityRarity.UNCOMMON;
        this.basePrice = 150;
        this.uses = 1;
        this.tint = 0x800080; // Purple tint for soul-related effects
    }

    override getDisplayName(): string {
        return "Soul-Collection Phylactery";
    }

    override getDescription(): string {
        return `Deal ${this.damageAmount} damage to target enemy. If this kills them, gain £ equal to their max HP.`;
    }

    getTooltip(): string {
        return `${this.getDescription()}\n[i]A lead-lined reliquary, Company-issue. Screws shut. Best not to ask what's rattling inside on the walk home.[/i]`;
    }

    override onUse(target: BaseCharacter): boolean {
        // Can only use on living characters
        if (!target || target.isDead()) {
            return false;
        }

        this.actionManager.DoAThing("Use Soul-Collection Phylactery", () => {
            // Store the target's max HP before dealing damage
            const maxHp = target.maxHitpoints;

            // Deal damage
            this.actionManager.dealDamage({
                baseDamageAmount: this.damageAmount,
                target: target,
                fromAttack: true
            });

            // If the target died, grant £ equal to their max HP
            if (target.isDead()) {
                this.actionManager.modifyMoney(maxHp);
            }
        });

        return true;
    }

    override onPurchase(): void {
        console.log("Soul-Collection Phylactery purchased!");
    }
}
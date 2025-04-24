// AbstractConsumable
import { TargetingType } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity } from "../gamecharacters/EntityRarity";
import { ActionManager } from "../utils/ActionManager";
import ImageUtils from "../utils/ImageUtils";

export abstract class AbstractConsumable {
    // Properties
    targetingType: TargetingType = TargetingType.NO_TARGETING;
    basePrice: number = 50;
    rarity: EntityRarity = EntityRarity.COMMON;
    imageName: string = "";
    tint: number = 0xFFFFFF;
    clickable: boolean = true;
    uses: number = 1;
    actionManager: ActionManager = ActionManager.getInstance();

    constructor() {
        // Default initialization
    }

    /**
     * Initialize the consumable with default values
     */
    public init(): void {
        if (!this.imageName) {
            this.imageName = ImageUtils.getDeterministicAbstractPlaceholder(this.getDisplayName());
            this.tint = this.generateSeededRandomColor();
        }
    }

    /**
     * Generate a seeded random color for the consumable
     */
    protected generateSeededRandomColor(): number {
        // Simple hash function for name to create deterministic color
        let hash = 0;
        const name = this.getDisplayName();
        for (let i = 0; i < name.length; i++) {
            hash = ((hash << 5) - hash) + name.charCodeAt(i);
            hash = hash & hash; // Convert to 32bit integer
        }
        
        // Generate a color based on the hash
        const r = Math.abs(hash % 128) + 64;
        const g = Math.abs((hash >> 8) % 128) + 64;
        const b = Math.abs((hash >> 16) % 128) + 64;
        
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Get the display name of the consumable
     */
    abstract getDisplayName(): string;

    /**
     * Get the description of the consumable
     */
    abstract getDescription(): string;

    /**
     * Get the tooltip text for the consumable
     */
    getTooltip(): string {
        return this.getDescription();
    }

    /**
     * Action to perform when the consumable is used
     * @returns Whether the consumable was used successfully
     */
    abstract onUse(target: BaseCharacter): boolean;

    /**
     * Action to perform when the consumable is purchased
     */
    onPurchase(): void {
        // Default implementation does nothing
    }
}

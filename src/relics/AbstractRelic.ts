import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { EntityRarity, PlayableCard } from "../gamecharacters/PlayableCard";
import { LocationCard } from "../maplogic/LocationCard";
import { AbstractCombatEvent } from "../rules/AbstractCombatEvent";
import { CombatState, GameState } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import ImageUtils from "../utils/ImageUtils";

export abstract class AbstractRelic {

    copy(): this {
        // Create a new instance of the same relic type
        const constructor = this.constructor as new () => AbstractRelic;
        const copy = new constructor();
        
        // Copy over all properties
        copy.name = this.name;
        copy.description = this.description;
        copy.rarity = this.rarity;
        copy.price = this.price;
        copy.portraitName = this.portraitName;
        copy.tint = this.tint;
        copy.surfaceSellValue = this.surfaceSellValue;
        copy.stacks = this.stacks;
        copy.isStacksVisible = this.isStacksVisible;
        
        copy.init();
        return copy as this;
    }
    
    name!: string;
    description!: string;
    rarity!: EntityRarity;
    price: number = -1;
    portraitName!: string
    tint!: number
    surfaceSellValue?: number;
    stacks: number = 1;
    isStacksVisible: boolean = false;

    constructor() {
    }

    public init(): void {
        if (!this.portraitName) {
            this.portraitName = ImageUtils.getDeterministicAbstractPlaceholder(this.name);
            this.tint = this.generateSeededRandomColor();
        }
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getTier(): EntityRarity {
        return this.rarity;
    }

    public generateSeededRandomColor(): number {
        let hash = 0;
        for (let i = 0; i < this.getName().length; i++) {
            const char = this.getName().charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        const r = (hash & 255);
        const g = ((hash >> 8) & 255);
        const b = ((hash >> 16) & 255);

        return (r << 16) | (g << 8) | b;
    }


    // hooks
    public onCombatStart(): void {}

    public onCombatEnd(): void {}

    public onCardPlayed(card: PlayableCard, target: BaseCharacter | undefined): void {}

    public damageModifierOnCardPlayed(card: PlayableCard): DamageModifier {
        return new DamageModifier();
    }

    public onCardDrawn(card: PlayableCard): void {}

    public onCardDiscarded(card: PlayableCard): void {}

    public onCardExhausted(card: PlayableCard): void {}

    public onLocationEntered(location: LocationCard): void {}

    public onRelicClicked(): void {}

    public passivePerTurnEnergyModifier(): number {
        return 0;
    }

    public onCombatEvent(event: AbstractCombatEvent): void {
        // override in specific relics
    }
    
    
    // helpers
    protected get gameState(): GameState {
        return GameState.getInstance();
    }

    protected get combatState(): CombatState {
        return this.gameState.combatState;
    }

    protected get actionManager(): ActionManager {
        return ActionManagerFetcher.getActionManager();
    }

    public getShopPriceMultiplier(): number {
        return 1.0; // Override in specific relics to modify shop prices
    }
}

export class DamageModifier{
    public flatDamageMod = 0;
    /// NOTE: This is a multiplier applied ON TOP of typical damage, so no change is 0 and 100 is double
    public percentDamageMod = 100;
    constructor({
        flatDamageMod = 0,
        percentDamageMod = 100
    }: {
        flatDamageMod?: number,
        percentDamageMod?: number
    } = {}) {
        this.flatDamageMod = flatDamageMod;
        this.percentDamageMod = percentDamageMod;
    }
}
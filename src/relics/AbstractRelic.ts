import { CardRarity, PlayableCard } from "../gamecharacters/PlayableCard";
import { LocationCard } from "../maplogic/LocationCard";
import { CombatState, GameState } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import ImageUtils from "../utils/ImageUtils";

export abstract class AbstractRelic {
    name!: string;
    description!: string;
    rarity!: CardRarity;
    price: number = -1;
    portraitName!: string
    tint!: number
    

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

    public getTier(): CardRarity {
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

    public onCardPlayed(card: PlayableCard): void {}

    public damageModifierOnCardPlayed(card: PlayableCard): DamageModifier {
        return new DamageModifier();
    }

    public onCardDrawn(card: PlayableCard): void {}

    public onCardDiscarded(card: PlayableCard): void {}

    public onCardExhausted(card: PlayableCard): void {}

    public onLocationEntered(location: LocationCard): void {}

    public onRelicClicked(): void {}
    
    
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
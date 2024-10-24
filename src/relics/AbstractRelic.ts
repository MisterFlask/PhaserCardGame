import { CardRarity, PlayableCard } from "../gamecharacters/PlayableCard";
import { LocationCard } from "../maplogic/LocationCard";
import { CombatState, GameState } from "../rules/GameState";
import { ActionManager } from "../utils/ActionManager";
import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";

export abstract class AbstractRelic {
    name!: string;
    description!: string;
    tier!: CardRarity;

    constructor() {
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getTier(): CardRarity {
        return this.tier;
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
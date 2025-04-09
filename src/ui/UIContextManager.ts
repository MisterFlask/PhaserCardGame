export enum UIContext {
    COMBAT = "COMBAT",
    MAP = "MAP",
    SHOP = "SHOP",
    CARD_REWARD = "CARD_REWARD",
    CHARACTER_DECK_SHOWN = "CHARACTER_DECK_SHOWN",
    CAMPAIGN_HQ = "CAMPAIGN_HQ",
    CARD_SELECTION_FROM_HAND = "CARD_SELECTION_FROM_HAND",
    DEBUG_MENU = "DEBUG_MENU",
    COMBAT_BUT_NOT_YOUR_TURN = "COMBAT_BUT_NOT_YOUR_TURN",
    REWARD_SCREEN = "REWARD_SCREEN",
    CARD_SELECTION_FROM_CUSTOM_POOL = "CARD_SELECTION_FROM_CUSTOM_POOL"
}

export class UIContextManager {
    private static instance: UIContextManager;
    private contextStack: UIContext[] = [UIContext.COMBAT];

    private constructor() {}

    public static getInstance(): UIContextManager {
        if (!UIContextManager.instance) {
            UIContextManager.instance = new UIContextManager();
        }
        return UIContextManager.instance;
    }

    public pushContext(context: UIContext): void {
        console.log(`UIContext pushing ${UIContext[context]} onto stack`);
        console.trace(); // This will log the stack trace
        this.contextStack.push(context);
    }

    public popContext(): UIContext | undefined {
        // Never pop the last element (COMBAT)
        if (this.contextStack.length <= 1) {
            console.warn("Attempted to pop the base COMBAT context, ignoring");
            return undefined;
        }
        
        const poppedContext = this.contextStack.pop();
        console.log(`UIContext popped ${poppedContext ? UIContext[poppedContext] : "undefined"} from stack`);
        console.trace();
        return poppedContext;
    }

    public getCurrentContext(): UIContext {
        return this.contextStack[this.contextStack.length - 1];
    }

    public getContext(): UIContext {
        return this.getCurrentContext();
    }

    public isContext(context: UIContext): boolean {
        return this.getCurrentContext() === context;
    }

    public isContextInStack(context: UIContext): boolean {
        return this.contextStack.includes(context);
    }

    public clearToBase(): void {
        this.contextStack = [UIContext.COMBAT];
        console.log("UIContext stack cleared to base COMBAT context");
    }

    public printCurrentContextStack(): string {
        return this.contextStack.map(context => UIContext[context]).join(", ");
    }
}

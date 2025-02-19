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
    private currentContext: UIContext = UIContext.COMBAT;

    private constructor() {}

    public static getInstance(): UIContextManager {
        if (!UIContextManager.instance) {
            UIContextManager.instance = new UIContextManager();
        }
        return UIContextManager.instance;
    }

    public setContext(context: UIContext): void {
        console.log(`UIContext changing from ${UIContext[this.currentContext]} to ${UIContext[context]}`);
        console.trace(); // This will log the stack trace
        this.currentContext = context;
    }

    public getContext(): UIContext {
        return this.currentContext;
    }

    public isContext(context: UIContext): boolean {
        return this.currentContext === context;
    }

}

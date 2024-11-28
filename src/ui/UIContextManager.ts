export enum UIContext {
    COMBAT,
    MAP,
    SHOP,
    CARD_REWARD,
    CHARACTER_DECK_SHOWN,
    CAMPAIGN_HQ,
    CARD_SELECTION_FROM_HAND,
    DEBUG_MENU,
    COMBAT_BUT_NOT_YOUR_TURN,
    REWARD_SCREEN
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
        this.currentContext = context;
    }

    public getContext(): UIContext {
        return this.currentContext;
    }

    public isContext(context: UIContext): boolean {
        return this.currentContext === context;
    }

}

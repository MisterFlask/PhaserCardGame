/**
 * Manages z-index/depth values for all UI elements to ensure consistent layering
 */
export class DepthManager {
    private static instance: DepthManager;

    // Base layers
    public readonly BACKGROUND = 0;
    public readonly GAME_OBJECTS = 100;
    public readonly UI_BASE = 1000;
    
    // Card depths
    public readonly CARD_BASE = this.GAME_OBJECTS + 10;
    public readonly CARD_HOVER = this.GAME_OBJECTS + 20;
    public readonly CARD_DRAGGING = this.GAME_OBJECTS + 30;
    
    // Combat UI elements
    public readonly COMBAT_UI = this.UI_BASE + 100;
    public readonly COMBAT_BUTTONS = this.UI_BASE + 110;
    public readonly COMBAT_TEXT = this.UI_BASE + 120;
    
    // Overlay depths
    public readonly OVERLAY_BASE = this.UI_BASE + 1000;
    public readonly INVENTORY_OVERLAY = this.OVERLAY_BASE + 100;
    public readonly SHOP_OVERLAY = this.OVERLAY_BASE + 200;
    public readonly SHOP_CARD_HOVER = this.OVERLAY_BASE + 250;
    public readonly MAP_OVERLAY = this.OVERLAY_BASE + 300;
    public readonly DETAILS_OVERLAY = this.OVERLAY_BASE + 400;
    
    // Top-level UI elements
    public readonly BATTLEFIELD_HIGHLIGHT = this.UI_BASE + 1000;
    public readonly TOOLTIP = this.UI_BASE + 2000;
    public readonly MODAL = this.UI_BASE + 3000;

    private constructor() {}

    public static getInstance(): DepthManager {
        if (!DepthManager.instance) {
            DepthManager.instance = new DepthManager();
        }
        return DepthManager.instance;
    }
}

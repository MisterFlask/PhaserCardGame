export class TextGlyphs {
    private static instance: TextGlyphs;

    private constructor() {}

    public static getInstance(): TextGlyphs {
        if (!TextGlyphs.instance) {
            TextGlyphs.instance = new TextGlyphs();
        }
        return TextGlyphs.instance;
    }
    // Image names for resource icons
    public readonly VENTURE_ICON_RAW = "venture_icon";
    public readonly METTLE_ICON_RAW = "iron_icon";
    public readonly PAGES_ICON_RAW = "papers_icon";
    public readonly PLUCK_ICON_RAW = "feather_icon";
    public readonly POWDER_ICON_RAW = "powder_icon";
    public readonly SMOG_ICON_RAW = "smog_icon";

    // Resource icons
    public get ventureIcon(): string {
        return `[color=lightgreen][img=${this.VENTURE_ICON_RAW}][/color]`;
    }

    public get mettleIcon(): string {
        return `[color=lightgrey][img=${this.METTLE_ICON_RAW}][/color]`; 
    }

    public get pagesIcon(): string {
        return `[color=beige][img=${this.PAGES_ICON_RAW}][/color]`;
    }

    public get pluckIcon(): string {
        return `[color=lightblue][img=${this.PLUCK_ICON_RAW}][/color]`;
    }

    public get powderIcon(): string {
        return `[color=red][img=${this.POWDER_ICON_RAW}][/color]`;
    }

    public get smogIcon(): string {
        return `[color=brown][img=${this.SMOG_ICON_RAW}][/color]`;
    }

    // Emoji icons for card effects
    public get blockIcon(): string {
        return `🛡️`;
    }

    public get attackIcon(): string {
        return `⚔️`;
    }

    public get magicIcon(): string {
        return `✨`;
    }
}

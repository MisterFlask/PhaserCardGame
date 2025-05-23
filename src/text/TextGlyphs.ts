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
    public readonly ASHES_ICON_RAW = "ashes_icon";
    public readonly PLUCK_ICON_RAW = "feather_icon";
    public readonly BLOOD_ICON_RAW = "blood_icon";
    public readonly SMOG_ICON_RAW = "smog_icon";

    // Resource icons
    public get ventureIcon(): string {
        return `[color=yellow][img=${this.VENTURE_ICON_RAW}][/color]`;
    }

    public get mettleIcon(): string {
        return `[color=lightgrey][img=${this.METTLE_ICON_RAW}][/color]`; 
    }

    public get ashesIcon(): string {
        return `[color=beige][img=${this.ASHES_ICON_RAW}][/color]`;
    }

    public get pluckIcon(): string {
        return `[color=green][img=${this.PLUCK_ICON_RAW}][/color]`;
    }

    public get bloodIcon(): string {
        return `[color=red][img=${this.BLOOD_ICON_RAW}][/color]`;
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

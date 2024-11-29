export abstract class AbstractCombatResource {
    name: string;
    description: string;
    value: number = 0;
    icon: string;
    tint: number = 0xffffff;
    glyph?: string;

    constructor(name: string, description: string, icon: string = 'placeholder', glyph?: string) {
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.glyph = glyph;
    }

    public abstract onClick(): void;
} 
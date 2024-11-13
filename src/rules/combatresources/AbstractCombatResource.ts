export abstract class AbstractCombatResource {
    name: string;
    description: string;
    value: number = 5;
    icon: string;
    tint: number = 0xffffff;

    constructor(name: string, description: string, icon: string = 'placeholder') {
        this.name = name;
        this.description = description;
        this.icon = icon;
    }

    public abstract onClick(): void;
} 
export abstract class AbstractCombatResource {
    name: string;
    description: string;
    value: number;
    icon: string;

    constructor(name: string, description: string, initialValue: number = 0, icon: string = 'placeholder') {
        this.name = name;
        this.description = description;
        this.value = initialValue;
        this.icon = icon;
    }

    public abstract onClick(): void;
} 
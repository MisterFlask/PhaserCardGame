import { AbstractCombatEvent } from "../AbstractCombatEvent";

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

    // returns true if the resource was used, false if it was not used
    public abstract onClick(): boolean;
} 

export class CombatResourceUsedEvent extends AbstractCombatEvent {
    resource: AbstractCombatResource;
    
    printJson(): string {
        return JSON.stringify({
            type: "ResourceUsedEvent",
            resource: this.resource
        });
    }
    constructor(resource: AbstractCombatResource) {
        super();
        this.resource = resource;
    }

    public isAshes(): boolean {
        return this.resource.name === "Ashes";
    }
    public isBlood(): boolean {
        return this.resource.name === "Blood";
    }
    public isPluck(): boolean {
        return this.resource.name === "Pluck";
    }
    public isMettle(): boolean {
        return this.resource.name === "Mettle";
    }
    public isSmog(): boolean {
        return this.resource.name === "Smog";
    }
    public isVenture(): boolean {
        return this.resource.name === "Venture";
    }
}
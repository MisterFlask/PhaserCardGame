
import { BaseCharacter } from "./BaseCharacter";
import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { AbstractIntent } from "./AbstractIntent";

export abstract class AutomatedCharacter extends BaseCharacter implements JsonRepresentable {
    
    override typeTag = "AutomatedCharacter";
    removeIntent(intent: AbstractIntent) {
        this.intents = this.intents.filter(i => i.id !== intent.id);
    }
    intents: AbstractIntent[] = [];

    constructor({ 
        name, 
        portraitName, 
        maxHitpoints, 
        description, 
    }: { 
        name: string; 
        portraitName: string; 
        maxHitpoints: number; 
        description?: string;
    }) {
        super({ name, portraitName, maxHitpoints, description });
    }

    override createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            intents: this.intents.map(intent => intent.createJsonRepresentation()),
        }, null, 2);
    }

    abstract generateNewIntents(): AbstractIntent[];

    public setNewIntents(): void {
        this.intents = this.generateNewIntents();
    }
}
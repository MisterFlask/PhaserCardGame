import { AbstractCard } from "./AbstractCard";
import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { AbstractIntent } from "./AbstractIntent";

export class BaseCharacter extends AbstractCard implements JsonRepresentable {
    name: string;
    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;

    constructor({ name, portraitName, maxHitpoints, description }
        : { name: string; portraitName: string; maxHitpoints: number; description?: string}) {
        super({
            name: name,
            description: description || "",
            portraitName: portraitName
        });
        this.name = name;
        this.portraitName = portraitName;
        this.maxHitpoints = maxHitpoints;
        this.hitpoints = maxHitpoints;
    }

    public getDamageModifier(): number {
        return 0;
    }

    override createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            hitpoints: this.hitpoints,
            maxHitpoints: this.maxHitpoints,
            damageModifier: this.getDamageModifier()
        }, null, 2);
    }
}


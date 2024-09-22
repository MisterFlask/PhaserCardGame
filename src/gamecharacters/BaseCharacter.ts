import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { AbstractCard } from "./AbstractCard";


export enum Gender{
    Male,
    Female
}
export class BaseCharacter extends AbstractCard implements JsonRepresentable {
    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;
    gender: Gender = Gender.Female;


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


import { AbstractCard } from "./AbstractCard";
import { AbstractIntent } from "./AbstractIntent";

export class BaseCharacter extends AbstractCard{
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

    public getDamageModifier(): number{
        return 0;
    }
}


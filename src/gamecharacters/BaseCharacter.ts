import { IBaseCharacter } from './IBaseCharacter';
import { AbstractCard } from './AbstractCard';
import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { GameState } from '../rules/GameState';
import { AbstractIntent } from './AbstractIntent';


export enum Gender{
    Male,
    Female
}
export class BaseCharacter extends AbstractCard implements IBaseCharacter {
    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;
    gender: Gender = Gender.Female;

    getIntentsTargetingThisCharacter(): AbstractIntent[] {

        const gameState = GameState.getInstance();
        const livingEnemies = gameState.combatState.enemies.filter(enemy => enemy.hitpoints > 0);
        
        const targetingIntents: AbstractIntent[] = [];

        for (const enemy of livingEnemies) {
            for (const intent of enemy.intents) {
                if (intent.target === this) {
                    targetingIntents.push(intent);
                }
            }
        }

        return targetingIntents;
    }

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


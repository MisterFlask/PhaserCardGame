import { GameState } from '../rules/GameState';
import { AbstractCard } from './AbstractCard';
import { AbstractIntent } from './AbstractIntent';
import { Stress } from './buffs/standard/Stress';
import { IBaseCharacter } from './IBaseCharacter';


export enum Gender{
    Male,
    Female
}
export class BaseCharacter extends AbstractCard implements IBaseCharacter {
    override typeTag = "BaseCharacter";

    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;
    gender: Gender = Gender.Female;

    isDead(): boolean {
        return this.hitpoints <= 0;
    }
    getIntentsTargetingThisCharacter(): AbstractIntent[] {

        const gameState = GameState.getInstance();
        const livingEnemies = gameState.combatState.enemies.filter(enemy => enemy.hitpoints > 0);
        
        const targetingIntents: AbstractIntent[] = [];

        for (const enemy of livingEnemies) {
            for (const intent of enemy.intents) {
                if (intent.target === this || intent.targetsAllPlayers) {
                    targetingIntents.push(intent);
                }
            }
        }

        return targetingIntents;
    }

    get stress(): number {
        const stressBuff = this.buffs.find(buff => buff instanceof Stress);
        return stressBuff ? stressBuff.stacks : 0;
    }

    set stress(value: number) {
        const stressBuff = this.buffs.find(buff => buff instanceof Stress);
        if (stressBuff) {
            stressBuff.stacks = value;
        } else {
            const newStressBuff = new Stress(value);
            this.buffs.push(newStressBuff);
        }
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


import { CombatRules } from '../rules/CombatRulesHelper';
import { GameState } from '../rules/GameState';
import type { CharacterAnimation } from '../ui/animations/AnimationTypes';
import { AbstractCard, Team } from './AbstractCard';
import { AbstractIntent } from './AbstractIntent';
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
                if (intent.target === this || intent.targetsAllPlayers && this.team == Team.ALLY) {
                    targetingIntents.push(intent);
                }
            }
        }

        const nonEnemyIntents = CombatRules.retrieveIncomingNonEnemyIntentInformationForCharacter(this);
        targetingIntents.push(...nonEnemyIntents);

        return targetingIntents;
    }

    get stress(): number {
        const stressBuff = this.buffs.find(buff => buff.id === "stress");
        return stressBuff ? stressBuff.stacks : 0;
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

    public adjustMaxHitpoints(value: number): void {
        this.maxHitpoints += value;
        this.hitpoints = Math.min(this.hitpoints, this.maxHitpoints);
    }

    public healFully(): void {
        this.hitpoints = this.maxHitpoints;
    }

    /** Bespoke attack-flourish animation. Return null (the default) to fall back to the
     *  stock attacker tilt -- overriding characters compose primitives from src/ui/animations/. */
    public getAttackAnimation(): CharacterAnimation | null {
        return null;
    }

    /** Bespoke hurt-flourish animation. Return null (the default) to fall back to the
     *  stock jiggle+glow. */
    public getHurtAnimation(): CharacterAnimation | null {
        return null;
    }

    /** Bespoke death-flourish animation. Return null (the default) to fall back to the
     *  stock fade-and-scale-down removal. */
    public getDeathAnimation(): CharacterAnimation | null {
        return null;
    }
}


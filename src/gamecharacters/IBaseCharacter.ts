import { AbstractIntent } from './AbstractIntent';
import { Gender } from './BaseCharacter';
import { IAbstractCard } from './IAbstractCard';

export interface IBaseCharacter extends IAbstractCard {
    hasBuff(buffName: string): boolean;
    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;
    gender: Gender;

    getIntentsTargetingThisCharacter(): AbstractIntent[];
    getDamageModifier(): number;
}
import { AbstractIntent } from './AbstractIntent';
import { Gender } from './BaseCharacter';
import { IAbstractCard } from './IAbstractCard';

export interface IBaseCharacter extends IAbstractCard {
    portraitName: string;
    hitpoints: number;
    maxHitpoints: number;
    gender: Gender;

    getIntentsTargetingThisCharacter(): AbstractIntent[];
    getDamageModifier(): number;
}
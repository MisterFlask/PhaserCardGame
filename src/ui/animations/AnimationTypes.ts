// Shared type declarations for the bespoke combat animation system.
// Deliberately import-light: PlayableCard/BaseCharacter import these as
// method return types, so anything heavy here would risk a cycle back into
// gamecharacters/.

import type { Scene } from 'phaser';
import type { IPhysicalCardInterface } from '../../gamecharacters/AbstractCard';
import type { BaseCharacter } from '../../gamecharacters/BaseCharacter';

/** Context handed to a card's bespoke play-flourish animation. */
export interface CardPlayContext {
    scene?: Scene;
    /** Screen position of the played card, captured synchronously before
     *  the card's PhysicalCard may be torn down by the drag-end handler. */
    sourceXY: { x: number; y: number };
    owner?: BaseCharacter;
    target?: BaseCharacter;
}

/** Context handed to a character's bespoke attack/hurt/death animation. */
export interface CharacterAnimContext {
    scene?: Scene;
    physicalCard?: IPhysicalCardInterface;
    targetPhysicalCard?: IPhysicalCardInterface;
}

export type CardPlayAnimation = (ctx: CardPlayContext) => Promise<void>;
export type CharacterAnimation = (ctx: CharacterAnimContext) => Promise<void>;

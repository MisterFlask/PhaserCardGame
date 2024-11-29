import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import type { PhysicalCard } from '../ui/PhysicalCard';
import { Team } from './AbstractCard';
import { AbstractBuff } from './buffs/AbstractBuff';
import { IBaseCharacter } from './IBaseCharacter';
import { CardSize, CardType } from './Primitives';

export interface IAbstractCard extends JsonRepresentable {
    typeTag: string;
    name: string;
    description: string;
    portraitName?: string;
    cardType: CardType;
    tooltip: string;
    owningCharacter?: IBaseCharacter;
    size: CardSize;
    id: string;
    team: Team;
    block: number;
    buffs: AbstractBuff[];
    physicalCard?: PhysicalCard | undefined;

    isBaseCharacter(): boolean;
    isAutomatedCharacter(): boolean;
    isPlayableCard(): boolean;

    OnCombatStart(): void;
    Copy(): this;
}
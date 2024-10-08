import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { AbstractIntent } from './AbstractIntent';
import { AbstractBuff } from './buffs/AbstractBuff';
import { CardSize, CardType } from './Primitives';
import { IPhysicalCardInterface, Team } from './AbstractCard';
import { IBaseCharacter } from './IBaseCharacter';

export interface IAbstractCard extends JsonRepresentable {
    typeTag: string;
    name: string;
    description: string;
    portraitName: string;
    cardType: CardType;
    tooltip: string;
    owner?: IBaseCharacter;
    size: CardSize;
    id: string;
    team: Team;
    block: number;
    buffs: AbstractBuff[];
    energyCost: number;
    physicalCard?: IPhysicalCardInterface | undefined;

    OnCombatStart(): void;
    Copy(): IAbstractCard;
}
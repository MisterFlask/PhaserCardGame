import { AbstractCombatEvent } from "../rules/AbstractCombatEvent";
import { DamageInfo } from "../rules/DamageInfo";
import { BaseCharacter } from "./BaseCharacter";
import { IBaseCharacter } from "./IBaseCharacter";
import { PlayableCard } from "./PlayableCard";

export interface IAbstractBuff {
    imageName: string;
    id: string;
    stackable: boolean;
    stacks: number;
    secondaryStacks: number;
    showSecondaryStacks: boolean;
    isDebuff: boolean;
    
    getOwnerAsPlayableCard(): PlayableCard | null;
    getName(): string;
    getDescription(): string;
    getStacksDisplayText(): string;
    getOwnerAsCharacter(): BaseCharacter | null;
    getCombatDamageDealtModifier(target?:BaseCharacter): number;
    getBlockSentModifier(target: IBaseCharacter): number;
    getAdditionalPercentCombatDamageDealtModifier(target?: BaseCharacter): number;
    getAdditionalPercentCombatDamageTakenModifier(): number;
    getCombatDamageTakenModifier(): number;
    getBlockReceivedModifier(): number;
    onOwnerStruck_CannotModifyDamage(strikingUnit: BaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void;
    onOwnerStriking(struckUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void;
    onTurnStart(): void;
    onTurnEnd_CharacterBuff(): void;
    onEvent(item: AbstractCombatEvent): void;
}
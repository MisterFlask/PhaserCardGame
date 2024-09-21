import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { DamageInfo } from "../../rules/DamageInfo";
import { GameState } from "../../rules/GameState";
import { generateWordGuid, PlayableCard } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";

export abstract class AbstractBuff {

    public getOwner(): BaseCharacter | null {
    // Import GameState if not already imported at the top of the file

    // Find the owner of this buff by searching through all characters in the combat state
    const gameState = GameState.getInstance();
    const combatState = gameState.combatState;
    const allCharacters = [...combatState.playerCharacters, ...combatState.enemies];
    
    const owner = allCharacters.find(character => character.buffs.some(buff => buff.id === this.id));
    
    if (!owner) {
        console.warn(`No owner found for buff ${this.getName()} with id ${this.id}`);
        return null;
    }
    
    return owner;
    }

    public static applyBuffToCharacter(character: BaseCharacter, buff: AbstractBuff){

        // Check if the character already has a buff of the same type
        let existingBuff = character.buffs.find(existingBuff => existingBuff.constructor === buff.constructor);
        if (existingBuff) {
            existingBuff = existingBuff as AbstractBuff
            if (existingBuff.stackable) {
                // If the buff is stackable, increase its stack count
                existingBuff.stacks = ((existingBuff as any).stacks || 1) + 1;
            }else{
            // If the buff is not stackable, we'll just log this information
            console.log(`Buff ${existingBuff.getName()} is not stackable. Ignoring new application.`);
            }
            // If not stackable, we don't add a new one or modify the existing one
        } else {
            // If the buff doesn't exist, add it to the character's buffs
            character.buffs.push(buff);
        }
    }

    getStacksDisplayText(): string {
        if (this.stacks > 0) return `${this.stacks}`;
        else return "[stacks]";
    }

    imageName: string = "PLACEHOLDER_IMAGE";
    id: string = generateWordGuid();
    stackable: boolean = true;
    stacks: number = 1;

    abstract getName(): string;
    abstract getDescription(): string;


    getCombatDamageDealtModifier(): number {
        return 0;
    }
    getBlockSentModifier(): number {
        return 0;
    }
    getCombatDamageTakenModifier(): number {
        return 0;
    }
    getBlockReceivedModifier(): number {
        return 0;
    }

    onOwnerStruck(strikingUnit: BaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo){

    }

    onOwnerStriking(struckUnit: BaseCharacter , cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo){

    }

    onEvent(item: AbstractCombatEvent){


    }
}

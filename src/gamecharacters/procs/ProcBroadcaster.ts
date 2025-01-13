import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { GameState } from "../../rules/GameState";
import { AbstractBuff } from "../buffs/AbstractBuff";

export class ProcBroadcaster {
    private static instance: ProcBroadcaster;

    private constructor() {

    }

    public static getInstance(): ProcBroadcaster {
        if (!ProcBroadcaster.instance) {
            ProcBroadcaster.instance = new ProcBroadcaster();
        }
        return ProcBroadcaster.instance;
    }

    public broadcastCombatEvent(event: AbstractCombatEvent): void {

        GameState.getInstance().combatState.allPlayerAndEnemyCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                buff.onEvent(event);
            });
        });
        GameState.getInstance().combatState.allCardsInAllPilesExceptExhaust.forEach(card => {
                card.buffs.forEach(buff => {
                buff.onEvent(event);
            });
        });
    }   



    public retrieveAllRelevantBuffsForProcs(inCombat: boolean, includeDeadEnemies: boolean = false): AbstractBuff[] {
        const buffs: AbstractBuff[] = [];
        GameState.getInstance().combatState.allPlayerAndEnemyCharacters.forEach(character => {
            if (character.hitpoints <= 0 && !includeDeadEnemies) {
                return;
            }
            character.buffs.forEach(buff => {
                buffs.push(buff);
            });
        });

        if (inCombat) {
            GameState.getInstance().combatState.allCardsInAllPilesExceptExhaust.forEach(card => {
                card.buffs.forEach(buff => {
                    buffs.push(buff);
                });
            });
        }else{
            // use master deck instead
            GameState.getInstance().masterDeckAllCharacters.forEach(card => {
                if (card.owningCharacter && card.owningCharacter.hitpoints <= 0) {
                    return;
                }
                card.buffs.forEach(buff => {
                    buffs.push(buff);
                });
            });
        }

        GameState.getInstance().currentLocation?.buffs?.forEach(buff => {
            buffs.push(buff);
        });

        GameState.getInstance().currentRoute?.buffs?.forEach(modifier => {
            buffs.push(modifier);
        });

        GameState.getInstance().relicsInventory?.forEach(relic => {
            buffs.push(relic);
        });
        
        return buffs;

    }
}


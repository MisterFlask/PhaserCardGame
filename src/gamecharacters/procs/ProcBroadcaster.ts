import { AbstractCombatEvent } from "../../rules/AbstractCombatEvent";
import { GameState } from "../../rules/GameState";

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

}

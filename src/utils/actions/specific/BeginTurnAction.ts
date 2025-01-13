import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { GameState } from "../../../rules/GameState";
import { UIContext, UIContextManager } from "../../../ui/UIContextManager";
import { ActionManagerFetcher } from "../../ActionManagerFetcher";
import { GameAction } from "../GameAction";

export class BeginTurnAction extends GameAction {

    public drawHandForNewTurn(): void {
        console.log('Drawing hand for new turn');
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const handSize = 5;

        // Check each character's buffs at start of turn
        const allCharacters = [...combatState.playerCharacters, ...combatState.enemies];
        var cardModifier = 0;
        allCharacters.forEach(character => {
            character.buffs.forEach(buff => {
                cardModifier += buff.getCardsDrawnAtStartOfTurnModifier();
            });
        });

        ActionManagerFetcher.getActionManager().drawCards(handSize + cardModifier);

        console.log('State of all piles:');
        console.log('Draw Pile:', combatState.drawPile.map(card => card.name));
        console.log('Discard Pile:', combatState.currentDiscardPile.map(card => card.name));
        console.log('Hand:', combatState.currentHand.map(card => card.name));
    }
    
    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Erase block from all player characters
        combatState.playerCharacters.forEach(character => {
            character.block = 0;
        });

        // Prevent dead enemies from gaining new intents
        combatState.enemies.forEach(enemy => {
            if (enemy.hitpoints > 0) {
                enemy.setNewIntents();
            }
        });

        // Queue draw action
        this.drawHandForNewTurn();

        // Trigger turn start buffs
        ProcBroadcaster.getInstance()
            .retrieveAllRelevantBuffsForProcs(true)
            .forEach(buff => {
                buff.onTurnStart();
            });

        // Reset energy to default max
        combatState.energyAvailable = combatState.defaultMaxEnergy;

        // Set UI context
        UIContextManager.getInstance().setContext(UIContext.COMBAT);

        return [];
    }
} 
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { ProcBroadcaster } from "../../../gamecharacters/procs/ProcBroadcaster";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";
import { BeginTurnAction } from "./BeginTurnAction";

export class StartCombatAction extends GameAction {
    async playAction(): Promise<GameAction[]> {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // remove all non-persona, transient buffs from all player characters
        gameState.currentRunCharacters.forEach(c => {
            c.buffs.forEach(b => {
                if (!b.isPersonaTrait && !b.isPersistentBetweenCombats) {
                    ActionManager.getInstance().removeBuffFromCharacter(c, b.getDisplayName());
                }
            });
        });

        // Initialize combat deck: copy all cards in master deck into draw pile
        combatState.drawPile = [...gameState.currentRunCharacters.flatMap(c => c.cardsInMasterDeck)].map(c => c.Copy() as PlayableCard);
        // Add cargo cards to draw pile
        const cargoCards = gameState.currentVessel.cardsInMasterDeck.map(c => c.Copy() as PlayableCard);
        combatState.drawPile.push(...cargoCards);
        // Assign cargo holder as owner for all cargo cards
        cargoCards.forEach(card => {
            card.owningCharacter = gameState.currentVessel;
        });
        // Fisher-Yates shuffle algorithm
        for (let i = combatState.drawPile.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combatState.drawPile[i], combatState.drawPile[j]] = [combatState.drawPile[j], combatState.drawPile[i]];
        }


        // Reset all combat resources to 0
        combatState.combatResources.resources().forEach(resource => {
            resource.value = 0;
        });
        
        combatState.currentHand = [];
        combatState.currentDiscardPile = [];
        combatState.currentExhaustPile = [];

        // Set max energy based on relics
        combatState.defaultMaxEnergy = 3; // Base energy
        
        new BeginTurnAction().playAction();

        // Trigger onCombatStart for all relevant buffs
        ProcBroadcaster.getInstance().retrieveAllRelevantBuffsForProcs(true).forEach(buff => {
            buff.onCombatStart();
        });
        
        return [];
    }
} 
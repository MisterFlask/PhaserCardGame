// src/services/StateService.ts

import { Encounter } from "../../encounters/EncounterManager";
import { PlayerCharacter } from "../../gamecharacters/PlayerCharacter";
import { DeckLogic } from "../../rules/DeckLogicHelper";
import { GameState } from "../../rules/GameState";

class CombatStateService {
    private static instance: CombatStateService;


    public static getInstance(): CombatStateService {
        if (!CombatStateService.instance) {
            CombatStateService.instance = new CombatStateService();
        }
        return CombatStateService.instance;
    }

    public initializeCombat(encounter: Encounter, playerCharacters: PlayerCharacter[]): void {
        GameState.getInstance().combatState.enemies = encounter.enemies;
        GameState.getInstance().combatState.playerCharacters = playerCharacters;
        GameState.getInstance().combatState.drawPile = DeckLogic.getInstance().generateInitialCombatDeck();
        GameState.getInstance().combatState.currentHand = [];
        GameState.getInstance().combatState.currentDiscardPile = [];
    }

}

export default CombatStateService;

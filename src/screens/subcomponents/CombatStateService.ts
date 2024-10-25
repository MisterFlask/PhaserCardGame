// src/services/StateService.ts

import { EncounterData } from "../../encounters/Encounters";
import { PlayerCharacter } from "../../gamecharacters/CharacterClasses";
import { DeckLogic } from "../../rules/DeckLogic";
import { GameState } from "../../rules/GameState";

class CombatStateService {
    private static instance: CombatStateService;


    public static getInstance(): CombatStateService {
        if (!CombatStateService.instance) {
            CombatStateService.instance = new CombatStateService();
        }
        return CombatStateService.instance;
    }

    public initializeCombat(encounter: EncounterData, playerCharacters: PlayerCharacter[]): void {
        GameState.getInstance().combatState.enemies = encounter.enemies;
        GameState.getInstance().combatState.playerCharacters = playerCharacters;
        GameState.getInstance().combatState.currentDrawPile = DeckLogic.getInstance().generateInitialCombatDeck();
        GameState.getInstance().combatState.currentHand = [];
        GameState.getInstance().combatState.currentDiscardPile = [];
    }

}

export default CombatStateService;

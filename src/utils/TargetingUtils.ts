import { AbstractCard } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { GameState } from "../rules/GameState";

export class TargetingUtils {
    
    selectAllEnemyCharacters() {
        const gameState = GameState.getInstance();
        return gameState.combatState.enemies;
    }
    private static instance: TargetingUtils;
    private constructor() {}

    public static getInstance(): TargetingUtils {
        if (!TargetingUtils.instance) {
            TargetingUtils.instance = new TargetingUtils();
        }
        return TargetingUtils.instance;
    }

    public selectRandomCardsFromPile(pile: AbstractCard[], n: number): AbstractCard[] {
        if (n <= 0) {
            return [];
        }

        const shuffled = [...pile].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(n, pile.length));
    }

    public selectRandomPlayerCharacter(): BaseCharacter {
        const gameState = GameState.getInstance();
        const playerCharacters = gameState.combatState.playerCharacters;
        if (playerCharacters.length === 0) {
            throw new Error('No player characters to select from.');
        }
        const randomIndex = Math.floor(Math.random() * playerCharacters.length);
        return playerCharacters[randomIndex];
    }

    public selectAllPlayerCharacters(): BaseCharacter[] {
        const gameState = GameState.getInstance();
        return gameState.combatState.playerCharacters;
    }
}
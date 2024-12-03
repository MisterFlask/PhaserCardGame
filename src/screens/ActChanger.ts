import { EncounterManager } from "../encounters/EncountersList";
import { GameState } from "../rules/GameState";
import { SceneChanger } from "./SceneChanger";

export class ActChanger {
    private scene: Phaser.Scene;

    private constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    /// use ActionManagerFetcher.getActChanger instead for normal use
    public static getInitialInstance(scene: Phaser.Scene): ActChanger {
        return new ActChanger(scene);
    }

    public AdvanceAct(): void {
        const gameState = GameState.getInstance();
        
        // Increment the act number
        gameState.currentAct++;

        // Force regenerate the map by emitting an event
        gameState.mapInitialized = false;
        this.scene.events.emit('regenerateMap', true);

        // Set player to entrance room (first location)
        const locations = gameState.getLocations();
        if (locations.length > 0) {
            gameState.setCurrentLocation(locations[0]);
        }
        SceneChanger.switchToCombatScene(EncounterManager.getInstance().getRestEncounter(), true);

        // Emit event to show map overlay
        this.scene.events.emit('showMapOverlay');
    }
}

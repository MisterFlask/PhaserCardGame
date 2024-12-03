import Phaser from 'phaser';
import { PhysicalCard } from './PhysicalCard';
import { TextBox } from './TextBox';
import { TransientUiState } from './TransientUiState';

export class MapDebugOverlay {
    private scene: Phaser.Scene;
    private overlay: Phaser.GameObjects.Container;
    private debugTextBox: TextBox | null = null;
    private getLocationCards: () => PhysicalCard[];
    private getPlayerPositionIcon: () => Phaser.GameObjects.Image | undefined;

    constructor(
        scene: Phaser.Scene, 
        overlay: Phaser.GameObjects.Container,
        getLocationCards: () => PhysicalCard[],
        getPlayerPositionIcon: () => Phaser.GameObjects.Image | undefined
    ) {
        this.scene = scene;
        this.overlay = overlay;
        this.getLocationCards = getLocationCards;
        this.getPlayerPositionIcon = getPlayerPositionIcon;
    }

    public toggleLocationCardDepths(): void {
        if (this.debugTextBox) {
            this.hideLocationCardDepths();
        } else {
            this.showLocationCardDepths();
        }
    }

    public showLocationCardDepths(): void {
        if (this.debugTextBox) return;

        const transientUiState = TransientUiState.getInstance();
        const locationCards = this.getLocationCards();

        // Find the lowest and highest depths
        const depths = locationCards.map(card => card.container.depth);
        const lowestDepth = depths.length > 0 ? Math.min(...depths) : -666;
        const highestDepth = depths.length > 0 ? Math.max(...depths) : -666;

        // Get the depth of the currently hovered location card
        const hoveredLocationCard = transientUiState.hoveredCard && 
            locationCards.find(card => card === transientUiState.hoveredCard) 
            ? transientUiState.hoveredCard.container.depth 
            : 'None';

        // Get the depth of the current player position icon
        const playerPositionIcon = this.getPlayerPositionIcon();
        const playerPositionDepth = playerPositionIcon ? playerPositionIcon.depth : 'None';

        // Create a TextBox to display the debugging information
        this.debugTextBox = new TextBox({
            scene: this.scene,
            x: this.scene.scale.width / 2,
            y: this.scene.scale.height / 2,
            width: 400,
            height: 200,
            text: `Location Card Depths:
Lowest Depth: ${lowestDepth}
Highest Depth: ${highestDepth}
Hovered Location Depth: ${hoveredLocationCard}
Player Position Depth: ${playerPositionDepth}`,
            style: { 
                fontSize: '20px', 
                color: '#ffffff', 
                fontFamily: 'Arial',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            },
            fillColor: 0x000000,
            textBoxName: 'LocationCardDepthDebug'
        });

        // Position the debug box at the center of the screen
        this.debugTextBox.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);

        // Set depth above highest depth observed
        this.debugTextBox.setDepth(highestDepth + 1);

        // Add the debug box to the overlay container
        this.overlay.add(this.debugTextBox);

        // Bring the debug box to the top within the overlay
        this.overlay.bringToTop(this.debugTextBox);
    }

    public hideLocationCardDepths(): void {
        if (this.debugTextBox) {
            this.debugTextBox.destroy();
            this.debugTextBox = null;
        }
    }

    public destroy(): void {
        this.hideLocationCardDepths();
    }
} 
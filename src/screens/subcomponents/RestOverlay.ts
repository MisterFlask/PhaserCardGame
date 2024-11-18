import { GameState } from '../../rules/GameState';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';

export class RestOverlay {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background!: Phaser.GameObjects.Rectangle;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(DepthManager.getInstance().MAP_OVERLAY + 100); // Above map overlay
        this.container.setScrollFactor(0);
        this.createOverlay();
        this.hide(); // Start hidden
    }

    private createOverlay(): void {
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        // Semi-transparent background
        this.background = this.scene.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0.7);
        this.background.setOrigin(0);
        this.background.setScrollFactor(0);
        this.container.add(this.background);

        // Title
        const title = this.scene.add.text(gameWidth / 2, gameHeight / 3, 'Rest Site', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        title.setScrollFactor(0);
        this.container.add(title);

        // Rest Button
        const restButton = new TextBoxButton({
            scene: this.scene,
            x: gameWidth / 2,
            y: gameHeight / 2 - 50,
            width: 300,
            height: 60,
            text: 'Rest (Heal 20% HP)',
            style: { fontSize: '24px', color: '#ffffff' },
            fillColor: 0x4a4a4a,
            textBoxName: 'restButton'
        });
        restButton.setScrollFactor(0);
        restButton.onClick(() => this.handleRest());
        this.container.add(restButton);

        // Scavenge Button
        const scavengeButton = new TextBoxButton({
            scene: this.scene,
            x: gameWidth / 2,
            y: gameHeight / 2 + 50,
            width: 300,
            height: 60,
            text: 'Scavenge (Gain 30 Hell Currency)',
            style: { fontSize: '24px', color: '#ffffff' },
            fillColor: 0x4a4a4a,
            textBoxName: 'scavengeButton'
        });
        scavengeButton.setScrollFactor(0);
        scavengeButton.onClick(() => this.handleScavenge());
        this.container.add(scavengeButton);

        // Make background clickable to close
        this.background.setInteractive()
            .on('pointerdown', () => this.hide());
    }

    private handleRest(): void {
        const gameState = GameState.getInstance();
        gameState.currentRunCharacters.forEach(character => {
            const healAmount = Math.floor(character.maxHitpoints * 0.2);
            character.hitpoints = Math.min(character.maxHitpoints, character.hitpoints + healAmount);
        });
        this.hide();
    }

    private handleScavenge(): void {
        const gameState = GameState.getInstance();
        gameState.hellCurrency += 30;
        this.hide();
    }

    public show(): void {
        console.log("RestOverlay show");
        this.container.setVisible(true);
    }

    public hide(): void {
        this.container.setVisible(false);
    }

    public destroy(): void {
        this.container.destroy();
    }
}

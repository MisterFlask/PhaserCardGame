import { GameState } from '../../rules/GameState';
import { DecorativeFrame } from '../../ui/DecorativeFrame';
import { DepthManager } from '../../ui/DepthManager';
import { EventButton } from '../../ui/EventButton';
import { TextBox } from '../../ui/TextBox';

export class RestOverlay {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private frame!: DecorativeFrame;
    private contentContainer!: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // Create main container at center of screen
        const { width, height } = scene.scale;
        this.container = scene.add.container(width / 2, height / 2);
        this.container.setDepth(DepthManager.getInstance().MAP_OVERLAY + 100);
        this.container.setScrollFactor(0);
        
        this.createOverlay();
        this.hide(); // Start hidden
    }

    private createOverlay(): void {
        const windowWidth = this.scene.scale.width * 0.6;
        const windowHeight = this.scene.scale.height * 0.7;

        // Create decorative frame
        this.frame = new DecorativeFrame(this.scene, windowWidth, windowHeight);
        this.container.add(this.frame);

        // Create content container
        this.contentContainer = this.scene.add.container(0, 0);
        this.container.add(this.contentContainer);

        // Add semi-transparent background for click guard
        const clickGuard = this.scene.add.rectangle(
            0,
            0,
            this.scene.scale.width * 2,
            this.scene.scale.height * 2,
            0x000000,
            0.5
        );
        clickGuard.setInteractive()
            .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                console.log('Click guard clicked');
                const bounds = new Phaser.Geom.Rectangle(
                    this.container.x - windowWidth/2,
                    this.container.y - windowHeight/2,
                    windowWidth,
                    windowHeight
                );
                if (!Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
                    this.hide();
                }
            });
        this.container.add(clickGuard);
        clickGuard.setDepth(-1);

        // Add title
        const title = new TextBox({
            scene: this.scene,
            x: 0,
            y: -windowHeight * 0.35,
            width: windowWidth * 0.8,
            text: 'Rest Site',
            style: {
                fontSize: '36px',
                color: '#e0d5c0',
                fontFamily: 'serif',
                align: 'center'
            }
        });
        this.contentContainer.add(title);

        // Add description
        const description = new TextBox({
            scene: this.scene,
            x: 0,
            y: -windowHeight * 0.2,
            width: windowWidth * 0.8,
            text: 'Take a moment to rest and recover, or search the area for resources.',
            style: {
                fontSize: '22px',
                color: '#e0d5c0',
                fontFamily: 'serif',
                align: 'center',
                wordWrap: { width: windowWidth * 0.7 }
            }
        });
        this.contentContainer.add(description);

        // Rest Button
        const restButton = new EventButton({
            scene: this.scene,
            x: 0,
            y: 0,
            width: windowWidth * 0.7,
            height: 60,
            text: 'Rest (Heal 20% HP)'
        });
        restButton.on('pointerover', () => console.log('Rest button hover'));
        restButton.on('pointerdown', () => console.log('Rest button clicked'));
        restButton.onClick(() => {
            console.log('Rest button onClick triggered');
            this.handleRest();
        });
        this.contentContainer.add(restButton);

        // Scavenge Button
        const scavengeButton = new EventButton({
            scene: this.scene,
            x: 0,
            y: 80,
            width: windowWidth * 0.7,
            height: 60,
            text: 'Scavenge (Gain 30 Hell Currency)'
        });
        scavengeButton.on('pointerover', () => console.log('Scavenge button hover'));
        scavengeButton.on('pointerdown', () => console.log('Scavenge button clicked'));
        scavengeButton.onClick(() => {
            console.log('Scavenge button onClick triggered');
            this.handleScavenge();
        });
        this.contentContainer.add(scavengeButton);

        // Leave Button
        const leaveButton = new EventButton({
            scene: this.scene,
            x: 0,
            y: 160,
            width: windowWidth * 0.4,
            height: 50,
            text: 'Leave'
        });
        leaveButton.on('pointerover', () => console.log('Leave button hover'));
        leaveButton.on('pointerdown', () => console.log('Leave button clicked'));
        leaveButton.onClick(() => {
            console.log('Leave button onClick triggered');
            this.hide();
        });
        this.contentContainer.add(leaveButton);

        // Debug visibility check
        console.log('Content visibility check:', {
            container: this.container.visible,
            frame: this.frame.visible,
            contentContainer: this.contentContainer.visible,
            title: title.visible,
            restButton: restButton.visible
        });

        // Debug position check
        console.log('Position check:', {
            container: { x: this.container.x, y: this.container.y },
            contentContainer: { x: this.contentContainer.x, y: this.contentContainer.y },
            restButton: { x: restButton.x, y: restButton.y }
        });
    }

    private handleRest(): void {
        console.log('Handling rest action');
        const gameState = GameState.getInstance();
        gameState.currentRunCharacters.forEach(character => {
            const healAmount = Math.floor(character.maxHitpoints * 0.2);
            character.hitpoints = Math.min(character.maxHitpoints, character.hitpoints + healAmount);
        });
        this.animateOut(() => this.hide());
    }

    private handleScavenge(): void {
        console.log('Handling scavenge action');
        const gameState = GameState.getInstance();
        gameState.hellCurrency += 30;
        this.animateOut(() => this.hide());
    }

    private animateIn(): void {
        this.container.setAlpha(0);
        this.container.setScale(0.95);
        
        this.scene.tweens.add({
            targets: this.container,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.frame.animateIn();
    }

    private animateOut(onComplete: () => void): void {
        this.scene.tweens.add({
            targets: this.container,
            alpha: 0,
            scale: 0.95,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete
        });
    }

    public show(): void {
        console.log('Showing rest overlay');
        this.container.setVisible(true);
        this.animateIn();
    }

    public hide(): void {
        console.log('Hiding rest overlay');
        this.container.setVisible(false);
    }

    public destroy(): void {
        this.container.destroy();
    }
}

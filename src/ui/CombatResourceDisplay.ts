import { Scene } from 'phaser';
import { ProcBroadcaster } from '../gamecharacters/procs/ProcBroadcaster';
import { AbstractCombatResource, CombatResourceUsedEvent } from '../rules/combatresources/AbstractCombatResource';
import { ShadowedImage } from './ShadowedImage';
import { TooltipAttachment } from './TooltipAttachment';
import { UIContext, UIContextManager } from './UIContextManager';

export class CombatResourceDisplay extends Phaser.GameObjects.Container {
    private icon: ShadowedImage;
    private valueText: Phaser.GameObjects.Text;
    private tooltipAttachment: TooltipAttachment;
    private resource: AbstractCombatResource;
    private previousValue: number;
    private buttonBackground: Phaser.GameObjects.Rectangle;
    private glowEffect: Phaser.GameObjects.Sprite;
    private isHovering: boolean = false;
    
    // Define consistent button dimensions - slightly increased width for better spacing
    private static readonly BUTTON_WIDTH = 120;
    private static readonly BUTTON_HEIGHT = 60;

    constructor(scene: Scene, x: number, y: number, resource: AbstractCombatResource) {
        super(scene, x, y);
        this.resource = resource;
        this.previousValue = resource.value;

        // Create button background with rounded corners
        this.buttonBackground = scene.add.rectangle(
            0, 0, 
            CombatResourceDisplay.BUTTON_WIDTH, 
            CombatResourceDisplay.BUTTON_HEIGHT, 
            0x333333, 0.8
        )
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5, 0.5);
        
        // Add a subtle glow effect behind the button (initially invisible)
        this.glowEffect = scene.add.sprite(0, 0, 'white_glow');
        if (!this.glowEffect.texture.key) {
            // Create a fallback if the texture doesn't exist
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xffffff, 0.5);
            graphics.fillCircle(32, 32, 32);
            const texture = graphics.generateTexture('white_glow', 64, 64);
            graphics.destroy();
            this.glowEffect.setTexture('white_glow');
        }
        this.glowEffect.setScale(1.3);
        this.glowEffect.setAlpha(0);
        this.glowEffect.setBlendMode(Phaser.BlendModes.ADD);

        // Create icon using ShadowedImage
        this.icon = new ShadowedImage({
            scene,
            texture: resource.icon,
            displaySize: 42,
            shadowOffset: 2
        });
        
        // Position the icon slightly to the left for better layout
        this.icon.setPosition(-25, -5);
        
        // Create value text and position it to the right of the icon
        this.valueText = scene.add.text(25, 0, `${resource.value}`, {
            fontSize: '22px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        this.valueText.setShadow(2, 2, '#000000', 2, true, true);
        this.valueText.setOrigin(0.5, 0.5);

        // Add components to container in the correct order
        this.add([this.glowEffect, this.buttonBackground, this.icon, this.valueText]);
        
        // Make the entire container interactive with proper hitbox size
        this.setSize(CombatResourceDisplay.BUTTON_WIDTH, CombatResourceDisplay.BUTTON_HEIGHT);
        this.setInteractive({ useHandCursor: true });  // Set hand cursor on hover

        // Add TooltipAttachment to the container itself
        this.tooltipAttachment = new TooltipAttachment({
            scene: scene,
            container: this,
            tooltipText: `${resource.name}: ${resource.description}`,
            fillColor: 0x000000
        });

        this.icon.mainImage.setTint(resource.tint);

        // Add event handlers for button-like behavior
        this.on('pointerdown', this.handleClick, this)
            .on('pointerover', this.handlePointerOver, this)
            .on('pointerout', this.handlePointerOut, this);
        
        // Add to scene
        scene.add.existing(this);
        this.scene.events.on('update', this.update, this);
        
        // Initial pulse to draw attention
        this.scene.time.delayedCall(500, () => {
            this.pulseGlow();
        });
    }

    update(): void {
        this.updateValue();
        
        // Subtle continuous animation when hovering
        if (this.isHovering) {
            this.glowEffect.rotation += 0.01;
        }
    }

    private handleClick(): void {
        if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
            var used = this.resource.onClick();
            if (used) {
                ProcBroadcaster.getInstance().broadcastCombatEvent(new CombatResourceUsedEvent(this.resource));
                this.pulseIcon();
                this.pulseButtonBackground();
            }
        }
    }
    
    private handlePointerOver(): void {
        this.isHovering = true;
        
        // Scale up slightly
        this.scene.tweens.add({
            targets: [this.buttonBackground, this.icon, this.valueText],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            ease: 'Power1'
        });
        
        // Show glow effect
        this.scene.tweens.add({
            targets: this.glowEffect,
            alpha: 0.5,
            duration: 200
        });
        
        // Change button color to indicate it's interactive
        this.buttonBackground.setFillStyle(0x555555, 0.9);
        this.buttonBackground.setStrokeStyle(2, 0xffff00);
    }
    
    private handlePointerOut(): void {
        this.isHovering = false;
        
        // Scale back to normal
        this.scene.tweens.add({
            targets: [this.buttonBackground, this.icon, this.valueText],
            scaleX: 1,
            scaleY: 1,
            duration: 100,
            ease: 'Power1'
        });
        
        // Hide glow effect
        this.scene.tweens.add({
            targets: this.glowEffect,
            alpha: 0,
            duration: 200
        });
        
        // Restore original button color
        this.buttonBackground.setFillStyle(0x333333, 0.8);
        this.buttonBackground.setStrokeStyle(2, 0xffffff);
    }

    private pulseIcon(): void {
        // Stop any existing tweens on the icon
        this.scene.tweens.killTweensOf(this.icon);

        // Create a pulse animation
        this.scene.tweens.add({
            targets: this.icon,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeInOut',
            onComplete: () => {
                // Ensure the icon returns to its original scale
                this.icon.setScale(1);
            }
        });
    }
    
    private pulseButtonBackground(): void {
        // Pulse the button background to indicate activation
        const originalColor = this.buttonBackground.fillColor;
        this.scene.tweens.add({
            targets: this.buttonBackground,
            fillColor: { from: originalColor, to: this.resource.tint },
            duration: 150,
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                this.buttonBackground.setFillStyle(0x333333, 0.8);
            }
        });
    }
    
    private pulseGlow(): void {
        // Create a pulse animation for the glow to draw attention
        this.scene.tweens.add({
            targets: this.glowEffect,
            alpha: { from: 0, to: 0.7 },
            scale: { from: 1, to: 1.3 },
            duration: 300,
            yoyo: true,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.glowEffect.setAlpha(0);
                this.glowEffect.setScale(1.3);
            }
        });
    }

    public updateValue(): void {
        const newValue = this.resource.value;
        if (newValue !== this.previousValue) {
            this.pulseIcon();
            this.pulseButtonBackground();
            this.previousValue = newValue;
        }
        this.valueText.setText(`${newValue}`);
    }

    public destroy(): void {
        this.scene?.events?.off('update', this.update, this);
        this.off('pointerdown', this.handleClick, this);
        this.off('pointerover', this.handlePointerOver, this);
        this.off('pointerout', this.handlePointerOut, this);
        this.tooltipAttachment.destroy();
        super.destroy();
    }
} 
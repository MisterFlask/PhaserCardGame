import { Scene } from 'phaser';
import { AbstractCombatResource } from '../rules/combatresources/AbstractCombatResource';
import { ShadowedImage } from './ShadowedImage';
import { TooltipAttachment } from './TooltipAttachment';
import { UIContext, UIContextManager } from './UIContextManager';

export class CombatResourceDisplay extends Phaser.GameObjects.Container {
    private icon: ShadowedImage;
    private valueText: Phaser.GameObjects.Text;
    private tooltipAttachment: TooltipAttachment;
    private resource: AbstractCombatResource;
    private previousValue: number;

    constructor(scene: Scene, x: number, y: number, resource: AbstractCombatResource) {
        super(scene, x, y);
        this.resource = resource;
        this.previousValue = resource.value;

        // Create icon using ShadowedImage
        this.icon = new ShadowedImage({
            scene,
            texture: resource.icon,
            displaySize: 64,
            shadowOffset: 2
        });
        
        // Make the icon interactive
        this.icon.mainImage.setInteractive();
        
        // Create value text
        this.valueText = scene.add.text(40, 0, `${resource.name}: ${resource.value}`, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.valueText.setShadow(2, 2, '#000000', 2, true, true);

        // Add TooltipAttachment instead
        this.tooltipAttachment = new TooltipAttachment({
            scene: scene,
            container: this.icon.mainImage,
            tooltipText: resource.description,
            fillColor: 0x000000
        });

        this.icon.mainImage.setTint(resource.tint);

        // Add event handlers
        this.icon.mainImage.on('pointerdown', this.handleClick, this);

        // Add components to container
        this.add([this.icon, this.valueText]);
        
        // Add to scene
        scene.add.existing(this);
        this.scene.events.on('update', this.update, this);
    }

    update(): void {
        this.updateValue();
    }

    private handleClick(): void {
        if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
            this.resource.onClick();
        }
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

    public updateValue(): void {
        const newValue = this.resource.value;
        if (newValue !== this.previousValue) {
            this.pulseIcon();
            this.previousValue = newValue;
        }
        this.valueText.setText(`${this.resource.name}: ${newValue}`);
    }

    public destroy(): void {
        this.scene?.events?.off('update', this.update, this);
        this.icon?.mainImage?.off('pointerdown', this.handleClick, this);
        this.tooltipAttachment.destroy();
        super.destroy();
    }
} 
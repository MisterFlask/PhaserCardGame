import { Scene } from 'phaser';
import { AbstractCombatResource } from '../rules/combatresources/AbstractCombatResource';
import { ShadowedImage } from './ShadowedImage';
import { TextBox } from './TextBox';
import { UIContext, UIContextManager } from './UIContextManager';

export class CombatResourceDisplay extends Phaser.GameObjects.Container {
    private icon: ShadowedImage;
    private valueText: Phaser.GameObjects.Text;
    private tooltip: TextBox;
    private resource: AbstractCombatResource;

    constructor(scene: Scene, x: number, y: number, resource: AbstractCombatResource) {
        super(scene, x, y);
        this.resource = resource;

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

        // Create tooltip
        this.tooltip = new TextBox({
            scene: scene,
            x: -250,
            y: 0,
            width: 230,
            height: 100,
            text: resource.description,
            style: { 
                fontSize: '16px', 
                color: '#ffffff', 
                wordWrap: { width: 220 } 
            },
            fillColor: 0x000000
        });
        this.tooltip.setVisible(false);

        this.icon.mainImage.setTint(resource.tint);

        // Add event handlers
        this.icon.mainImage.on('pointerdown', this.handleClick, this);
        this.icon.mainImage.on('pointerover', this.handlePointerOver, this);
        this.icon.mainImage.on('pointerout', this.handlePointerOut, this);

        // Add components to container
        this.add([this.icon, this.valueText, this.tooltip]);
        
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

    private handlePointerOver(): void {
        this.tooltip.setVisible(true);
        this.icon.setTint(0x888888 * this.resource.tint);
    }

    private handlePointerOut(): void {
        this.tooltip.setVisible(false);
        this.icon.setTint(this.resource.tint);
    }

    public updateValue(): void {
        this.valueText.setText(`${this.resource.name}: ${this.resource.value}`);
    }

    public destroy(): void {
        this.scene.events.off('update', this.update, this);
        this.icon.mainImage.off('pointerdown', this.handleClick, this);
        this.icon.mainImage.off('pointerover', this.handlePointerOver, this);
        this.icon.mainImage.off('pointerout', this.handlePointerOut, this);
        super.destroy();
    }
} 
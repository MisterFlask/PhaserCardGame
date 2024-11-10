import { Scene } from 'phaser';
import { AbstractCombatResource } from '../rules/combatresources/AbstractCombatResource';
import { TextBox } from './TextBox';
import { UIContext, UIContextManager } from './UIContextManager';

export class CombatResourceDisplay extends Phaser.GameObjects.Container {
    private icon: Phaser.GameObjects.Image;
    private valueText: Phaser.GameObjects.Text;
    private tooltip: TextBox;
    private resource: AbstractCombatResource;

    constructor(scene: Scene, x: number, y: number, resource: AbstractCombatResource) {
        super(scene, x, y);
        this.resource = resource;

        // Create icon
        this.icon = scene.add.image(0, 0, resource.icon)
            .setDisplaySize(64, 64)
            .setInteractive();
        
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

        // Add event handlers
        this.icon.on('pointerdown', this.handleClick, this);
        this.icon.on('pointerover', this.handlePointerOver, this);
        this.icon.on('pointerout', this.handlePointerOut, this);

        // Add components to container
        this.add([this.icon, this.valueText, this.tooltip]);
        
        // Add to scene
        scene.add.existing(this);
    }

    private handleClick(): void {
        if (UIContextManager.getInstance().getContext() === UIContext.COMBAT) {
            this.resource.onClick();
        }
    }

    private handlePointerOver(): void {
        this.tooltip.setVisible(true);
        this.icon.setTint(0xcccccc);
    }

    private handlePointerOut(): void {
        this.tooltip.setVisible(false);
        this.icon.clearTint();
    }

    public updateValue(): void {
        this.valueText.setText(`${this.resource.name}: ${this.resource.value}`);
    }

    public destroy(): void {
        this.icon.off('pointerdown', this.handleClick, this);
        this.icon.off('pointerover', this.handlePointerOver, this);
        this.icon.off('pointerout', this.handlePointerOut, this);
        super.destroy();
    }
} 
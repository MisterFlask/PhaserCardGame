import Phaser from 'phaser';
import { DepthManager } from './DepthManager';
import { TextBox } from './TextBox';

export class TooltipAttachment {
    private gameObject: Phaser.GameObjects.Container | Phaser.GameObjects.Image;
    private tooltip: TextBox;
    private scene: Phaser.Scene;
    private padding: number = 10;
    private isVisible: boolean = false;

    
    constructor(params: {
        scene: Phaser.Scene,
        container: Phaser.GameObjects.Container | Phaser.GameObjects.Image,
        tooltipText: string,
        fillColor?: number,
    }) {
        const { 
            scene, 
            container, 
            tooltipText,
            fillColor = 0x000000,
        } = params;
        
        this.scene = scene;
        this.gameObject = container;
        
        // Create temporary text to measure dimensions
        const tempText = new TextBox({
            scene,
            text: tooltipText,
            fillColor,
        });
        
        // Get the natural dimensions of the text
        const bounds = tempText.getBounds();
        tempText.destroy();
        
        // Create actual tooltip with proper dimensions
        this.tooltip = new TextBox({
            scene,
            width: bounds.width + this.padding * 2,
            height: bounds.height + this.padding * 2,
            text: tooltipText,
            fillColor,
        });
        this.tooltip.setVisible(false);
        
        // Add hover listeners
        // assume it's interactive
        this.gameObject.on('pointerover', this.showTooltip, this);
        this.gameObject.on('pointerout', this.hideTooltip, this);
    }

    private showTooltip(): void {
        this.isVisible = true;
        this.tooltip.setVisible(true);
        this.updateTooltipPosition();
        this.tooltip.setDepth(DepthManager.getInstance().TOOLTIP);
        // Bring tooltip to top of display list
        if (this.tooltip.parentContainer) {
            this.tooltip.parentContainer.bringToTop(this.tooltip);
        } else {
            this.scene.children.bringToTop(this.tooltip);
        }

        // Add update listener to scene
        this.scene.events.on('update', this.updateTooltipPosition, this);
    }

    private hideTooltip(): void {
        this.isVisible = false;
        this.tooltip.setVisible(false);
        
        // Remove update listener
        this.scene.events.off('update', this.updateTooltipPosition, this);
    }

    private updateTooltipPosition = (): void => {
        if (!this.isVisible) return;

        const gameHeight = this.scene.scale.height;
        const gameWidth = this.scene.scale.width;
        
        // Get gameObject's world position and dimensions
        const objectBounds = this.gameObject.getBounds();
        const objectWidth = objectBounds.width;
        const objectHeight = objectBounds.height;
        
        // Calculate tooltip dimensions
        const tooltipBounds = this.tooltip.getBounds();
        
        // Determine vertical position
        let yPos: number;
        if (objectBounds.y > gameHeight / 2) {
            // Container is in bottom half, show tooltip above with additional padding and container height
            yPos = objectBounds.y - tooltipBounds.height - this.padding - objectHeight - 5;
        } else {
            // Container is in top half, show tooltip below with additional padding and container height
            yPos = objectBounds.bottom + this.padding + objectHeight + 5;
        }

        // Determine horizontal position
        let xPos: number;
        if (objectBounds.x > gameWidth / 2) {
            // Container is in right half, show tooltip to the left with additional padding and container width
            xPos = objectBounds.x - tooltipBounds.width - this.padding - objectWidth - 5;
        } else {
            // Container is in left half, show tooltip to the right with additional padding and container width
            xPos = objectBounds.right + this.padding + objectWidth + 5;
        }

        // Update tooltip position
        this.tooltip.setPosition(xPos, yPos);
    }

    public updateText(text: string): void {
        this.tooltip.setText(text);
    }

    public destroy(): void {
        this.hideTooltip();
        this.tooltip.destroy();
        this.gameObject.off('pointerover', this.showTooltip, this);
        this.gameObject.off('pointerout', this.hideTooltip, this);
    }
} 
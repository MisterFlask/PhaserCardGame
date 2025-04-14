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
        disableAutomaticHoverListeners?: boolean,
    }) {
        const { 
            scene, 
            container, 
            tooltipText,
            fillColor = 0x000000,
            disableAutomaticHoverListeners = false,
        } = params;
        
        this.scene = scene;
        this.gameObject = container;
        
        // Get the bounds of the text
        const tempText = new Phaser.GameObjects.Text(scene, 0, 0, tooltipText, {
            fontSize: '18px',
            fontFamily: 'verdana',
            wordWrap: { width: 300 }
        });
        const bounds = tempText.getBounds();
        tempText.destroy();
        
        // Create actual tooltip with proper dimensions
        this.tooltip = new TextBox({
            scene,
            width: bounds.width + this.padding * 2,
            height: bounds.height + this.padding * 2,
            text: tooltipText,
            fillColor,
            style: {
                fontSize: '18px',
                fontFamily: 'verdana',
            },
        });
        this.tooltip.setVisible(false);
        
        // Make tooltip fixed to camera (not affected by scroll)
        this.tooltip.setScrollFactor(0);
        
        // Add the tooltip directly to the scene instead of a container
        scene.add.existing(this.tooltip);
        
        // Add hover listeners
        // assume it's interactive
        if (!disableAutomaticHoverListeners) {
            this.gameObject.on('pointerover', this.showTooltip, this);
            this.gameObject.on('pointerout', this.hideTooltip, this);
        }
        
        // Add resize listener to update tooltip position when window is resized
        this.scene.scale.on('resize', this.updateTooltipPosition, this);
        
        // Add camera move listener to update tooltip position when camera moves
        this.scene.cameras.main.on('camerascroll', this.updateTooltipPosition, this);
    }

    public showTooltip(): void {
        this.isVisible = true;
        this.tooltip.setVisible(true);
        this.updateTooltipPosition();
        
        // Set a higher depth value that will be above all overlays (including MapOverlay + 1000)
        // For context, the MapOverlay is using DepthManager.getInstance().MAP_OVERLAY + 1000
        const depthManager = DepthManager.getInstance();
        this.tooltip.setDepth(depthManager.TOOLTIP);
        
        // Bring tooltip to top of display list
        if (this.tooltip.parentContainer) {
            console.log("showTooltip called (parented)");
            this.tooltip.parentContainer.bringToTop(this.tooltip);
        } else {
            console.log("showTooltip called (unparented)");
            this.scene.children.bringToTop(this.tooltip);
        }
    }

    public hideTooltip(): void {
        this.isVisible = false;
        this.tooltip.setVisible(false);
    }

    public updateTooltipPosition = (): void => {
        if (!this.isVisible) return;
        
        // Get current mouse position in screen coordinates
        const pointer = this.scene.input.activePointer;
        const mouseX = pointer.x;
        const mouseY = pointer.y;
        
        // Get tooltip dimensions
        const tooltipBounds = this.tooltip.getBounds();
        
        // Position tooltip up and to the right of cursor
        // Base offset that grows with tooltip height
        const xOffset = 250;
        const baseYOffset = -40;
        const heightBasedOffset = -(tooltipBounds.height * 0.5); // Additional offset based on height
        const yOffset = baseYOffset + heightBasedOffset;
        
        let xPos = mouseX + xOffset;
        let yPos = mouseY + yOffset;

        // Ensure tooltip stays within game bounds
        const gameWidth = this.scene.scale.width;
        const gameHeight = this.scene.scale.height;

        // Adjust if tooltip would go off right edge
        if (xPos + tooltipBounds.width > gameWidth) {
            xPos = mouseX - tooltipBounds.width - xOffset;
        }

        // Adjust if tooltip would go off top edge
        if (yPos < 0) {
            yPos = mouseY + Math.abs(yOffset);
        }

        // Adjust if tooltip would go off bottom edge
        if (yPos + tooltipBounds.height > gameHeight) {
            yPos = mouseY - Math.abs(yOffset) - tooltipBounds.height;
        }

        // Update tooltip position in screen coordinates
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
        this.scene?.scale?.off('resize', this.updateTooltipPosition, this);
        this.scene?.cameras?.main?.off('camerascroll', this.updateTooltipPosition, this);
    }
} 
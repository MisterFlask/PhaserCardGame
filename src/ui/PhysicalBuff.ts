import { AbstractBuff } from '../gamecharacters/buffs/AbstractBuff';
import ImageUtils from '../utils/ImageUtils';
import { TextBox } from './TextBox';

export class PhysicalBuff {
    abstractBuff: AbstractBuff;
    container: Phaser.GameObjects.Container;
    image: Phaser.GameObjects.Image;
    stacksText: Phaser.GameObjects.Text;
    tooltipBox: TextBox;
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, abstractBuff: AbstractBuff) {
        this.scene = scene;
        this.abstractBuff = abstractBuff;
        this.container = scene.add.container(x, y);
        // Create the image
        const imageName = scene.textures.exists(abstractBuff.imageName) ? abstractBuff.imageName : this.useAbstractIcon(abstractBuff);
        this.image = scene.add.image(0, 0, imageName);
        
        this.image.setScale(0.5); // Adjust scale as needed

        // Update the text creation with new styling and position
        this.stacksText = scene.add.text(0, 0, `${abstractBuff.stacks}`, {
            fontSize: '19px',
            color: '#ffffff',
            fontFamily: 'Arial',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 3
        });
        // Change origin to bottom-left instead of center
        this.stacksText.setOrigin(0, 1);

        // Create the description box (initially hidden)
        this.tooltipBox = new TextBox({
            scene: this.scene,
            width: 200,
            height: 100,
            text: this.abstractBuff.getDescription(),
            textBoxName: `${this.abstractBuff.getName()}Description`
        });
        this.tooltipBox.setVisible(false);

        // Set the size of the container
        const containerSize = 40; // Adjust this value as needed
        this.container.setSize(containerSize, containerSize);

        // Update text position to bottom-left of the container
        const halfContainerSize = containerSize / 2;
        this.image.setDisplaySize(containerSize, containerSize);
        this.image.setPosition(0, 0);
        this.stacksText.setPosition(-halfContainerSize + 6, halfContainerSize - 6); // Added small offset (2px) for padding
        this.container.add([this.image, this.stacksText]);

        // Adjust the interactive area to match the container's size
        this.container.setInteractive(new Phaser.Geom.Rectangle(-containerSize / 2, -containerSize / 2, containerSize, containerSize), Phaser.Geom.Rectangle.Contains);
        
        // Add mouse over and mouse out events
        this.container.on('pointerover', this.showDescription, this);
        this.container.on('pointerout', this.hideDescription, this);

        // Add a tween to briefly enlarge the buff when it's added
        this.scene.tweens.add({
            targets: this.container,
            scale: { from: 1, to: 1.2 },
            duration: 200,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                this.container.setScale(1); // Ensure scale resets to original
            }
        });
    }

    private useAbstractIcon(abstractBuff: AbstractBuff) {
        return ImageUtils.getDeterministicAbstractPlaceholder(abstractBuff.getName());
    }

    showDescription() {
        const bufferSpace = 10;

        // Get the container's world position
        const containerWorldPosition = this.container.getWorldTransformMatrix();

        let descX = containerWorldPosition.tx - this.tooltipBox.width / 2 - bufferSpace;
        let descY = containerWorldPosition.ty;

        // If too close to the left edge, show on the right side instead
        if (descX < 0) {
            descX = containerWorldPosition.tx + this.container.width / 2 + this.tooltipBox.width / 2 + bufferSpace;
        }

        // Adjust Y position if it goes off screen
        const screenWidth = this.scene.sys.game.config.width as number;
        const screenHeight = this.scene.sys.game.config.height as number;
        if (descY + this.tooltipBox.height / 2 > screenHeight) {
            descY = screenHeight - this.tooltipBox.height / 2 - bufferSpace;
        } else if (descY - this.tooltipBox.height / 2 < 0) {
            descY = this.tooltipBox.height / 2 + bufferSpace;
        }

        this.tooltipBox.setPosition(descX, descY);
        this.tooltipBox.setVisible(true);
        this.tooltipBox.setDepth(1000); // Ensure the tooltip is above all other elements
        this.updateText();
    }

    hideDescription() {
        this.tooltipBox.setVisible(false);
    }

    updateText() {
        // Update the text to reflect current stack count
        this.stacksText.setText(`${this.abstractBuff.stacks}`);
        // Update the description text in case it has changed
        this.tooltipBox.setText(`${this.abstractBuff.getName()}: ${this.abstractBuff.getDescription()}`);
    }

    destroy() {
        this.container.destroy();
        this.tooltipBox.destroy();
    }
}


// Add subclasses for location buffs

export class CurrentLocationBuff extends AbstractBuff {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super();
        this.imageName = 'current_location_icon'; // Ensure this texture is loaded
    }

    getName(): string {
        return 'Current Location';
    }

    getDescription(): string {
        return 'This is your current location.';
    }
}

export class AdjacentLocationBuff extends AbstractBuff {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super();
        this.imageName = 'adjacent_location_icon'; // Ensure this texture is loaded
    }

    getName(): string {
        return 'Adjacent Location';
    }

    getDescription(): string {
        return 'This location is adjacent to your current position.';
    }
}

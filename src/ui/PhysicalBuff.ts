import { AbstractBuff } from '../gamecharacters/buffs/AbstractBuff';
import { TextBox } from './TextBox';

export class PhysicalBuff {
    text: Phaser.GameObjects.Text;
    abstractBuff: AbstractBuff;
    container: Phaser.GameObjects.Container;
    image: Phaser.GameObjects.Image;
    tooltipBox: TextBox;
    scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, abstractBuff: AbstractBuff) {
        this.scene = scene;
        this.abstractBuff = abstractBuff;
        this.container = scene.add.container(x, y);

        // Create the image
        this.image = scene.add.image(0, 0, abstractBuff.imageName);
        this.image.setScale(0.5); // Adjust scale as needed

        // Create the text
        this.text = scene.add.text(0, 0, `${abstractBuff.stacks}`, {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        this.text.setOrigin(0.5); // Center the text

        // Create the description box (initially hidden)
        this.tooltipBox = new TextBox({
            scene: this.scene,
            width: 200,
            height: 100,
            text: this.abstractBuff.getDescription(),
            textBoxName: `${this.abstractBuff.getName()}Description`
        });
        this.tooltipBox.setVisible(false);

        // Add image and text to the container
        // Set the size of the container
        const containerSize = 40; // Adjust this value as needed
        this.container.setSize(containerSize, containerSize);

        // Resize the image to fit the container
        this.image.setDisplaySize(containerSize, containerSize);
        
        // Center the image and text in the container
        this.image.setPosition(0, 0);
        this.text.setPosition(0, 0);
        this.container.add([this.image, this.text]);

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

    showDescription() {
        const bufferSpace = 10;

        // Get the container's world position
        const containerWorldPosition = this.container.getWorldTransformMatrix();

        let descX = containerWorldPosition.tx - this.tooltipBox.background!.width / 2 - bufferSpace;
        let descY = containerWorldPosition.ty;

        // If too close to the left edge, show on the right side instead
        if (descX < 0) {
            descX = containerWorldPosition.tx + this.container.width / 2 + this.tooltipBox.background!.width / 2 + bufferSpace;
        }

        // Adjust Y position if it goes off screen
        const screenWidth = this.scene.sys.game.config.width as number;
        const screenHeight = this.scene.sys.game.config.height as number;
        if (descY + this.tooltipBox.background!.height / 2 > screenHeight) {
            descY = screenHeight - this.tooltipBox.background!.height / 2 - bufferSpace;
        } else if (descY - this.tooltipBox.background!.height / 2 < 0) {
            descY = this.tooltipBox.background!.height / 2 + bufferSpace;
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
        this.text.setText(`${this.abstractBuff.stacks}`);
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
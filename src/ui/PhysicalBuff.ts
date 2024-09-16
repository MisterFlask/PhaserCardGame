import { generateWordGuid } from '../gamecharacters/AbstractCard';
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractCombatEvent } from './PhysicalCard';
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

        // Add mouse over and mouse out events
        this.container.setInteractive(new Phaser.Geom.Rectangle(-20, -20, 40, 40), Phaser.Geom.Rectangle.Contains);
        this.container.on('pointerover', this.showDescription, this);
        this.container.on('pointerout', this.hideDescription, this);
    }

    showDescription() {
        const screenWidth = this.scene.sys.game.config.width as number;
        const screenHeight = this.scene.sys.game.config.height as number;
        const bufferSpace = 10;

        let descX = this.container.x - this.tooltipBox.background!.width / 2 - bufferSpace;
        let descY = this.container.y;

        // If too close to the left edge, show on the right side instead
        if (descX < 0) {
            descX = this.container.x + this.container.width / 2 + this.tooltipBox.background!.width / 2 + bufferSpace;
        }

        // Adjust Y position if it goes off screen
        if (descY + this.tooltipBox.background!.height / 2 > screenHeight) {
            descY = screenHeight - this.tooltipBox.background!.height / 2 - bufferSpace;
        } else if (descY - this.tooltipBox.background!.height / 2 < 0) {
            descY = this.tooltipBox.background!.height / 2 + bufferSpace;
        }

        this.tooltipBox.setPosition(descX, descY);
        this.tooltipBox.setVisible(true);
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


export abstract class AbstractBuff {

    public static applyBuffToCharacter(character: BaseCharacter, buff: AbstractBuff){
        // Check if the character already has a buff of the same type
        let existingBuff = character.buffs.find(existingBuff => existingBuff.constructor === buff.constructor);
        if (existingBuff) {
            existingBuff = existingBuff as AbstractBuff
            if (existingBuff.stackable) {
                // If the buff is stackable, increase its stack count
                existingBuff.stacks = ((existingBuff as any).stacks || 1) + 1;
            }else{
            // If the buff is not stackable, we'll just log this information
            console.log(`Buff ${existingBuff.getName()} is not stackable. Ignoring new application.`);
            }
            // If not stackable, we don't add a new one or modify the existing one
        } else {
            // If the buff doesn't exist, add it to the character's buffs
            character.buffs.push(buff);
        }
    }

    imageName: string = "PLACEHOLDER_IMAGE";
    id: string = generateWordGuid();
    stackable: boolean = true;
    stacks: number = 1;

    abstract getName(): string;
    abstract getDescription(): string;


    getCombatDamageDealtModifier(): number {
        return 0;
    }
    getBlockDealtModifier(): number {
        return 0;
    }
    getCombatDamageTakenModifier(): number {
        return 0;
    }
    getBlockTakenModifier(): number {
        return 0;
    }
    onEvent(item: AbstractCombatEvent){
        
    }
    

}
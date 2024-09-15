import { generateWordGuid } from '../gamecharacters/AbstractCard';
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { AbstractCombatEvent } from './PhysicalCard';
import { TextBox } from "./TextBox";

export class PhysicalBuff {
    text: TextBox;
    abstractBuff: AbstractBuff;
    container: Phaser.GameObjects.Container;
    image: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, abstractBuff: AbstractBuff) {
        // Initialize text with proper parameters
        this.text = new TextBox({
            scene: scene,
            x: 0, // Centered relative to the buff icon
            y: 0,
            width: 50,
            height: 20,
            text: `${abstractBuff.stacks}`, // Display stack count
            style: { fontSize: '14px', color: '#ffffff', fontFamily: 'Arial' },
            fillColor: 0x000000 // Semi-transparent background for readability
        }); // Initialize text

        this.abstractBuff = abstractBuff;
        this.container = scene.add.container(x, y);

        // Create the image
        this.image = scene.add.image(0, 0, abstractBuff.imageName);
        this.image.setScale(0.5); // Adjust scale as needed

        // Position the text over the image
        this.text.setPosition(0, 0);

        // Add image and text to the container
        this.container.add([this.image, this.text.background!!, this.text.text]);
    }

    update() {
        // Update the text to reflect current stack count
        this.text.setText(`${this.abstractBuff.stacks}`);
    }

    destroy() {
        this.container.destroy();
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
import { AbstractBuff } from '../gamecharacters/buffs/AbstractBuff';
import ImageUtils from '../utils/ImageUtils';
import { ShadowedImage } from './ShadowedImage';
import { TooltipAttachment } from './TooltipAttachment';

export class PhysicalBuff {
    abstractBuff: AbstractBuff;
    container: Phaser.GameObjects.Container;
    image!: Phaser.GameObjects.Image;
    stacksText: Phaser.GameObjects.Text;
    secondaryStacksText: Phaser.GameObjects.Text;
    tooltipAttachment: TooltipAttachment;
    scene: Phaser.Scene;
    shadowImage!: Phaser.GameObjects.Image;

    constructor(scene: Phaser.Scene, x: number, y: number, abstractBuff: AbstractBuff) {
        this.scene = scene;
        this.abstractBuff = abstractBuff;
        this.container = scene.add.container(x, y);
        const containerSize = 40;

        this.setBuffImage(scene, abstractBuff, containerSize);
        
        this.stacksText = scene.add.text(0, 0, `${abstractBuff.stacks}`, {
            fontSize: '19px',
            color: '#ffffff',
            fontFamily: 'Arial',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.stacksText.setOrigin(0, 1);

        this.secondaryStacksText = scene.add.text(0, 0, '', {
            fontSize: '19px',
            color: '#ffff00',
            fontFamily: 'Arial',
            align: 'left',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.secondaryStacksText.setOrigin(0, 1);

        this.tooltipAttachment = new TooltipAttachment({
            scene: this.scene,
            container: this.container,
            tooltipText: `${this.abstractBuff.getDisplayName()}: ${this.abstractBuff.getDescription()}`
        });

        this.container.setSize(containerSize, containerSize);

        const halfContainerSize = containerSize / 2;
        this.stacksText.setPosition(-halfContainerSize + 6, halfContainerSize - 20);
        this.secondaryStacksText.setPosition(-halfContainerSize + 6, halfContainerSize - 6);
        
        this.container.add([this.stacksText, this.secondaryStacksText]);

        this.container.setInteractive(new Phaser.Geom.Rectangle(-containerSize / 2, -containerSize / 2, containerSize, containerSize), Phaser.Geom.Rectangle.Contains);

        this.scene.tweens.add({
            targets: this.container,
            scale: { from: 1, to: 1.2 },
            duration: 200,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                this.container.setScale(1);
            }
        });

        this.scene.events.on('pulseBuff', this.handlePulseEvent, this);
    }

    private handlePulseEvent = (buffId: string) => {
        if (this.abstractBuff.id === buffId) {
            this.pulse();
        }
    }

    private setBuffImage(scene: Phaser.Scene, abstractBuff: AbstractBuff, containerSize: number) {
        const imageFileName = !scene.textures.exists(abstractBuff.imageName) 
            ? this.getAbstractIcon(abstractBuff)
            : abstractBuff.imageName;

        const shadowedImage = new ShadowedImage({
            scene,
            texture: imageFileName,
            displaySize: containerSize,
            tint: scene.textures.exists(abstractBuff.imageName) ? undefined : abstractBuff.generateSeededRandomBuffColor()
        });

        this.container.add(shadowedImage);
        this.image = shadowedImage.mainImage;
        this.shadowImage = shadowedImage.shadowImage;
    }

    private getAbstractIcon(abstractBuff: AbstractBuff) {
        return ImageUtils.getDeterministicAbstractPlaceholder(abstractBuff.getDisplayName());
    }

    updateText() {
        this.stacksText.setText(`${this.abstractBuff.stacks}`);
        
        if (this.abstractBuff.showSecondaryStacks && this.abstractBuff.secondaryStacks >= 0) {
            this.secondaryStacksText.setText(`/${this.abstractBuff.secondaryStacks}`);
            this.secondaryStacksText.setVisible(true);
        } else {
            this.secondaryStacksText.setVisible(false);
        }
        
        this.tooltipAttachment.updateText(`${this.abstractBuff.getDisplayName()}: ${this.abstractBuff.getDescription()}`);
    }

    destroy() {
        this.scene.events.off('pulseBuff', this.handlePulseEvent, this);
        this.tooltipAttachment.destroy();
        this.container.destroy();
    }

    pulse() {
        const originalScale = this.container.scale;

        this.scene.tweens.add({
            targets: this.container,
            scaleX: originalScale * 1.5,
            scaleY: originalScale * 1.5,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut',
            onComplete: () => {
                this.container.setScale(originalScale);
            }
        });
    }
}

export class CurrentLocationBuff extends AbstractBuff {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super();
        this.imageName = 'current_location_icon';
    }

    getDisplayName(): string {
        return 'Current Location';
    }

    getDescription(): string {
        return 'This is your current location.';
    }
}

export class AdjacentLocationBuff extends AbstractBuff {
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super();
        this.imageName = 'adjacent_location_icon';
    }

    getDisplayName(): string {
        return 'Adjacent Location';
    }

    getDescription(): string {
        return 'This location is adjacent to your current position.';
    }
}

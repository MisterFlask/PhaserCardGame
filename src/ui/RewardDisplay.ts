import { TextBox } from './TextBox';
import { TooltipAttachment } from './TooltipAttachment';

export class RewardDisplay extends TextBox {
    private tooltipAttachment: TooltipAttachment;

    constructor(params: {
        scene: Phaser.Scene,
        x: number,
        y: number,
        text: string,
        iconTexture: string,
        tooltipText: string,
        onClick: () => void
    }) {
        super({
            scene: params.scene,
            x: params.x,
            y: params.y,
            width: 200,
            height: 80,
            text: params.text,
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444,
            textBoxName: 'RewardDisplay'
        });

        // Add icon
        const icon = this.scene.add.image(0, 0, params.iconTexture);
        icon.setScale(0.5);
        this.add(icon);

        // Add tooltip
        this.tooltipAttachment = new TooltipAttachment({
            scene: this.scene,
            container: this,
            tooltipText: params.tooltipText,
        });

        // Add click behavior
        this.setInteractive({ useHandCursor: true })
            .on('pointerdown', params.onClick);
    }
} 
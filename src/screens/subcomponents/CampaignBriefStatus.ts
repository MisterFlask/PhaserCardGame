import { GameState } from "../../rules/GameState";
import { TextBox } from "../../ui/TextBox";

export class CampaignBriefStatus extends Phaser.GameObjects.Container {
    private surfaceCurrencyText: TextBox;
    private hellCurrencyText: TextBox;

    constructor(scene: Phaser.Scene) {
        super(scene, 10, 10);
        console.log('CampaignBriefStatus constructor called');

        // Create currency displays
        this.surfaceCurrencyText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 10,
            width: 180,
            height: 30,
            text: `Surface Currency: ${GameState.getInstance().surfaceCurrency}`,
            style: { 
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        });
        console.log('Surface currency text created:', this.surfaceCurrencyText);

        this.hellCurrencyText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 45,
            width: 180, 
            height: 30,
            text: `Hell Currency: ${GameState.getInstance().hellCurrency}`,
            style: {
                fontSize: '16px',
                color: '#ff4444',
                fontFamily: 'Arial'
            }
        });
        console.log('Hell currency text created:', this.hellCurrencyText);

        // Add everything to this container
        this.add([this.surfaceCurrencyText, this.hellCurrencyText]);
        console.log('Added elements to container. Container:', this);

        // Set up update listener
        scene.events.on('update', this.updateCurrencyDisplay, this);
    }

    private updateCurrencyDisplay(): void {
        const gameState = GameState.getInstance();

        this.surfaceCurrencyText.setText(`Surface Currency: ${gameState.surfaceCurrency}`);
        this.hellCurrencyText.setText(`Hell Currency: ${gameState.hellCurrency}`);
    }

    public setPosition(x: number, y: number): this {
        return super.setPosition(x, y);
    }

    public destroy(fromScene?: boolean): void {
        console.log('Destroying CampaignBriefStatus');
        this.scene.events.off('update', this.updateCurrencyDisplay, this);
        super.destroy(fromScene);
    }
}

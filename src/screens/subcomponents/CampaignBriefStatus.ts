import { GameState } from "../../rules/GameState";
import { PhysicalRelic } from "../../ui/PhysicalRelic";
import { TextBox } from "../../ui/TextBox";

export class CampaignBriefStatus extends Phaser.GameObjects.Container {
    private surfaceCurrencyText: TextBox;
    private hellCurrencyText: TextBox;
    private relicContainer: Phaser.GameObjects.Container;
    private readonly CURRENCY_WIDTH = 180;
    private readonly RELIC_GRID_WIDTH = 900; // 5x currency width
    private readonly RELIC_GRID_HEIGHT = 60; // 2x currency height
    private readonly RELIC_SIZE = 44; 
    private readonly RELIC_PADDING = 6;

    constructor(scene: Phaser.Scene) {
        super(scene, 10, 10);

        // Create currency displays
        this.surfaceCurrencyText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 10,
            width: this.CURRENCY_WIDTH,
            height: 30,
            text: `Surface Currency: ${GameState.getInstance().surfaceCurrency}`,
            style: { 
                fontSize: '16px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        });

        this.hellCurrencyText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 45,
            width: this.CURRENCY_WIDTH,
            height: 30,
            text: `Hell Currency: ${GameState.getInstance().hellCurrency}`,
            style: {
                fontSize: '16px',
                color: '#ff4444',
                fontFamily: 'Arial'
            }
        });

        // Create relic container
        this.relicContainer = new Phaser.GameObjects.Container(scene, this.CURRENCY_WIDTH + 20, 10);
        this.updateRelicDisplay();

        // Add everything to this container
        this.add([this.surfaceCurrencyText, this.hellCurrencyText, this.relicContainer]);

        // Set up update listener
        scene.events.on('update', this.updateCurrencyDisplay, this);
        scene.events.on('propagateGameStateChangesToUi', this.updateRelicDisplay, this);
    }

    private updateRelicDisplay(): void {
        console.log('Updating relic display because propagateGameStateChangesToUi was emitted');
        // Clear existing relics
        this.relicContainer.removeAll(true);

        const relics = GameState.getInstance().relicsInventory;
        const relicsPerRow = Math.floor(this.RELIC_GRID_WIDTH / (this.RELIC_SIZE + this.RELIC_PADDING));

        relics.forEach((relic, index) => {
            const row = Math.floor(index / relicsPerRow);
            const col = index % relicsPerRow;

            const x = col * (this.RELIC_SIZE + this.RELIC_PADDING);
            const y = row * (this.RELIC_SIZE + this.RELIC_PADDING);

            const physicalRelic = new PhysicalRelic({
                scene: this.scene,
                x,
                y,
                abstractRelic: relic,
                baseSize: this.RELIC_SIZE
            });

            // Hide the price box since we're just displaying owned relics
            physicalRelic.priceBox?.setVisible(false);
            
            this.relicContainer.add(physicalRelic);
        });
    }

    private updateCurrencyDisplay(): void {
        const gameState = GameState.getInstance();
        this.surfaceCurrencyText.setText(`Surface Currency: ${gameState.surfaceCurrency}`);
        this.hellCurrencyText.setText(`Hell Currency: ${gameState.hellCurrency}`);
    }

    public destroy(fromScene?: boolean): void {
        this.scene?.events?.off('update', this.updateCurrencyDisplay, this);
        this.scene?.events?.off('relicsChanged', this.updateRelicDisplay, this);
        super.destroy(fromScene);
    }

}

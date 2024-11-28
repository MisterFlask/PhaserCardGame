import { GameState } from "../../rules/GameState";
import { PhysicalRelic } from "../../ui/PhysicalRelic";
import { TextBox } from "../../ui/TextBox";
import { TooltipAttachment } from "../../ui/TooltipAttachment";

export class CampaignBriefStatus extends Phaser.GameObjects.Container {
    private surfaceCurrencyText: TextBox;
    private hellCurrencyText: TextBox;
    private brimstoneDistillateText: TextBox;
    private brimstoneTooltip: TooltipAttachment;
    private hellCurrencyTooltip: TooltipAttachment;
    private surfaceCurrencyTooltip: TooltipAttachment;
    private relicContainer: Phaser.GameObjects.Container;
    private readonly CURRENCY_WIDTH = 180;
    private readonly RELIC_GRID_WIDTH = 900; // 5x currency width
    private readonly RELIC_GRID_HEIGHT = 60; // 2x currency height
    private readonly RELIC_SIZE = 44; 
    private readonly RELIC_PADDING = 6;
    private readonly BASE_RELIC_DEPTH = 100;
    private readonly HOVER_RELIC_DEPTH = 1000;

    constructor(scene: Phaser.Scene) {
        super(scene, 10, 10);

        if (!this.scene){
            console.error("No scene provided to CampaignBriefStatus");
            throw new Error("No scene provided to CampaignBriefStatus");
        }

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

        // Add tooltip to surface currency display
        this.surfaceCurrencyTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.surfaceCurrencyText,
            tooltipText: "Utterly worthless and inaccessible in Hell but i guess it's nice to know you have it",
            fillColor: 0x333333  // Dark gray background for surface currency tooltip
        });

        var brimstoneDistillate: number = GameState.getInstance().brimstoneDistillate;



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

        // Add tooltip to hell currency display
        this.hellCurrencyTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.hellCurrencyText,
            tooltipText: "Can't be brought back to the surface because something something Charon is a bastard",
            fillColor: 0x440000  // Dark red background for hell currency tooltip
        });

        // Add brimstone distillate display
        this.brimstoneDistillateText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 80,  // Position below hell currency
            width: this.CURRENCY_WIDTH,
            height: 30,
            text: `Brimstone: ${GameState.getInstance().brimstoneDistillate}`,
            style: {
                fontSize: '16px',
                color: '#8B0000',  // Dark red color for brimstone
                fontFamily: 'Arial'
            },
            fillColor: 0x200000  // Very dark red background
        });

        // Add tooltip to brimstone display
        this.brimstoneTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.brimstoneDistillateText,
            tooltipText: "Brimstone Distillate: Sells for a bunch of money on the surface, but worthless in Hell.",
            fillColor: 0x200000  // Optional dark red background
        });

        // Create relic container
        this.relicContainer = new Phaser.GameObjects.Container(scene, this.CURRENCY_WIDTH + 20, 10);
        this.updateRelicDisplay();

        // Add everything to this container
        this.add([
            this.surfaceCurrencyText, 
            this.hellCurrencyText, 
            this.brimstoneDistillateText,
            this.relicContainer
        ]);

        // Set up update listener
        scene.events.on('update', this.updateCurrencyDisplay, this);
        scene.events.on('propagateGameStateChangesToUi', this.updateRelicDisplay, this);
    }

    private updateRelicDisplay(): void {
        console.log('Updating relic display because propagateGameStateChangesToUi was emitted');
        this.relicContainer.removeAll(true);

        const relics = GameState.getInstance().relicsInventory;
        const relicsPerRow = Math.floor(this.RELIC_GRID_WIDTH / (this.RELIC_SIZE + this.RELIC_PADDING));
        var scene = this.scene;

        relics.forEach((relic, index) => {
            const row = Math.floor(index / relicsPerRow);
            const col = index % relicsPerRow;

            const x = col * (this.RELIC_SIZE + this.RELIC_PADDING);
            const y = row * (this.RELIC_SIZE + this.RELIC_PADDING);

            const physicalRelic = new PhysicalRelic({
                scene: scene,
                x,
                y,
                abstractRelic: relic,
                baseSize: this.RELIC_SIZE
            });

            physicalRelic.setDepth(this.BASE_RELIC_DEPTH);
            physicalRelic.priceBox?.setVisible(false);
            
            physicalRelic.on('pointerover', () => {
                physicalRelic.setDepth(this.HOVER_RELIC_DEPTH);
            });

            physicalRelic.on('pointerout', () => {
                physicalRelic.setDepth(this.BASE_RELIC_DEPTH);
            });
            
            this.relicContainer.add(physicalRelic);
        });
    }

    private updateCurrencyDisplay(): void {
        const gameState = GameState.getInstance();
        this.surfaceCurrencyText.setText(`Surface Currency: ${gameState.surfaceCurrency}`);
        this.hellCurrencyText.setText(`Hell Currency: ${gameState.hellCurrency}`);
        this.brimstoneDistillateText.setText(`Brimstone: ${gameState.brimstoneDistillate}`);
    }

    public destroy(fromScene?: boolean): void {
        this.brimstoneTooltip.destroy();
        this.hellCurrencyTooltip.destroy();
        this.surfaceCurrencyTooltip.destroy();
        this.scene?.events?.off('update', this.updateCurrencyDisplay, this);
        this.scene?.events?.off('propagateGameStateChangesToUi', this.updateRelicDisplay, this);
        super.destroy(fromScene);
    }

}

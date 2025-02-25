import { GameState } from "../../rules/GameState";
import { PhysicalRelic } from "../../ui/PhysicalRelic";
import { TextBox } from "../../ui/TextBox";
import { TooltipAttachment } from "../../ui/TooltipAttachment";

export class CampaignBriefStatus extends Phaser.GameObjects.Container {
    private actNumberText: TextBox;
    private combinedCurrencyText: TextBox;
    private combinedCurrencyTooltip: TooltipAttachment;
    private relicContainer: Phaser.GameObjects.Container;
    private readonly CURRENCY_WIDTH = 280;
    private readonly RELIC_GRID_WIDTH = 900; // 5x currency width
    private readonly RELIC_GRID_HEIGHT = 60; // 2x currency height
    private readonly RELIC_SIZE = 44; 
    private readonly RELIC_PADDING = 6;
    private readonly BASE_RELIC_DEPTH = 100;
    private readonly HOVER_RELIC_DEPTH = 1000;
    private areRelicsActivatable: boolean = false;
    constructor(scene: Phaser.Scene, areRelicsActivatable: boolean) {
        super(scene, 10, 10);

        this.areRelicsActivatable = areRelicsActivatable;
        if (!this.scene){
            console.error("No scene provided to CampaignBriefStatus");
            throw new Error("No scene provided to CampaignBriefStatus");
        }

        // Add act number display
        this.actNumberText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 10,
            width: this.CURRENCY_WIDTH,
            height: 30,
            text: `Act ${GameState.getInstance().currentAct}`,
            style: {
                fontSize: '18px',
                color: '#ffd700', // Gold color for act number
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        });

        // Combined hell currency and promissory notes display
        this.combinedCurrencyText = new TextBox({
            scene: this.scene,
            x: 10,
            y: 45,
            width: this.CURRENCY_WIDTH,
            height: 30,
            text: `🪙 ${GameState.getInstance().denarians} | 📝 ${GameState.getInstance().promissoryNotes}`,
            style: {
                fontSize: '16px',
                color: '#ff4444',
                fontFamily: 'Arial'
            }
        });
        // Make the combined currency text interactive so that tooltip hover events are registered
        this.combinedCurrencyText.setInteractive();

        // Add tooltip to combined currency display
        this.combinedCurrencyTooltip = new TooltipAttachment({
            scene: this.scene,
            container: this.combinedCurrencyText,
            tooltipText: "🪙 Denarians: Currency spent in Hell\n📝 Promissory Notes: Converted to money if expedition succeeds",
            fillColor: 0x440000
        });

        // Create relic container
        this.relicContainer = new Phaser.GameObjects.Container(scene, this.CURRENCY_WIDTH + 20, 10);
        this.updateRelicDisplay();

        // Add everything to this container
        this.add([
            this.actNumberText,
            this.combinedCurrencyText,
            this.relicContainer
        ]);

        // Set up update listener
        scene.events.on('update', this.updateCurrencyDisplay, this);
        scene.events.on('propagateGameStateChangesToUi', this.updateRelicDisplay, this);
        scene.events.on('update', this.updateRelicStacksDisplay, this);
        if (this.areRelicsActivatable) {
            scene.events.on('relic_pointerdown', this.handleRelicPointerDown, this);
        }
    }

    private handleRelicPointerDown(relic: PhysicalRelic): void {
        console.log('Relic pointer down event received');
        relic.abstractRelic.onClicked();
    }

    updateRelicStacksDisplay(arg0: string, updateRelicStacksDisplay: any, arg2: this) {
        // Update stacks display for each physical relic
        this.relicContainer.each((child: Phaser.GameObjects.GameObject) => {
            if (child instanceof PhysicalRelic) {
                child.updateStacksDisplay();
            }
        });
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

            physicalRelic.currentlyActivatable = this.areRelicsActivatable;

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
        this.actNumberText.setText(`Act ${gameState.currentAct}`);
        this.combinedCurrencyText.setText(`🪙 ${gameState.denarians} | 📝 ${gameState.promissoryNotes}`);
    }

    public destroy(fromScene?: boolean): void {
        this.combinedCurrencyTooltip.destroy();
        this.scene?.events?.off('update', this.updateCurrencyDisplay, this);
        this.scene?.events?.off('propagateGameStateChangesToUi', this.updateRelicDisplay, this);
        super.destroy(fromScene);
    }
}

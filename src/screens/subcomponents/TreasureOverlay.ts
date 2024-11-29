import { TreasureChest } from '../../encounters/Encounters';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { PhysicalRelic } from '../../ui/PhysicalRelic';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';

export class TreasureOverlay extends Phaser.GameObjects.Container {
    private chest?: TreasureChest;
    private isVisible: boolean = false;
    private background: Phaser.GameObjects.Rectangle;
    private relicDisplay?: PhysicalRelic;
    private cancelButton: TextBoxButton;
    private titleText: TextBoxButton;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);

        if (!scene){
            console.error("No scene provided to TreasureOverlay");
            throw new Error("No scene provided to TreasureOverlay");
        }
        
        // Set proper depth for the overlay
        this.setDepth(DepthManager.getInstance().SHOP_OVERLAY + 1);
        
        // Create background to cover full screen
        const { width, height } = scene.scale;
        this.background = scene.add.rectangle(
            width/2,  // Center of screen
            height/2, 
            width, 
            height, 
            0x000000, 
            0.7
        );
        this.add(this.background);
        
        // Add the title text
        this.titleText = new TextBoxButton({
            scene: this.scene,
            x: width/2,
            y: height/2 - 200, // Position above where relic will be
            width: 400,
            height: 60,
            text: 'SEIZE WHAT IS YOURS!',
            textBoxName: 'treasureTitleText',
            fillColor: 0x555555
        });
        this.titleText.setInteractive(false); // Make it non-interactive since it's just display text
        this.add(this.titleText);
        
        // Create the cancel button
        this.cancelButton = new TextBoxButton({
            scene: this.scene,
            x: width/2,
            y: height/2 + 200, // Position below where relic will be
            width: 200,
            height: 50,
            text: 'Perhaps not',
            textBoxName: 'treasureCancelButton',
            fillColor: 0x555555
        });
        
        this.cancelButton.onClick(() => this.hide());
        this.add(this.cancelButton);
        
        // Initially hide the overlay
        this.setVisible(false);
        
        // Add the container to the scene's display list
        scene.add.existing(this);
    }

    private createRelicDisplay(): void {

        // Remove existing relic display if it exists
        this.relicDisplay?.destroy();
        
        if (!this.chest) {
            console.error("No chest provided to createRelicDisplay");
            throw new Error("No chest provided to createRelicDisplay");
        }

        if (!this.chest.relic) {
            console.log('No relic to display');
            return;
        }
        
        // Create new PhysicalRelic
        this.relicDisplay = new PhysicalRelic({
            scene: this.scene,
            x: 0,  // Will be centered in container
            y: 0,
            abstractRelic: this.chest.relic,
            baseSize: 128  // Larger size for better visibility
        });

        // Add listener for 'relic_pointerdown' events from PhysicalRelic
        this.relicDisplay.on('relic_pointerdown', this.handleRelicPointerDown, this);

        // Add the relic display to our overlay
        this.add(this.relicDisplay);
        
        // Center the relic display in the screen
        this.relicDisplay.setPosition(
            this.scene.scale.width / 2,
            this.scene.scale.height / 2
        );
    }

    public handleCardClickOnTreasureChest(card: AbstractCard): void {
        
        if (card instanceof BaseCharacter && card.name === new TreasureChest().name) {
            console.log('Treasure clicked');
            this.chest = card as TreasureChest;
            
            // Verify that a relic was retrieved successfully
            if (this.chest) {
                console.log(`Selected relic: ${this.chest.relic?.name}`);
                this.show();
            } else {
                console.log('Failed to retrieve a relic');
            }
        }
    }

    public show(): void {
        
        console.log('Showing TreasureOverlay');
        this.createRelicDisplay();
        this.setVisible(true);
        this.isVisible = true;
        UIContextManager.getInstance().setContext(UIContext.SHOP);
    }

    public hide(): void {
        this.setVisible(false);
        this.isVisible = false;
        UIContextManager.getInstance().setContext(UIContext.COMBAT);
    }
    
    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    private handleRelicPointerDown(physicalRelic: PhysicalRelic): void {
        console.log('TreasureOverlay received a pointerdown event from PhysicalRelic: ', physicalRelic);

        if (!this.isVisible) return;

        if (!physicalRelic?.abstractRelic){
            console.error("No relic provided to handleRelicPointerDown");
            throw new Error("No relic provided to handleRelicPointerDown");
        }

        console.log('Adding relic to player from treasure overlay');
        ActionManager.getInstance().addRelicToInventory(physicalRelic.abstractRelic);
        this.chest!.relic = undefined;

        this.hide();
    }
} 
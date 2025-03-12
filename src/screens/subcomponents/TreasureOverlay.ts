import { TreasureChest } from '../../encounters/EncounterManager';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { BaseCharacter } from '../../gamecharacters/BaseCharacter';
import { AbstractRelic } from '../../relics/AbstractRelic';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { PhysicalRelic } from '../../ui/PhysicalRelic';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { ActionManager } from '../../utils/ActionManager';

export class TreasureOverlay extends Phaser.GameObjects.Container {
    private chest?: TreasureChest;
    private isVisible: boolean = false;
    private background: Phaser.GameObjects.Rectangle;
    private relicDisplays: PhysicalRelic[] = [];
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
            y: height/2 - 200, // Position above where relics will be
            width: 400,
            height: 60,
            text: 'Choose one treasure.',
            textBoxName: 'treasureTitleText',
            fillColor: 0x555555
        });
        this.titleText.setInteractive(false);
        this.add(this.titleText);
        
        // Create the cancel button
        this.cancelButton = new TextBoxButton({
            scene: this.scene,
            x: width/2,
            y: height/2 + 200, // Position below where relics will be
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

    private createRelicDisplays(): void {
        // Clear existing relic displays
        this.relicDisplays.forEach(display => display.destroy());
        this.relicDisplays = [];
        
        if (!this.chest) {
            console.error("No chest provided to createRelicDisplays");
            throw new Error("No chest provided to createRelicDisplays");
        }

        if (!this.chest.relics || this.chest.relics.length === 0) {
            console.log('No relics to display');
            return;
        }

        // Calculate positions for two relics
        const spacing = 300; // Space between relics
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        this.chest.relics.forEach((relic: AbstractRelic, index: number) => {
            if (!relic) return;

            const xPos = centerX + (index === 0 ? -spacing/2 : spacing/2);
            const relicDisplay = new PhysicalRelic({
                scene: this.scene,
                x: xPos,
                y: centerY,
                abstractRelic: relic,
                baseSize: 128
            });

            relicDisplay.on('relic_pointerdown', () => this.handleRelicPointerDown(relicDisplay), this);
            this.relicDisplays.push(relicDisplay);
            this.add(relicDisplay);
        });
    }

    public handleCardClickOnTreasureChest(card: AbstractCard): void {
        if (card instanceof BaseCharacter && card.name === new TreasureChest().name) {
            console.log('Treasure clicked');
            this.chest = card as TreasureChest;
            
            if (this.chest) {
                console.log(`Selected relics: ${this.chest.relics?.map(r => r?.getDisplayName()).join(', ')}`);
                this.show();
            } else {
                console.log('Failed to retrieve relics');
            }
        }
    }

    public show(): void {
        console.log('Showing TreasureOverlay');
        this.createRelicDisplays();
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
        this.chest!.relics = [];  // Clear all relics after choosing one

        this.hide();
    }
} 
import { Scene } from 'phaser';
import { PlayerCharacter } from '../../../../gamecharacters/BaseCharacterClass';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { AbstractRelic } from '../../../../relics/AbstractRelic';
import { GameState } from '../../../../rules/GameState';
import { TextBoxButton } from '../../../../ui/Button';
import { ShadowedImage } from '../../../../ui/ShadowedImage';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class LiquidationPanel extends AbstractHqPanel {
    private contentContainer: Phaser.GameObjects.Container;
    private totalValueText: TextBox;
    private profitButton: TextBoxButton;
    private backgroundOverlay: Phaser.GameObjects.Rectangle;
    private noItemsText: TextBox;

    constructor(scene: Scene) {
        super(scene, 'Liquidation Panel');

        // Add a semi-transparent black background that covers the entire screen
        this.backgroundOverlay = this.scene.add.rectangle(
            0, 0,
            this.scene.scale.width * 2,
            this.scene.scale.height * 2,
            0x000000,
            0.85
        );
        this.backgroundOverlay.setOrigin(0.5);
        this.backgroundOverlay.setDepth(998);
        this.add(this.backgroundOverlay);

        // Create a close/back button
        const closeButton = new TextBoxButton({
            scene: this.scene,
            x: this.scene.scale.width - 100,
            y: 50,
            width: 80,
            height: 40,
            text: 'Back',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444
        });
        closeButton.setDepth(1000);
        closeButton.onClick(() => this.returnToHub());
        this.add(closeButton);

        // Store reference to no items message
        this.noItemsText = new TextBox({
            scene: this.scene,
            x: scene.scale.width / 2,
            y: scene.scale.height / 3,
            width: 400,
            height: 50,
            text: 'No items available for liquidation.',
            style: { fontSize: '24px', color: '#ffffff' }
        });
        this.noItemsText.setDepth(1000);
        this.add(this.noItemsText);

        // Rest of your existing constructor code...
        this.contentContainer = this.scene.add.container(0, 0);
        this.contentContainer.setDepth(1000);
        this.add(this.contentContainer);

        // Modify your existing totalValueText to ensure it's visible
        this.totalValueText = new TextBox({
            scene: this.scene,
            x: scene.scale.width / 2,
            y: scene.scale.height - 100,
            width: 400,
            height: 50,
            text: 'Total Value: $0',
            style: { fontSize: '24px', color: '#ffff00' }
        });
        this.totalValueText.setDepth(1000);

        // Modify your existing profitButton to ensure it's visible
        this.profitButton = new TextBoxButton({
            scene: this.scene,
            x: scene.scale.width / 2,
            y: scene.scale.height - 50,
            width: 200,
            height: 50,
            text: 'Profit!',
            style: { fontSize: '24px', color: '#ffffff' },
            fillColor: 0x00aa00
        });
        this.profitButton.setDepth(1000);
        this.profitButton.onClick(() => this.handleProfit());

        this.add([this.totalValueText, this.profitButton]);
        this.displayValues();
    }

    private displayValues(): void {
        // Clear existing content
        this.contentContainer.removeAll(true);

        const gameState = GameState.getInstance();
        let yOffset = 100;
        let totalValue = 0;
        let hasItems = false;

        // Display values for each character's cards
        gameState.currentRunCharacters.forEach((character: PlayerCharacter) => {
            // Filter out cards that have a surfaceSellValue
            const sellableCards = gameState
                .getCardsOwnedByCharacter(character)
                .filter(card => card.surfaceSellValue > 0);

            // Only display if the character actually has cargo
            if (sellableCards.length > 0) {
                // Add character name
                const characterNameText = new TextBox({
                    scene: this.scene,
                    x: this.scene.scale.width / 2,
                    y: yOffset,
                    width: 400,
                    height: 30,
                    text: `${character.name}'s Cards:`,
                    style: { fontSize: '20px', color: '#ffffff' }
                });
                this.contentContainer.add(characterNameText);
                yOffset += 40;

                // Display the sellable cards
                sellableCards.forEach((card: PlayableCard) => {
                    this.createItemRow(
                        card.getEffectivePortraitName(this.scene),
                        `${card.name}: $${card.surfaceSellValue}`,
                        card.surfaceSellValue,
                        this.scene.scale.width / 2 - 200,
                        yOffset,
                        card.getEffectivePortraitTint(this.scene)
                    );
                    yOffset += 50;
                    totalValue += card.surfaceSellValue;
                    hasItems = true;
                });

                yOffset += 20;
            }
        });

        // Display values for relics
        if (gameState.relicsInventory.length > 0) {
            const relicsHeaderText = new TextBox({
                scene: this.scene,
                x: this.scene.scale.width / 2,
                y: yOffset,
                width: 400,
                height: 30,
                text: 'Relics:',
                style: { fontSize: '20px', color: '#ffffff' }
            });
            this.contentContainer.add(relicsHeaderText);
            yOffset += 40;

            gameState.relicsInventory.forEach((relic: AbstractRelic) => {
                if (relic.surfaceSellValue > 0) {
                    this.createItemRow(
                        relic.imageName,
                        `${relic.getDisplayName()}: $${relic.surfaceSellValue}`,
                        relic.surfaceSellValue,
                        this.scene.scale.width / 2 - 200,
                        yOffset,
                        relic.tint
                    );
                    yOffset += 50;
                    totalValue += relic.surfaceSellValue;
                    hasItems = true;
                }
            });
        }

        // After relics section, add promissory notes section
        const promissoryValue = gameState.promissoryNotes || 0;
        if (promissoryValue > 0) {
            const promissoryHeaderText = new TextBox({
                scene: this.scene,
                x: this.scene.scale.width / 2,
                y: yOffset,
                width: 400,
                height: 30,
                text: 'Promissory Notes:',
                style: { fontSize: '20px', color: '#ffffff' }
            });
            this.contentContainer.add(promissoryHeaderText);
            yOffset += 40;

            this.createItemRow(
                'promissory_note', // Make sure this texture exists
                `Promissory Notes: $${promissoryValue}`,
                promissoryValue,
                this.scene.scale.width / 2 - 200,
                yOffset
            );
            yOffset += 50;
            totalValue += promissoryValue;
            hasItems = hasItems || promissoryValue > 0;
        }

        // Show/hide the "no items" message and profit button
        this.noItemsText.setVisible(!hasItems);
        this.profitButton.setVisible(hasItems);

        // Update total value display
        this.totalValueText.setText(`Total Value: $${totalValue}`);

        // Ensure the content container is above the overlay
        this.contentContainer.setDepth(999);
    }

    // Slightly adjusted helper method to ensure icons appear on top of text
    private createItemRow(
        texture: string,
        displayText: string,
        value: number,
        xPos: number,
        yPos: number,
        tint?: number
    ): void {
        const rowContainer = this.scene.add.container(xPos, yPos);
        // Let the container itself have depth 999
        rowContainer.setDepth(999);

        // Add the label text first
        const itemLabel = new TextBox({
            scene: this.scene,
            x: 100,
            y: 0,
            width: 300,
            height: 25,
            text: displayText,
            style: { fontSize: '16px', color: '#ffffff' }
        });
        rowContainer.add(itemLabel);

        // Add the icon last so it appears above
        const itemImage = new ShadowedImage({
            scene: this.scene,
            texture,
            displaySize: 64,
            tint
        });
        // Slight scale if needed
        itemImage.setScale(0.8);
        rowContainer.add(itemImage);

        this.contentContainer.add(rowContainer);
    }

    private handleProfit(): void {
        const gameState = GameState.getInstance();
        let totalValue = 0;

        // Calculate total value from cards
        gameState.currentRunCharacters.forEach((character: PlayerCharacter) => {
            const characterCards = gameState.getCardsOwnedByCharacter(character);
            characterCards.forEach((card: PlayableCard) => {
                totalValue += card.surfaceSellValue;
            });
        });

        // Calculate total value from relics
        gameState.relicsInventory.forEach((relic: AbstractRelic) => {
            totalValue += relic.surfaceSellValue;
        });

        // Add promissory notes value
        totalValue += (gameState.promissoryNotes || 0);

        // Add value to surface currency
        gameState.moneyInVault += totalValue;
        
        // Clear promissory notes after converting to surface currency
        gameState.promissoryNotes = 0;

        // Return to hub
        gameState.cleanUpAfterLiquidation();
        CampaignUiState.getInstance().reinitializeCampaignUiStateAfterRun();
        this.returnToHub();
    }

    update(): void {
        // this.displayValues(); 
        // (no need to re-render every frame)
    }

    // Override the hide method to ensure proper cleanup
    hide(): void {
        super.hide();
        console.log('hiding liquidation panel.');
        this.backgroundOverlay.setVisible(false);
    }

    // Override the show method to ensure everything is visible
    show(): void {
        console.log('showing liquidation panel.');
        super.show();
        this.backgroundOverlay.setVisible(true);
        this.setDepth(999);
        this.displayValues();
    }
} 
import Phaser from 'phaser';
import { GameState } from '../rules/GameState';
import { CardGuiUtils } from '../utils/CardGuiUtils';
import { PhysicalCard } from './PhysicalCard';

export default class InventoryPanel {
    private scene: Phaser.Scene;
    private inventoryButton!: Phaser.GameObjects.Text;
    private inventoryPanel!: Phaser.GameObjects.Container;
    private cardsContainer!: Phaser.GameObjects.Container;
    private closeButton!: Phaser.GameObjects.Text;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.createInventoryButton();
    }

    private createInventoryButton(): void {
        this.inventoryButton = this.scene.add.text(10, 50, 'INVENTORY', { fontSize: '24px', color: '#fff', backgroundColor: '#000000', padding: { x: 10, y: 5 } })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', this.toggleInventory, this);

        // Initialize the inventory panel but keep it hidden
        this.inventoryPanel = this.scene.add.container(this.scene.scale.width / 2, this.scene.scale.height / 2).setVisible(false);

        // Background covering 80% of the screen
        const panelWidth = this.scene.scale.width * 0.8;
        const panelHeight = this.scene.scale.height * 0.8;
        const panelBg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x000000, 0.9).setOrigin(0.5);
        panelBg.setStrokeStyle(4, 0xffffff);

        // Close button
        this.closeButton = this.scene.add.text(panelWidth / 2 - 20, -panelHeight / 2 + 20, 'CLOSE', { fontSize: '20px', color: '#fff', backgroundColor: '#ff0000', padding: { x: 10, y: 5 } })
            .setOrigin(1, 0)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', this.toggleInventory, this);

        // Container for cards with scrolling capability
        this.cardsContainer = this.scene.add.container(0, 0);
        const maskShape = this.scene.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(-panelWidth / 2 + 20, -panelHeight / 2 + 60, panelWidth - 40, panelHeight - 80);
        const mask = maskShape.createGeometryMask();
        this.cardsContainer.setMask(mask);

        // Adding elements to the inventory panel
        this.inventoryPanel.add([panelBg, this.closeButton, this.cardsContainer]);
    }

    private toggleInventory = (): void => {
        this.inventoryPanel.setVisible(!this.inventoryPanel.visible);
        if (this.inventoryPanel.visible) {
            this.inventoryPanel.setDepth(Number.MAX_SAFE_INTEGER);
            this.updateInventoryPanel();
        }
    }

    private updateInventoryPanel(): void {
        const gameState = GameState.getInstance();
        const inventoryItems = gameState.getInventory();

        // Clear previous cards
        this.cardsContainer.removeAll(true);

        if (inventoryItems.length === 0) {
            const emptyText = this.scene.add.text(0, 0, 'Inventory is empty.', { fontSize: '18px', color: '#ffffff' })
                .setOrigin(0.5);
            this.cardsContainer.add(emptyText);
            return;
        }

        // Define layout parameters
        const panelWidth = this.scene.scale.width * 0.8;
        const panelHeight = this.scene.scale.height * 0.8;
        const cardWidth = 150;
        const cardHeight = 200;
        const padding = 20;
        const cardsPerRow = Math.floor((panelWidth - 40) / (cardWidth + padding));
        const rows = Math.ceil(inventoryItems.length / cardsPerRow);

        inventoryItems.forEach((item, index) => {
            const row = Math.floor(index / cardsPerRow);
            const col = index % cardsPerRow;

            const x = -panelWidth / 2 + padding + col * (cardWidth + padding) + cardWidth / 2;
            const y = -panelHeight / 2 + 60 + row * (cardHeight + padding) + cardHeight / 2;

            // Create PhysicalCard with relative positions
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                data: item,
                x: 0, // Set to 0 relative to cardsContainer
                y: 0,
                onCardCreatedEventCallback: (card: PhysicalCard) => {}
            });

            // Position the PhysicalCard within the grid
            physicalCard.container.setPosition(x, y);

            this.cardsContainer.add(physicalCard.container);
        });
    }

    public resize(width: number, height: number): void {
        // Reposition the inventory panel to the center
        this.inventoryPanel.setPosition(width / 2, height / 2);

        // Update inventory panel size and mask
        const panelWidth = width * 0.8;
        const panelHeight = height * 0.8;
        const panelBg = this.inventoryPanel.getAt(0) as Phaser.GameObjects.Rectangle;
        panelBg.setSize(panelWidth, panelHeight);

        // Update close button position
        this.closeButton.setPosition(panelWidth / 2 - 20, -panelHeight / 2 + 20);

        // Update mask for cardsContainer
        const maskShape = this.scene.make.graphics({});
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(-panelWidth / 2 + 20, -panelHeight / 2 + 60, panelWidth - 40, panelHeight - 80);
        const mask = maskShape.createGeometryMask();
        this.cardsContainer.setMask(mask);

        // Update card layout
        if (this.inventoryPanel.visible) {
            this.updateInventoryPanel();
        }
    }
}
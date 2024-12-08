import { Scene } from 'phaser';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { TextBoxButton } from '../../ui/Button';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

enum ViewState {
    SHOWING_CANDIDATES,
    SHOWING_UPGRADES
}

/**
 * A standalone overlay for selecting a card to upgrade and then choosing an upgrade option.
 * 
 * Flow:
 * 1. showCandidates() -> displays a grid of candidate cards.
 *    - Clicking on a candidate immediately transitions to an upgrade preview screen.
 * 
 * 2. Upgrade preview screen -> shows candidate card on the left, upgrade options on the right.
 *    - Clicking on an upgrade finalizes the upgrade (calls onUpgradeSelected).
 *    - Clicking "Nevermind" returns to the candidate list or closes the overlay if already at candidates.
 */
export class UpgradePreviewOverlay extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private staticContainer: Phaser.GameObjects.Container;
    private scrollableArea: Phaser.GameObjects.Container;
    private maskGraphics: Phaser.GameObjects.Graphics;
    private neverMindButton: TextBoxButton | null = null;
    private cards: PhysicalCard[] = [];

    private readonly CARDS_PER_ROW = 8;
    private readonly CARD_SPACING = 220;
    private readonly CARD_SCALE = 1.2;

    private candidateCards: readonly PlayableCard[] = [];
    private upgradeFunction: (card: PlayableCard) => PlayableCard[];
    private selectedCard: PlayableCard | null = null;
    private upgrades: PlayableCard[] = [];
    private viewState: ViewState = ViewState.SHOWING_CANDIDATES;

    public onUpgradeSelected: ((oldCard: PlayableCard, newCard: PlayableCard) => void) | null = null;
    public onNeverMind: (() => void) | null = null;

    constructor(scene: Scene, candidateCards: readonly PlayableCard[], upgradeFunction: (card: PlayableCard) => PlayableCard[]) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);

        this.setDepth(1000);

        this.candidateCards = candidateCards;
        this.upgradeFunction = upgradeFunction;

        // Create static container for background and buttons
        this.staticContainer = scene.add.container(0, 0);
        this.add(this.staticContainer);

        // Semi-transparent background
        this.background = scene.add.rectangle(
            0, 0,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.8
        );
        this.background.setOrigin(0.5);
        this.staticContainer.add(this.background);

        // Scrollable area
        this.scrollableArea = scene.add.container(0, 0);
        this.add(this.scrollableArea);

        // Mask for scrollable area
        this.maskGraphics = scene.add.graphics();
        this.updateMask();
        this.maskGraphics.setVisible(false);
        this.staticContainer.add(this.maskGraphics);

        // Hide by default
        this.setVisible(false);

        // Scroll wheel listener
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.visible) {
                pointer.event.preventDefault();
                pointer.event.stopPropagation();

                this.scrollableArea.y -= deltaY;
                this.clampScroll();
            }
        });

        this.scene.events.on('card:pointerover', (card: PhysicalCard) => {
            if (this.cards.includes(card)) {
                card.setDepth(20);
            }
        });
        this.scene.events.on('card:pointerout', (card: PhysicalCard) => {
            if (this.cards.includes(card)) {
                card.setDepth(10);
            }
        });
    }

    private updateMask(): void {
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(
            100,
            100,
            this.scene.scale.width - 200,
            this.scene.scale.height - 200
        );

        const mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.maskGraphics);
        this.scrollableArea.setMask(mask);
    }

    private clampScroll(): void {
        const maxScroll = Math.max(0, this.scrollableArea.height - (this.scene.scale.height - 200));
        this.scrollableArea.y = Phaser.Math.Clamp(
            this.scrollableArea.y,
            -maxScroll,
            0
        );
    }

    /**
     * Show the candidate cards in a grid. Clicking one immediately shows the upgrade preview.
     */
    public showCandidates(): void {
        this.viewState = ViewState.SHOWING_CANDIDATES;
        this.selectedCard = null;
        this.upgrades = [];

        UIContextManager.getInstance().setContext(UIContext.CHARACTER_DECK_SHOWN);

        this.clearNeverMindButton();
        this.clearCards();
        this.scrollableArea.setPosition(0, 0);

        const marginX = -this.background.width / 2 + 50;
        const marginY = -this.background.height / 2 + 150;

        this.candidateCards.forEach((card: AbstractCard, index: number) => {
            const row = Math.floor(index / this.CARDS_PER_ROW);
            const col = index % this.CARDS_PER_ROW;

            const x = marginX + col * this.CARD_SPACING + this.CARD_SPACING / 2;
            const y = marginY + row * this.CARD_SPACING + this.CARD_SPACING / 2;

            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: x,
                y: y,
                data: card,
                onCardCreatedEventCallback: (c: PhysicalCard) => {
                    c.container.scale = this.CARD_SCALE;
                    c.container.setInteractive({ useHandCursor: true });
                    c.container.on('pointerdown', () => {
                        this.handleCandidateSelected(card as PlayableCard);
                    });
                    this.scrollableArea.add(c.container);
                }
            });

            this.cards.push(physicalCard);
        });

        this.showNeverMindButton(() => {
            // User clicked nevermind at candidates => close overlay.
            this.handleNeverMind();
        }, 'Nevermind');

        this.setVisible(true);
    }

    /**
     * Candidate card selected, now show that card on left and its upgrades on the right.
     */
    private handleCandidateSelected(card: PlayableCard): void {
        this.selectedCard = card;
        this.upgrades = this.upgradeFunction(card);
        this.showUpgradesForSelectedCard();
    }

    /**
     * Show the selected card on the left and its upgrade options on the right.
     * Clicking on an upgrade finalizes it, "Nevermind" returns to candidate view.
     */
    private showUpgradesForSelectedCard(): void {
        if (!this.selectedCard) return;

        this.viewState = ViewState.SHOWING_UPGRADES;
        UIContextManager.getInstance().setContext(UIContext.CHARACTER_DECK_SHOWN);

        this.clearCards();
        this.scrollableArea.setPosition(0, 0);

        // Candidate card on the left
        const leftX = - (this.background.width / 4);
        const centerY = 0;
        const candidatePhysicalCard = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: leftX,
            y: centerY,
            data: this.selectedCard,
            onCardCreatedEventCallback: (c: PhysicalCard) => {
                c.container.scale = this.CARD_SCALE;
                this.scrollableArea.add(c.container);
            }
        });
        this.cards.push(candidatePhysicalCard);

        // Upgrades on the right side, laid out vertically
        const rightX = (this.background.width / 4);
        const verticalSpacing = 250;
        const startY = centerY - ((this.upgrades.length - 1) * verticalSpacing) / 2;

        this.upgrades.forEach((upgradeCard: PlayableCard, index: number) => {
            const y = startY + index * verticalSpacing;
            const upgradePhysicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: rightX,
                y: y,
                data: upgradeCard,
                onCardCreatedEventCallback: (c: PhysicalCard) => {
                    c.container.scale = this.CARD_SCALE;
                    c.container.setInteractive({ useHandCursor: true });
                    c.container.on('pointerdown', () => {
                        this.finalizeUpgradeSelection(upgradeCard);
                    });
                   
                    this.scrollableArea.add(c.container);
                }
            });
            this.cards.push(upgradePhysicalCard);
        });

        this.showNeverMindButton(() => {
            this.showCandidates();
        }, 'Nevermind');

        this.setVisible(true);
    }

    private finalizeUpgradeSelection(chosenCard: PlayableCard): void {
        if (this.onUpgradeSelected) {
            this.onUpgradeSelected(this.selectedCard!, chosenCard);
        }
        this.hide();
    }

    private handleNeverMind(): void {
        if (this.onNeverMind) {
            this.onNeverMind();
        }
        this.hide();
    }

    private showNeverMindButton(callback: () => void, text: string): void {
        if (!this.neverMindButton) {
            this.neverMindButton = new TextBoxButton({
                scene: this.scene,
                x: (this.background.width / 2) - 300,
                y: -(this.background.height / 2) + 50,
                width: 120,
                height: 40,
                text: text,
                style: { fontSize: '20px' },
                textBoxName: 'neverMind',
                fillColor: 0x555555
            });
            this.neverMindButton.onClick(() => callback());
            this.staticContainer.add(this.neverMindButton);
        } else {
            this.neverMindButton.setText(text);
            this.neverMindButton.setVisible(true);
            this.neverMindButton.removeAllListeners('click');
            this.neverMindButton.onClick(() => callback());
        }
    }

    private clearNeverMindButton(): void {
        if (this.neverMindButton) {
            this.neverMindButton.setVisible(false);
        }
    }

    private clearCards(): void {
        this.cards.forEach(card => card.obliterate());
        this.cards = [];
    }

    public hide(): void {
        UIContextManager.getInstance().setContext(UIContext.COMBAT);
        this.setVisible(false);
        this.viewState = ViewState.SHOWING_CANDIDATES;
        this.selectedCard = null;
        this.clearNeverMindButton();
    }

    public resize(): void {
        // Update position and sizes
        this.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.background.setSize(this.scene.scale.width, this.scene.scale.height);

        if (this.neverMindButton) {
            this.neverMindButton.setPosition(
                (this.background.width / 2) - 300,
                -(this.background.height / 2) + 50
            );
        }

        this.scrollableArea.setPosition(0, 0);
        this.updateMask();
    }
}

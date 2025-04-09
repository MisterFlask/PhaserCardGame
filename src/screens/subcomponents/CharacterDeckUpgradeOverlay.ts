import { Scene } from 'phaser';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { PlayableCard } from '../../gamecharacters/PlayableCard';
import { TextBoxButton } from '../../ui/Button';
import { DepthManager } from '../../ui/DepthManager';
import { PhysicalCard } from '../../ui/PhysicalCard';
import { UIContext, UIContextManager } from '../../ui/UIContextManager';
import { CardGuiUtils } from '../../utils/CardGuiUtils';

enum ViewState {
    SHOWING_CANDIDATES,
    SHOWING_UPGRADES
}

/**
 * revised upgrade overlay:
 * removes the nested container arrangement and directly adds cards to the scene.
 * each card gets its own mask (or we could use a camera-scissor rect).
 * scrolling is handled by adjusting a global offset.
 */
export class UpgradePreviewOverlay extends Phaser.GameObjects.Container {
    private background: Phaser.GameObjects.Rectangle;
    private neverMindButton: TextBoxButton | null = null;
    private cards: PhysicalCard[] = [];

    private candidateCards: readonly PlayableCard[] = [];
    private upgradeFunction: (card: PlayableCard) => PlayableCard[];
    private selectedCard: PlayableCard | null = null;
    private upgrades: PlayableCard[] = [];
    private viewState: ViewState = ViewState.SHOWING_CANDIDATES;

    // scroll offset
    private scrollY: number = 0;

    private readonly CARDS_PER_ROW = 8;
    private readonly CARD_SPACING = 220;
    private readonly CARD_SCALE = 1.2;

    // define a mask region
    private maskShape: Phaser.GameObjects.Graphics;

    public onUpgradeSelected: ((oldCard: PlayableCard, newCard: PlayableCard) => void) | null = null;
    public onNeverMind: (() => void) | null = null;

    constructor(scene: Scene, candidateCards: readonly PlayableCard[], upgradeFunction: (card: PlayableCard) => PlayableCard[]) {
        super(scene, scene.scale.width / 2, scene.scale.height / 2);
        scene.add.existing(this);

        this.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY);
        this.candidateCards = candidateCards;
        this.upgradeFunction = upgradeFunction;

        // background
        this.background = scene.add.rectangle(
            this.x, this.y,
            scene.scale.width,
            scene.scale.height,
            0x000000,
            0.8
        ).setOrigin(0.5,0.5);
        this.scene.children.moveBelow(this.background, this); 
        // we put background behind to ensure cards appear above if needed
        this.background.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY - 1);

        // create a mask shape
        this.maskShape = this.scene.add.graphics();
        this.maskShape.fillStyle(0xffffff);
        this.updateMask();
        const mask = this.maskShape.createGeometryMask();
        // we won't put cards inside a single container, instead we assign mask to each card individually

        // scroll
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number) => {
            if (this.visible) {
                pointer.event.preventDefault();
                pointer.event.stopPropagation();

                this.scrollY -= deltaY;
                this.layoutCards();
            }
        });

        // hover out/in events
        this.scene.events.on('card:pointerover', (card: PhysicalCard) => {
            if (this.cards.includes(card)) {
                card.setDepth(DepthManager.getInstance().REST_UPGRADE_WATCHED_CARD);
            }
        });
        this.scene.events.on('card:pointerout', (card: PhysicalCard) => {
            if (this.cards.includes(card)) {
                card.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY);

            }
        });

        this.setVisible(false);
    }

    private updateMask(): void {
        this.maskShape.clear();
        this.maskShape.fillRect(
            this.x - (this.scene.scale.width/2) + 100,
            this.y - (this.scene.scale.height/2) + 100,
            this.scene.scale.width - 200,
            this.scene.scale.height - 200
        );
    }

    /**
     * show candidate cards
     */
    public showCandidates(): void {
        if (UIContextManager.getInstance().getContext() !== UIContext.CHARACTER_DECK_SHOWN) {
            UIContextManager.getInstance().pushContext(UIContext.CHARACTER_DECK_SHOWN);
        }

        this.viewState = ViewState.SHOWING_CANDIDATES;
        this.selectedCard = null;
        this.upgrades = [];


        this.clearNeverMindButton();
        this.clearCards();
        this.scrollY = 0;

        this.candidateCards.forEach((card: AbstractCard, index: number) => {
            const physicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 0,
                y: 0,
                data: card,
                onCardCreatedEventCallback: (c: PhysicalCard) => {
                    c.container.scale = this.CARD_SCALE;
                    c.container.setInteractive({ useHandCursor: true });
                    c.container.on('pointerdown', () => {
                        this.handleCandidateSelected(card as PlayableCard);
                    });
                    c.container.setMask(this.maskShape.createGeometryMask());
                    c.container.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY);
                }
            });
            this.cards.push(physicalCard);
        });

        this.layoutCards();
        this.showNeverMindButton(() => {
            this.handleNeverMind();
        }, 'Nevermind');
        this.setVisible(true);
    }

    /**
     * lay out cards based on current scrollY and view state
     */
    private layoutCards(): void {
        if (this.viewState === ViewState.SHOWING_CANDIDATES) {
            const marginX = this.x - (this.scene.scale.width/2) + 50;
            const marginY = this.y - (this.scene.scale.height/2) + 150;

            this.cards.forEach((card, index) => {
                const row = Math.floor(index / this.CARDS_PER_ROW);
                const col = index % this.CARDS_PER_ROW;

                const x = marginX + col * this.CARD_SPACING + this.CARD_SPACING / 2;
                const y = marginY + row * this.CARD_SPACING + this.CARD_SPACING / 2 + this.scrollY;

                card.container.setPosition(x, y);
            });
        } else if (this.viewState === ViewState.SHOWING_UPGRADES && this.selectedCard) {
            // candidate on left, upgrades on right
            const leftX = this.x - (this.background.width / 4);
            const centerY = this.y + this.scrollY;
            const candidate = this.cards[0]; // first card is candidate
            candidate.container.setPosition(leftX, centerY);

            // upgrades start at index 1
            const rightX = this.x + (this.background.width / 4);
            const verticalSpacing = 250;
            const startY = centerY - ((this.upgrades.length - 1) * verticalSpacing) / 2;

            this.upgrades.forEach((upgradeCard: PlayableCard, index: number) => {
                const card = this.cards[index+1]; 
                const y = startY + index * verticalSpacing;
                card.container.setPosition(rightX, y);
            });
        }
    }

    private handleCandidateSelected(card: PlayableCard): void {
        this.selectedCard = card;
        this.upgrades = this.upgradeFunction(card);
        this.showUpgradesForSelectedCard();
    }

    private showUpgradesForSelectedCard(): void {
        if (!this.selectedCard) return;

        this.viewState = ViewState.SHOWING_UPGRADES;

        this.clearCards();
        this.scrollY = 0;

        // candidate card
        const candidatePhysicalCard = CardGuiUtils.getInstance().createCard({
            scene: this.scene,
            x: 0,
            y: 0,
            data: this.selectedCard,
            onCardCreatedEventCallback: (c: PhysicalCard) => {
                c.container.scale = this.CARD_SCALE;
                c.container.setMask(this.maskShape.createGeometryMask());
                c.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY);
            }
        });
        this.cards.push(candidatePhysicalCard);

        // upgrades
        this.upgrades.forEach((upgradeCard: PlayableCard) => {
            const upgradePhysicalCard = CardGuiUtils.getInstance().createCard({
                scene: this.scene,
                x: 0,
                y: 0,
                data: upgradeCard,
                onCardCreatedEventCallback: (c: PhysicalCard) => {
                    c.container.scale = this.CARD_SCALE;
                    c.container.setInteractive({ useHandCursor: true });
                    c.container.on('pointerdown', () => {
                        this.finalizeUpgradeSelection(upgradeCard);
                    });
                    c.container.setMask(this.maskShape.createGeometryMask());
                    c.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY);
                }
            });
            this.cards.push(upgradePhysicalCard);
        });

        this.layoutCards();
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
                x: this.x + (this.background.width / 2) - 300,
                y: this.y - (this.background.height / 2) + 50,
                width: 120,
                height: 40,
                text: text,
                style: { fontSize: '20px' },
                textBoxName: 'neverMind',
                fillColor: 0x555555
            });
            this.neverMindButton.onClick(() => callback());
            this.neverMindButton.setDepth(DepthManager.getInstance().REST_UPGRADE_OVERLAY + 1); // above background
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
        UIContextManager.getInstance().popContext();
        this.setVisible(false);
        this.viewState = ViewState.SHOWING_CANDIDATES;
        this.selectedCard = null;
        this.clearNeverMindButton();
        this.background.setVisible(false);
        this.clearCards();
        // Obliterate any physical cards that may have been created
        this.cards.forEach(card => card.obliterate());
        this.cards = [];
    }   

    public resize(): void {
        this.setPosition(this.scene.scale.width / 2, this.scene.scale.height / 2);
        this.background.setSize(this.scene.scale.width, this.scene.scale.height);

        if (this.neverMindButton) {
            this.neverMindButton.setPosition(
                this.x + (this.background.width / 2) - 300,
                this.y - (this.background.height / 2) + 50
            );
        }

        this.updateMask();
        this.layoutCards();
    }
}

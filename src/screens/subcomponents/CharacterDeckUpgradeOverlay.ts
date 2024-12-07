import { Scene } from 'phaser';
import { AbstractCard } from '../../gamecharacters/AbstractCard';
import { TextBoxButton } from '../../ui/Button';
import { CharacterDeckOverlay } from './CharacterDeckOverlay';

enum ViewState {
    SHOWING_CANDIDATES,
    SHOWING_UPGRADES
}

export class UpgradeCardOverlay extends CharacterDeckOverlay {
    private candidateCards: AbstractCard[] = [];
    private upgradeFunction: (card: AbstractCard) => AbstractCard[];
    private neverMindButton: TextBoxButton | null = null;

    private selectedUpgradableCard: AbstractCard | null = null;
    private upgrades: AbstractCard[] = [];

    private viewState: ViewState = ViewState.SHOWING_CANDIDATES;

    constructor(scene: Scene, candidateCards: AbstractCard[], upgradeFunction: (card: AbstractCard) => AbstractCard[]) {
        super(scene);
        this.candidateCards = candidateCards;
        this.upgradeFunction = upgradeFunction;
    }

    /**
     * Show the initial candidate cards along with a nevermind button.
     */
    public showCandidates(): void {
        this.viewState = ViewState.SHOWING_CANDIDATES;
        this.selectedUpgradableCard = null;
        this.upgrades = [];

        this.showCardsWithSelection(
            this.candidateCards,
            (selectedCard: AbstractCard) => {
                this.handleCandidateSelected(selectedCard);
            }
        );

        this.showNeverMindButton(() => {
            // If we press nevermind while showing candidates, just close the overlay
            this.hide();
        }, 'Nevermind');
    }

    /**
     * When a candidate is selected, show that candidate card along with its upgrade options.
     */
    private handleCandidateSelected(card: AbstractCard): void {
        this.selectedUpgradableCard = card;
        this.upgrades = this.upgradeFunction(card);
        this.showUpgradesForSelectedCard();
    }

    /**
     * Show the selected card and its upgrade options.
     */
    private showUpgradesForSelectedCard(): void {
        if (!this.selectedUpgradableCard) return;

        this.viewState = ViewState.SHOWING_UPGRADES;
        this.hideSubmitButton(); // We won't use the submit button logic from the parent here
        this.clearNeverMindButton();

        // We'll show the selected card plus its upgrade options as a new set of cards.
        const allCards = [this.selectedUpgradableCard, ...this.upgrades];

        this.showCardsWithSelection(
            allCards,
            (selectedUpgradeCard: AbstractCard) => {
                // Here you'd probably have a final step like applying the upgrade.
                // For now, let's just close after selecting an upgrade.
                // This is where you'd implement the actual upgrade logic if desired.
                this.hide();
            }
        );

        // This "Nevermind" in upgrade view goes back to the candidate list.
        this.showNeverMindButton(() => {
            // Return to candidates
            this.showCandidates();
        }, 'Nevermind');
    }

    /**
     * Utility: Show the nevermind button and wire its callback.
     */
    private showNeverMindButton(callback: () => void, text: string): void {
        if (!this.neverMindButton) {
            this.neverMindButton = new TextBoxButton({
                scene: this.scene,
                x: (this.background.width / 2) - 300, // Adjust position as needed
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

    /**
     * Utility: Clear the nevermind button.
     */
    private clearNeverMindButton(): void {
        if (this.neverMindButton) {
            this.neverMindButton.setVisible(false);
        }
    }

    /**
     * Override hide to ensure state resets.
     */
    public hide(): void {
        super.hide();
        this.viewState = ViewState.SHOWING_CANDIDATES;
        this.selectedUpgradableCard = null;
        this.clearNeverMindButton();
    }

    /**
     * Override resize to also reposition the nevermind button if needed.
     */
    public resize(): void {
        super.resize();
        if (this.neverMindButton) {
            this.neverMindButton.setPosition(
                (this.background.width / 2) - 300,
                -(this.background.height / 2) + 50
            );
        }
    }
}

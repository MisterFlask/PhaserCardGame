import { Scene } from 'phaser';
import { applyPromotion } from '../../../../campaign/Promotion';
import { deckCap, isAtDeckCap, pendingLevels } from '../../../../campaign/Leveling';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { CardRewardsGenerator } from '../../../../rules/CardRewardsGenerator';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBoxButton } from '../../../../ui/Button';
import { DepthManager } from '../../../../ui/DepthManager';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TextBox } from '../../../../ui/TextBox';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const PROMOTION_DEPTH = DepthManager.getInstance().REWARD_SCREEN + 2000;

/**
 * Promotion flow (Amendment: Soldier Levels & Promotions). Resolves the
 * roster's pendingLevels queue one level at a time: mandatory card pick,
 * then (at perk levels) a perk reveal. Not a chrome tab — a flow step like
 * SortieReportPanel, reached after the debrief and from Barracks' PROMOTE
 * fallback, that returns to 'contracts' once the queue is empty.
 */
export class PromotionPanel extends AbstractHqPanel {
    private headerText: TextBox;
    private cardElements: PhysicalCard[] = [];
    private ownerTexts: Phaser.GameObjects.Text[] = [];

    private perkOverlayElements: Phaser.GameObjects.GameObject[] = [];

    /** Deck-at-cap swap picker: shown after a card is chosen while the
     *  soldier's master deck is already at cap. Picking one of these
     *  discards it in favor of the chosen reward card. */
    private swapOverlayElements: Phaser.GameObjects.GameObject[] = [];
    private swapCardElements: PhysicalCard[] = [];

    constructor(scene: Scene) {
        super(scene, 'Promotion');
        // The chrome renders above this panel like the debrief; no tab names
        // this flow step, so nudge the title below the chrome instead of
        // hiding it — it doubles as the soldier/level header.
        this.titleText.setPosition(scene.scale.width / 2, 118);

        this.headerText = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: 170,
            width: 900,
            height: 60,
            text: '',
            style: { fontSize: '20px', color: '#ffffff', align: 'center', wordWrap: { width: 880 } }
        });

        this.add([this.headerText]);
    }

    public show(): void {
        this.titleText.setText('');
        this.clearSwapPicker();
        this.processCurrentSoldier();
        super.show();
    }

    /** Finds the first soldier with a pending level and displays their card
     *  choice. If the queue is empty, saves and returns to the contract board. */
    private processCurrentSoldier(): void {
        const campaign = CampaignUiState.getInstance();
        const soldier = campaign.roster.find(c => pendingLevels(c) > 0);

        if (!soldier) {
            SaveManager.save();
            this.scene.events.emit('navigate', 'contracts');
            return;
        }

        const newLevel = soldier.level + 1;
        this.headerText.setText(
            `${soldier.name} — ${soldier.characterClass.name}\n` +
            `[color=gold]PROMOTION TO LEVEL ${newLevel}[/color]\n` +
            `The board confirms the appointment. Select the soldier's commendation.`
        );

        const rewards = CardRewardsGenerator.getInstance().generateCardRewardsForLevelUp(soldier, newLevel);
        this.displayCardChoices(soldier, rewards);
    }

    private clearCardChoices(): void {
        this.cardElements.forEach(card => card.obliterate());
        this.cardElements = [];
        this.ownerTexts.forEach(t => t.destroy());
        this.ownerTexts = [];
    }

    private displayCardChoices(soldier: PlayerCharacter, rewards: PlayableCard[]): void {
        this.clearCardChoices();

        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2 + 40;
        const cardSpacing = 220;
        const startX = centerX - ((rewards.length - 1) * cardSpacing) / 2;
        const cardGuiUtils = CardGuiUtils.getInstance();

        rewards.forEach((cardReward, index) => {
            const cardX = startX + index * cardSpacing;

            const physicalCard = cardGuiUtils.createCard({
                scene: this.scene,
                x: cardX,
                y: centerY,
                data: cardReward,
                onCardCreatedEventCallback: (cardInstance: PhysicalCard) => {
                    // Stable tag for the smoke-test harness (see SmokeTest.ts's
                    // findInScene pattern) so it can locate and click a card
                    // choice the same way it locates mapButton/doneButton via
                    // textBoxName. Plain Phaser GameObject.name works here since
                    // PhysicalCard's container isn't a TextBox subclass.
                    cardInstance.container.name = 'promotionCardChoice';
                    cardInstance.setDepth(PROMOTION_DEPTH + 100);
                    cardInstance.container.on('pointerover', () => {
                        cardInstance.setDepth(PROMOTION_DEPTH + 3000);
                    });
                    cardInstance.container.on('pointerout', () => {
                        cardInstance.setDepth(PROMOTION_DEPTH + 100);
                    });
                    cardInstance.container.on('pointerdown', () => {
                        this.onCardChosen(soldier, cardReward);
                    });
                }
            });
            this.cardElements.push(physicalCard);

            const rarityText = this.scene.add.text(
                cardX,
                centerY + (physicalCard.container.displayHeight / 2) + 20,
                cardReward.rarity.id,
                { fontSize: '16px', color: '#ffffff', fontFamily: 'Arial', align: 'center' }
            ).setOrigin(0.5, 0).setDepth(PROMOTION_DEPTH + 1);
            this.ownerTexts.push(rarityText);

            this.add([physicalCard.container, rarityText]);
        });
    }

    private onCardChosen(soldier: PlayerCharacter, chosenCard: PlayableCard): void {
        if (isAtDeckCap(soldier, soldier.startingDeck.length, soldier.cardsInMasterDeck.length)) {
            // Deck is full: the pick must displace an existing card before
            // it can be applied. Hold the choice and show the swap picker;
            // applyPromotion (and level/perk advancement) happens once the
            // player confirms which card to lose.
            this.clearCardChoices();
            this.showSwapPicker(soldier, chosenCard);
            return;
        }

        this.commitPromotion(soldier, chosenCard);
    }

    /** Applies the promotion (optionally displacing `displacedCard` from the
     *  master deck first) and advances the queue. */
    private commitPromotion(soldier: PlayerCharacter, chosenCard: PlayableCard, displacedCard?: PlayableCard): void {
        if (displacedCard) {
            soldier.removeCard(displacedCard);
        }

        // applyPromotion adds chosenCard to the soldier's persistent deck
        // before the physical representations are torn down below, so the
        // underlying PlayableCard model survives independently of its
        // (now-destroyed) on-screen PhysicalCard.
        const result = applyPromotion(soldier, chosenCard);
        this.clearCardChoices();

        if (result.perkGranted) {
            this.showPerkReveal(soldier, result.perkGranted.getDisplayName(), result.perkGranted.getDescription());
        } else {
            this.processCurrentSoldier();
        }
    }

    private clearSwapPicker(): void {
        this.swapCardElements.forEach(card => card.obliterate());
        this.swapCardElements = [];
        this.swapOverlayElements.forEach(e => { this.remove(e); e.destroy(); });
        this.swapOverlayElements = [];
    }

    /** DECK AT CAPACITY: the soldier must give up an existing master-deck
     *  card to make room for `chosenCard`. Lays out the current deck as
     *  clickable cards; picking one displaces it and commits the promotion. */
    private showSwapPicker(soldier: PlayerCharacter, chosenCard: PlayableCard): void {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;
        const cap = deckCap(soldier, soldier.startingDeck.length);

        const backdrop = this.scene.add.rectangle(centerX, centerY, 1100, 620, 0x000000, 0.9)
            .setStrokeStyle(4, 0xC9A227)
            .setDepth(PROMOTION_DEPTH + 200);

        const instructions = new TextBox({
            scene: this.scene,
            x: centerX,
            y: centerY - 260,
            width: 900,
            height: 70,
            text: `[color=gold]DECK AT CAPACITY[/color] (${soldier.cardsInMasterDeck.length}/${cap})\n` +
                `A soldier may carry only so much doctrine. Choose a card from ${soldier.name}'s deck to muster out in favor of [color=gold]${chosenCard.name}[/color].`,
            style: { fontSize: '18px', color: '#ffffff', align: 'center', wordWrap: { width: 860 } },
            fillColor: 0x3a2e10
        }).setDepth(PROMOTION_DEPTH + 201);

        this.swapOverlayElements = [backdrop, instructions];
        this.add(this.swapOverlayElements);

        const deck = soldier.cardsInMasterDeck;
        const cardGuiUtils = CardGuiUtils.getInstance();
        const columns = Math.min(6, deck.length) || 1;
        const cardSpacingX = 150;
        const cardSpacingY = 190;
        const gridStartX = centerX - ((columns - 1) * cardSpacingX) / 2;
        const gridStartY = centerY - 130;

        deck.forEach((deckCard, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const cardX = gridStartX + col * cardSpacingX;
            const cardY = gridStartY + row * cardSpacingY;

            const physicalCard = cardGuiUtils.createCard({
                scene: this.scene,
                x: cardX,
                y: cardY,
                data: deckCard,
                onCardCreatedEventCallback: (cardInstance: PhysicalCard) => {
                    cardInstance.container.name = 'promotionSwapCardChoice';
                    cardInstance.setDepth(PROMOTION_DEPTH + 210);
                    cardInstance.container.on('pointerover', () => {
                        cardInstance.setDepth(PROMOTION_DEPTH + 3000);
                    });
                    cardInstance.container.on('pointerout', () => {
                        cardInstance.setDepth(PROMOTION_DEPTH + 210);
                    });
                    cardInstance.container.on('pointerdown', () => {
                        this.clearSwapPicker();
                        this.commitPromotion(soldier, chosenCard, deckCard);
                    });
                }
            });
            this.swapCardElements.push(physicalCard);
            this.add(physicalCard.container);
        });
    }

    private clearPerkOverlay(): void {
        this.perkOverlayElements.forEach(e => { this.remove(e); e.destroy(); });
        this.perkOverlayElements = [];
    }

    /** A brief wax-sealed-commendation-styled reveal for perk levels (4, 8):
     *  perk name + description, gated behind a CONTINUE button before the
     *  queue advances. */
    private showPerkReveal(soldier: PlayerCharacter, perkName: string, perkDescription: string): void {
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        const backdrop = this.scene.add.rectangle(centerX, centerY, 900, 500, 0x000000, 0.85)
            .setStrokeStyle(4, 0xC9A227)
            .setDepth(PROMOTION_DEPTH + 200);

        const seal = new TextBox({
            scene: this.scene,
            x: centerX,
            y: centerY - 120,
            width: 700,
            height: 90,
            text: `[color=gold]COMMENDATION[/color]\nThe board recognizes distinguished service.`,
            style: { fontSize: '22px', color: '#ffffff', align: 'center', wordWrap: { width: 660 } },
            fillColor: 0x3a2e10
        }).setDepth(PROMOTION_DEPTH + 201);

        const perkBox = new TextBox({
            scene: this.scene,
            x: centerX,
            y: centerY + 30,
            width: 700,
            height: 200,
            text: `[color=gold]${perkName}[/color]\n\n${perkDescription}`,
            style: { fontSize: '20px', color: '#ffffff', align: 'center', wordWrap: { width: 660 } },
            fillColor: 0x1a1a1a
        }).setDepth(PROMOTION_DEPTH + 201);

        const continueButton = new TextBoxButton({
            scene: this.scene,
            x: centerX,
            y: centerY + 200,
            width: 260,
            height: 55,
            text: 'Continue',
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x226622,
            // Stable tag for the smoke-test harness, same pattern as mapButton/doneButton.
            textBoxName: 'promotionContinue'
        }).setDepth(PROMOTION_DEPTH + 201);

        continueButton.onClick(() => {
            this.clearPerkOverlay();
            this.processCurrentSoldier();
        });

        this.perkOverlayElements = [backdrop, seal, perkBox, continueButton];
        this.add(this.perkOverlayElements);
    }

    update(): void {
        // Static; driven entirely by card selection / continue clicks.
    }
}

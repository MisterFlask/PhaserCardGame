import { Scene } from 'phaser';
import FixWidthSizer from 'phaser3-rex-plugins/templates/ui/fixwidthsizer/FixWidthSizer.js';
import Label from 'phaser3-rex-plugins/templates/ui/label/Label.js';
import ScrollablePanel from 'phaser3-rex-plugins/templates/ui/scrollablepanel/ScrollablePanel.js';
import Sizer from 'phaser3-rex-plugins/templates/ui/sizer/Sizer.js';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { EncounterManager } from '../../../../encounters/EncounterManager';
import { PriceContext } from '../../../../gamecharacters/AbstractCard';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { GameState } from '../../../../rules/GameState';
import { DepthManager } from '../../../../ui/DepthManager';
import { PhysicalCard } from '../../../../ui/PhysicalCard';
import { TooltipAttachment } from '../../../../ui/TooltipAttachment';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { SceneChanger } from '../../../SceneChanger';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class CargoSelectionPanel extends AbstractHqPanel {
  private mainSizer!: Sizer;
  private fundsLabel!: Label;
  private backButton!: Label;
  private launchButton!: Label;
  private statusLabel!: Label;
  private tooltipAttachments: TooltipAttachment[] = [];

  private locationCard: PhysicalCard | null = null;
  private characterCards = new Map<PlayerCharacter, PhysicalCard>();
  
  // store references to sizers and objects we want to clear/destroy on hide
  private characterSizer!: Sizer;
  private cargoSizer!: Sizer;
  private availableCargoSizer!: ScrollablePanel;
  private purchasedCargoSizer!: ScrollablePanel;
  private locationSizer!: Sizer;

  constructor(scene: Scene) {
    super(scene, 'Cargo Selection');

    // hide the default return to hub button
    this.returnButton.setVisible(false);
    
    // build main container
    this.buildUI();
    this.updateFunds();
    this.updateLaunchButton();
  }

  private get rexUI(): RexUIPlugin {
    return (this.scene as Scene & { rexUI: RexUIPlugin }).rexUI;
  }

  // build the entire panel using rexUI
  private buildUI(): void {
    // main sizer
    this.mainSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      x: this.scene.scale.width / 2,
      y: this.scene.scale.height / 2,
      width: this.scene.scale.width * 0.9,
      height: this.scene.scale.height * 0.9,
      space: { top: 10, left: 10, right: 10, bottom: 10, item: 10 },
    });

    // background
    const background = this.rexUI.add.roundRectangle(0, 0, 10, 10, 20, 0x2c2c2c);

    this.mainSizer
      .addBackground(background)
      .add(
        // funds + status row
        this.createTopBar(),
        { proportion: 0, expand: false, align: 'center', padding: { bottom: 10 } }
      )
      .add(
        // main content row: characters / location / cargo
        this.createMainContent(),
        { proportion: 1, expand: true }
      )
      .add(
        // footer (buttons)
        this.createFooterButtons(),
        { proportion: 0, expand: false, align: 'center', padding: { top: 10 } }
      )
      .layout();

    this.scene.add.existing(this.mainSizer);
    this.mainSizer.setDepth(DepthManager.getInstance().OVERLAY_BASE);
    this.mainSizer.setVisible(false);

    // listen for funds changes
    this.scene.events.on('fundsChanged', () => this.updateFunds());
  }

  private createTopBar(): Sizer {
    const sizer = this.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 20 } });
    
    // funds display
    this.fundsLabel = this.rexUI.add.label({
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x444444),
      text: this.scene.add.text(0, 0, '', {
        fontSize: '22px',
        color: '#ffff00',
      }),
      space: { top: 8, bottom: 8, left: 10, right: 10 },
    });

    // status text
    this.statusLabel = this.rexUI.add.label({
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x555555),
      text: this.scene.add.text(0, 0, '', {
        fontSize: '16px',
        color: '#ffffff',
        wordWrap: { width: 300 },
      }),
      space: { top: 8, bottom: 8, left: 10, right: 10 },
    });

    sizer.add(this.fundsLabel, { proportion: 0, expand: false });
    sizer.add(this.statusLabel, { proportion: 1, expand: true, align: 'center' });
    return sizer;
  }

  private createMainContent(): Sizer {
    const mainContentSizer = this.rexUI.add.sizer({
      orientation: 'horizontal',
      space: { item: 20 },
    });

    // left: characters
    this.characterSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      width: this.scene.scale.width * 0.25,
      space: { top: 10, bottom: 10, left: 10, right: 10, item: 10 },
    });

    // middle: location card
    const locationSizer = this.rexUI.add.sizer({
      orientation: 'vertical',
      width: this.scene.scale.width * 0.2,
      space: { top: 10, bottom: 10, item: 10 },
    });

    // right: cargo (two scrollable panels)
    this.cargoSizer = this.rexUI.add.sizer({
      orientation: 'horizontal',
      width: this.scene.scale.width * 0.4,
      space: { item: 30 },
    });

    // build sub-sections
    this.buildCharacterSection(this.characterSizer);
    this.buildLocationSection(locationSizer);
    this.buildCargoSection(this.cargoSizer);

    mainContentSizer.add(this.characterSizer, { proportion: 1, expand: true });
    mainContentSizer.add(locationSizer, { proportion: 1, expand: true });
    mainContentSizer.add(this.cargoSizer, { proportion: 2, expand: true });

    this.locationSizer = locationSizer;

    return mainContentSizer;
  }

  private buildCharacterSection(charSizer: Sizer): void {
    // heading
    const heading = this.rexUI.add.label({
      text: this.scene.add.text(0, 0, 'Expedition Party', { fontSize: '20px', color: '#ffffff' }),
    });
    charSizer.add(heading, { align: 'center', padding: { bottom: 10 } });
  }

  private buildLocationSection(locSizer: Sizer): void {
    const heading = this.rexUI.add.label({
      text: this.scene.add.text(0, 0, 'Trade Route', { fontSize: '20px', color: '#ffffff' }),
    });
    locSizer.add(heading, { align: 'center', padding: { bottom: 10 } });
  }

  private buildCargoSection(cargoSizer: Sizer): void {
    const panelWidth = this.scene.scale.width * 0.25;

    const availablePanel = this.rexUI.add.scrollablePanel({
        width: panelWidth,
        height: this.scene.scale.height * 0.6,
        scrollMode: 0, // vertical
        panel: {
            child: this.rexUI.add.fixWidthSizer({
                space: { top: 10, bottom: 10, left: 20, right: 20, item: 10, line: 10 },
                align: 'center',
            }),
        },
        mouseWheelScroller: { focus: true },
        slider: {
            track: this.rexUI.add.roundRectangle(0, 0, 3, 0, 5, 0x888888),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0xcccccc),
        },
        space: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10,
            panel: 10,
        },
    });

    const purchasedPanel = this.rexUI.add.scrollablePanel({
        width: panelWidth,
        height: this.scene.scale.height * 0.6,
        scrollMode: 0,
        panel: {
            child: this.rexUI.add.fixWidthSizer({
                space: { top: 10, bottom: 10, left: 20, right: 20, item: 10, line: 10 },
                align: 'center',
            }),
        },
        mouseWheelScroller: { focus: true },
        slider: {
            track: this.rexUI.add.roundRectangle(0, 0, 3, 0, 5, 0x888888),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 5, 0xcccccc),
        },
        space: {
            left: 20,
            right: 20,
            top: 10,
            bottom: 10,
            panel: 10,
        },
    });

    this.availableCargoSizer = availablePanel;
    this.purchasedCargoSizer = purchasedPanel;

    // labels for each scrollable panel
    const availableLabel = this.rexUI.add.label({
      text: this.scene.add.text(0, 0, 'Available Cargo Cards', { fontSize: '18px', color: '#ffffff' }),
    });
    const purchasedLabel = this.rexUI.add.label({
      text: this.scene.add.text(0, 0, 'Expedition Inventory', { fontSize: '18px', color: '#ffffff' }),
      space: { bottom: 10 }
    });

    // column 1
    const leftCol = this.rexUI.add.sizer({ orientation: 'vertical', space: { item: 10 } });
    leftCol.add(availableLabel, { align: 'center' });
    leftCol.add(availablePanel, { expand: true });

    // column 2 - wrap in container with border
    const rightCol = this.rexUI.add.sizer({ 
      orientation: 'vertical',
      space: { item: 10 },
      name: 'purchasedCargoContainer'
    });
    
    // Add label first, outside the bordered container
    rightCol.add(purchasedLabel, { align: 'center' });
    
    // Create border container
    const purchasedContainer = this.rexUI.add.sizer({
      orientation: 'vertical',
      space: { item: 10 },
    });
    
    // Add golden border background
    purchasedContainer.addBackground(
      this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x000000)
        .setStrokeStyle(3, 0xffd700) // Gold color border
    );

    // Add only the panel to the bordered container
    purchasedContainer.add(purchasedPanel, { expand: true, padding: { left: 15, right: 15, top: 15, bottom: 15 } });
    rightCol.add(purchasedContainer, { expand: true });

    cargoSizer.add(leftCol, { proportion: 1, expand: true });
    cargoSizer.add(rightCol, { proportion: 1, expand: true });
  }

  private createFooterButtons(): Sizer {
    const footerSizer = this.rexUI.add.sizer({ orientation: 'horizontal', space: { item: 50 } });
    
    // back
    this.backButton = this.rexUI.add.label({
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x444444),
      text: this.scene.add.text(0, 0, 'Back to Loadout', {
        fontSize: '20px',
        color: '#ffffff',
      }),
      space: { top: 10, bottom: 10, left: 20, right: 20 },
    });
    this.backButton.setInteractive().on('pointerdown', () => this.handleBack());

    // launch
    this.launchButton = this.rexUI.add.label({
      background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x444444),
      text: this.scene.add.text(0, 0, 'Launch Expedition', {
        fontSize: '20px',
        color: '#ffffff',
      }),
      space: { top: 10, bottom: 10, left: 20, right: 20 },
    });
    this.launchButton.setInteractive().on('pointerdown', () => this.handleLaunch());

    footerSizer.add(this.backButton);
    footerSizer.add(this.launchButton);
    return footerSizer;
  }

  private handleBack(): void {
    this.hide();
    this.scene.events.emit('navigate', 'loadout');
  }

  private handleLaunch(): void {
    if (this.isReadyToLaunch()) {
      const campaignState = CampaignUiState.getInstance();
      const gameState = GameState.getInstance();

      gameState.currentRunCharacters = campaignState.selectedParty;
      gameState.initializeRun();
      const encounter = EncounterManager.getInstance().getRandomCombatEncounter(gameState.currentAct, 0);
      SceneChanger.switchToCombatScene(
        encounter,
        true
      );
      
      // Make sure currentLocation exists before calling OnLocationSelected
      if (gameState.currentLocation) {
        gameState.currentLocation.OnLocationSelected(SceneChanger.getCurrentScene()!);
      } else {
        console.warn("Cannot call OnLocationSelected: currentLocation is null");
      }
    }
  }

  private isReadyToLaunch(): boolean {
    const readiness = this.getReadinessStatus();
    if (!readiness.ready) {
      console.log('CargoSelectionPanel not ready:', readiness.reasons);
    }
    return readiness.ready;
  }

  private getReadinessStatus(): { ready: boolean; reasons: string[] } {
    const reasons: string[] = [];
    const campaignState = CampaignUiState.getInstance();
    
    // Check if party is empty
    if (!campaignState.selectedParty || campaignState.selectedParty.length === 0) {
      reasons.push("No characters selected for the expedition");
    }
    
    // Add additional checks here if needed
    
    return { ready: reasons.length === 0, reasons };
  }

  private updateLaunchButton(): void {
    const status = this.getReadinessStatus();
    if (status.ready) {
      (this.statusLabel.getElement('text') as Phaser.GameObjects.Text).setText('Ready to launch!');
      (this.statusLabel.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x006400);
    } else {
      if (status.reasons.length > 0) {
        (this.statusLabel.getElement('text') as Phaser.GameObjects.Text).setText(`Cannot launch:\n• ${status.reasons.join('\n• ')}`);
      } else {
        (this.statusLabel.getElement('text') as Phaser.GameObjects.Text).setText('Cannot launch for unknown reasons');
      }
      (this.statusLabel.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x8b0000);
    }
  }

  private displayCharacters(): void {
    // clear old
    this.characterCards.forEach(card => card.obliterate());
    this.characterCards.clear();
    this.characterSizer.clear(true);

    // heading again (since we cleared)
    this.buildCharacterSection(this.characterSizer);

    // create cards for each party member
    const campaignState = CampaignUiState.getInstance();
    campaignState.selectedParty.forEach((character) => {
      const phCard = CardGuiUtils.getInstance().createCard({
        scene: this.scene,
        x: 0,
        y: 0,
        data: character,
        onCardCreatedEventCallback: (createdCard) => {
          // add to sizer
          this.characterSizer.addSpace();
          this.characterSizer.add(this.wrapCard(createdCard), { align: 'center' });
          this.characterSizer.addSpace();

          this.characterCards.set(character, createdCard);
        },
      });
    });

    this.characterSizer.layout();
  }

  private wrapCard(card: PhysicalCard): Sizer {
    const wrapper = this.rexUI.add.sizer({ orientation: 'vertical' });
    wrapper.addBackground(this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x333333));

    const gameObject = card.container;
    const depthManager = DepthManager.getInstance();

    // Set initial depth so it's above the overlay base
    gameObject.setDepth(depthManager.OVERLAY_BASE + 100);

    gameObject.setInteractive();
    gameObject.on('pointerover', () => gameObject.setDepth(depthManager.SHOP_CARD_HOVER));
    gameObject.on('pointerout', () => gameObject.setDepth(depthManager.OVERLAY_BASE + 100));

    wrapper.add(gameObject, { align: 'center', padding: 10 });
    return wrapper;
  }

  private displayLocationCard(): void {
    if (this.locationCard) {
      this.locationCard.obliterate();
      this.locationCard = null;
    }

    this.locationSizer.clear(true);

    // re-add heading
    this.buildLocationSection(this.locationSizer);

    const campaignState = CampaignUiState.getInstance();
    if (campaignState.selectedTradeRoute) {
      const phCard = CardGuiUtils.getInstance().createCard({
        scene: this.scene,
        x: 0,
        y: 0,
        data: campaignState.selectedTradeRoute,
        onCardCreatedEventCallback: (createdCard) => {
          this.locationSizer.addSpace();
          this.locationSizer.add(this.wrapCard(createdCard), { align: 'center' });
          this.locationSizer.addSpace();
        },
      });
      this.locationCard = phCard;
    }

    this.locationSizer.layout();
  }

  private displayCargo(): void {
    // clear each scrollable panel
    const availableFixSizer = this.availableCargoSizer.getElement('panel') as FixWidthSizer;
    const purchasedFixSizer = this.purchasedCargoSizer.getElement('panel') as FixWidthSizer;
    availableFixSizer.clear(true);
    purchasedFixSizer.clear(true);

    // Clear existing tooltips
    this.tooltipAttachments.forEach(tooltip => tooltip.destroy());
    this.tooltipAttachments = [];

    const campaignState = CampaignUiState.getInstance();
    const gameState = GameState.getInstance();

    // Reset physicalCard property on all cards before creating new ones
    campaignState.availableTradeGoods.forEach(good => {
      if (good.physicalCard) {
        good.physicalCard = undefined;
      }
    });

    gameState.cargoHolder.cardsInMasterDeck.forEach(good => {
      if (good.physicalCard) {
        good.physicalCard = undefined;
      }
    });

    // build available cargo
    campaignState.availableTradeGoods.forEach((good) => {
      const phCard = CardGuiUtils.getInstance().createCard({
        scene: this.scene,
        x: 0,
        y: 0,
        data: good,
        onCardCreatedEventCallback: (card) => {
          card.disableInternalTooltip = true;
          card.priceContext = PriceContext.SURFACE_BUY
          card.container.setInteractive();
          card.container.on('pointerdown', () => this.purchaseCargo(good));
          this.addHoverDepth(card.container);

          // Create tooltip
          const tooltip = new TooltipAttachment({
            scene: this.scene,
            container: card.container,
            tooltipText: good.description,
          });
          this.tooltipAttachments.push(tooltip);

          const itemSizer = this.makeCargoItem(card, `£${good.surfacePurchaseValue}`);
          availableFixSizer.add(itemSizer);
        },
      });
    });

    // build purchased cargo
    gameState.cargoHolder.cardsInMasterDeck.forEach((good) => {
      const phCard = CardGuiUtils.getInstance().createCard({
        scene: this.scene,
        x: 0,
        y: 0,
        data: good,
        onCardCreatedEventCallback: (card) => {
          card.disableInternalTooltip = true;
          card.priceContext = PriceContext.SURFACE_BUY
          card.container.setInteractive();
          card.container.on('pointerdown', () => this.sellCargo(good));
          this.addHoverDepth(card.container);

          // Create tooltip
          const tooltip = new TooltipAttachment({
            scene: this.scene,
            container: card.container,
            tooltipText: good.description,
          });
          this.tooltipAttachments.push(tooltip);

          const itemSizer = this.makeCargoItem(card, `£${good.surfacePurchaseValue}`);
          purchasedFixSizer.add(itemSizer);
        },
      });
    });

    this.availableCargoSizer.layout();
    this.purchasedCargoSizer.layout();
  }

  private makeCargoItem(card: PhysicalCard, price: string): Sizer {
    const itemSizer = this.rexUI.add.sizer({
      orientation: 'horizontal',
      space: { item: 10 },
    });
    const bg = this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, 0x333333);
    itemSizer.addBackground(bg);

    itemSizer.add(card.container, { align: 'center', padding: 10 });
    const priceText = this.scene.add.text(0, 0, price, { fontSize: '14px', color: '#ffffff' });
    itemSizer.add(priceText, { align: 'center', padding: { right: 10 } });

    return itemSizer;
  }

  private addHoverDepth(go: PhysicalCard['container']) {
    const depthManager = DepthManager.getInstance();
    go.setDepth(depthManager.OVERLAY_BASE + 100);
    go.on('pointerover', () => go.setDepth(depthManager.SHOP_CARD_HOVER));
    go.on('pointerout', () => go.setDepth(depthManager.OVERLAY_BASE + 100));
  }

  private purchaseCargo(good: PlayableCard): void {
    const gameState = GameState.getInstance();
    const campaignState = CampaignUiState.getInstance();

    if (gameState.moneyInVault >= good.surfacePurchaseValue) {
      const idx = campaignState.availableTradeGoods.indexOf(good);
      if (idx > -1) {
        campaignState.availableTradeGoods.splice(idx, 1);
        gameState.cargoHolder.cardsInMasterDeck.push(good);
        gameState.moneyInVault -= good.surfacePurchaseValue;
        good.owningCharacter = gameState.cargoHolder;

        this.scene.events.emit('fundsChanged');
        this.displayCargo();
        this.updateLaunchButton();
      }
    } else {
      (this.statusLabel.getElement('text') as Phaser.GameObjects.Text).setText(`Cannot afford cargo: Need £${good.surfacePurchaseValue}`);
      (this.statusLabel.getElement('background') as Phaser.GameObjects.Rectangle).setFillStyle(0x8b0000);
    }
  }

  private sellCargo(good: PlayableCard): void {
    const gameState = GameState.getInstance();
    const campaignState = CampaignUiState.getInstance();

    const idx = gameState.cargoHolder.cardsInMasterDeck.indexOf(good);
    if (idx > -1) {
      gameState.cargoHolder.cardsInMasterDeck.splice(idx, 1);
      campaignState.availableTradeGoods.push(good);
      gameState.moneyInVault += good.surfacePurchaseValue;

      good.owningCharacter = undefined;
      this.scene.events.emit('fundsChanged');
      this.displayCargo();
      this.updateLaunchButton();
    }
  }

  private updateFunds(): void {
    const textObj = this.fundsLabel.getElement('text') as Phaser.GameObjects.Text;
    textObj.setText(`Available Funds: 💷${GameState.getInstance().moneyInVault}`);
    this.fundsLabel.layout();
  }

  show(): void {
    super.show();
    this.mainSizer.setVisible(true);

    this.displayCharacters();
    this.displayLocationCard();
    this.displayCargo();
    this.updateFunds();
    this.updateLaunchButton();

    this.mainSizer.layout();
  }

  update(): void {
    this.updateLaunchButton();
  }

  public hide(): void {
    super.hide();
    this.mainSizer.setVisible(false);

    // obliterate character cards
    this.characterCards.forEach((card) => card.obliterate());
    this.characterCards.clear();

    // obliterate location card
    if (this.locationCard) {
      this.locationCard.obliterate();
      this.locationCard = null;
    }

    // destroy tooltips
    this.tooltipAttachments.forEach(tooltip => tooltip.destroy());
    this.tooltipAttachments = [];

    // Reset physicalCard property on all cards
    const campaignState = CampaignUiState.getInstance();
    const gameState = GameState.getInstance();

    campaignState.availableTradeGoods.forEach(good => {
      if (good.physicalCard) {
        good.physicalCard = undefined;
      }
    });

    gameState.cargoHolder.cardsInMasterDeck.forEach(good => {
      if (good.physicalCard) {
        good.physicalCard = undefined;
      }
    });
  }
}

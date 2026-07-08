import Phaser, { Scene } from 'phaser';
import { MAX_CONSUMABLE_STOCK } from '../../../../campaign/ConsumableStock';
import { AbstractConsumable } from '../../../../consumables/AbstractConsumable';
import { ConsumablesLibrary } from '../../../../consumables/ConsumablesLibrary';
import { GameState } from '../../../../rules/GameState';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBox } from '../../../../ui/TextBox';
import { drawBackdropDim, drawPaper, drawWoodPanel, Fonts, Palette } from '../../../../ui/UIStyle';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';
import { PlaytestJournal } from '../../../../utils/PlaytestJournal';

const CARD_W = 300;
const CARD_H = 168;
const CARD_GAP_X = 24;
const CARD_GAP_Y = 24;
const COLS = 4;
const GRID_TOP = 220;

/**
 * The Provisioning Office: buy consumables against the Company vault. Shows
 * the full catalog every time — no rotating shop stock in v1. Purchases push
 * straight to campaign stock (CampaignUiState.consumables), capped at
 * MAX_CONSUMABLE_STOCK.
 */
export class QuartermasterPanel extends AbstractHqPanel {
    private dynamic: Phaser.GameObjects.GameObject[] = [];
    private statusText!: Phaser.GameObjects.Text;

    constructor(scene: Scene) {
        super(scene, 'Provisioning Office');
        this.titleText.setVisible(false); // replaced by the styled header

        const dim = drawBackdropDim(scene, 0.5);
        this.add(dim);

        const header = scene.add.container(scene.scale.width / 2, 150);
        header.add(drawWoodPanel(scene, 720, 56));
        header.add(scene.add.text(0, -12, 'PROVISIONING OFFICE', {
            fontFamily: Fonts.DISPLAY, fontSize: '26px', color: Palette.BRASS_TEXT,
        }).setOrigin(0.5));
        this.statusText = scene.add.text(0, 14, '', {
            fontFamily: Fonts.BODY, fontSize: '15px', color: Palette.WHITE,
        }).setOrigin(0.5);
        header.add(this.statusText);
        this.add(header);
    }

    public show(): void {
        this.rebuild();
        super.show();
    }

    private clearDynamic(): void {
        this.dynamic.forEach(o => { this.remove(o); o.destroy(); });
        this.dynamic = [];
    }

    private addDynamic<T extends Phaser.GameObjects.GameObject>(obj: T): T {
        this.dynamic.push(obj);
        this.add(obj);
        return obj;
    }

    private rebuild(): void {
        this.clearDynamic();
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();

        this.statusText.setText(
            `Vault: £${gameState.moneyInVault}   ·   Held stock: ${campaign.consumables.length}/${MAX_CONSUMABLE_STOCK}`
        );

        const catalog = ConsumablesLibrary.getInstance().getAllConsumables();
        const totalW = COLS * CARD_W + (COLS - 1) * CARD_GAP_X;
        const startX = this.scene.scale.width / 2 - totalW / 2 + CARD_W / 2;

        catalog.forEach((consumable, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            const x = startX + col * (CARD_W + CARD_GAP_X);
            const y = GRID_TOP + row * (CARD_H + CARD_GAP_Y) + CARD_H / 2;
            this.addDynamic(this.buildCatalogCard(consumable, x, y));
        });
    }

    /** One priced catalog entry: paper card, name, description, price, buy button. */
    private buildCatalogCard(consumable: AbstractConsumable, x: number, y: number): Phaser.GameObjects.Container {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();
        const price = consumable.basePrice;
        const atCap = campaign.isConsumableStockFull();
        const short = gameState.moneyInVault < price;
        const canBuy = !atCap && !short;

        const container = this.scene.add.container(x, y);
        container.add(drawPaper(this.scene, CARD_W, CARD_H, false));

        container.add(this.scene.add.text(-CARD_W / 2 + 16, -CARD_H / 2 + 16, consumable.getDisplayName(), {
            fontFamily: Fonts.DISPLAY, fontSize: '19px', color: Palette.INK,
            wordWrap: { width: CARD_W - 32 },
        }));

        container.add(this.scene.add.text(-CARD_W / 2 + 16, -CARD_H / 2 + 48, consumable.getDescription(), {
            fontFamily: Fonts.BODY, fontSize: '14px', color: Palette.INK_FADED,
            wordWrap: { width: CARD_W - 32 },
        }));

        container.add(this.scene.add.text(-CARD_W / 2 + 16, CARD_H / 2 - 34, `£${price}`, {
            fontFamily: Fonts.DISPLAY, fontSize: '22px', color: Palette.INK,
        }));

        const btnW = 130, btnH = 40;
        const btn = this.scene.add.container(CARD_W / 2 - btnW / 2 - 14, CARD_H / 2 - btnH / 2 - 10);
        const btnBg = this.scene.add.graphics();
        btnBg.fillStyle(canBuy ? Palette.VERDIGRIS : Palette.DISABLED, 1);
        btnBg.fillRect(-btnW / 2, -btnH / 2, btnW, btnH);
        btnBg.lineStyle(2, canBuy ? Palette.BRASS_BRIGHT : Palette.DISABLED, 0.9);
        btnBg.strokeRect(-btnW / 2 + 2, -btnH / 2 + 2, btnW - 4, btnH - 4);
        btn.add(btnBg);
        const btnLabel = this.scene.add.text(0, 0,
            atCap ? 'STORES FULL' : (short ? 'CAN\'T AFFORD' : 'REQUISITION'), {
            fontFamily: Fonts.DISPLAY, fontSize: '13px', color: canBuy ? Palette.WHITE : Palette.DISABLED_TEXT,
        }).setOrigin(0.5);
        btn.add(btnLabel);
        container.add(btn);

        if (canBuy) {
            btn.setSize(btnW, btnH);
            btn.setInteractive();
            btn.on('pointerover', () => btn.setScale(1.04));
            btn.on('pointerout', () => btn.setScale(1));
            btn.on('pointerdown', () => this.handlePurchase(consumable));
        }

        return container;
    }

    /** Dry bureaucratic denial for the cap/funds cases; a successful buy
     *  rebuilds the panel and autosaves immediately (purchases are a
     *  spend-money action, same as hiring at the Barracks). */
    private handlePurchase(template: AbstractConsumable): void {
        const campaign = CampaignUiState.getInstance();
        const price = template.basePrice;

        if (campaign.isConsumableStockFull()) {
            this.flashStatus(`Requisition denied: the stockroom is full (${MAX_CONSUMABLE_STOCK}/${MAX_CONSUMABLE_STOCK}). File a disposal form before ordering more.`);
            return;
        }
        if (GameState.getInstance().moneyInVault < price) {
            this.flashStatus(`Requisition denied: insufficient funds in the vault. The Quartermaster does not extend credit.`);
            return;
        }

        const instance = new (template.constructor as new () => AbstractConsumable)();
        const purchased = campaign.purchaseConsumable(instance, price);
        if (!purchased) {
            this.flashStatus(`Requisition denied: the Office regrets it cannot fulfil this order at this time.`);
            return;
        }

        SaveManager.save();
        PlaytestJournal.getInstance().record('purchase', { kind: 'consumable', cost: price, name: template.getDisplayName() });
        this.rebuild();
    }

    private flashStatus(message: string): void {
        this.statusText.setText(message);
        this.statusText.setColor(Palette.CRIMSON_TEXT);
        this.scene.time.delayedCall(2200, () => {
            this.statusText.setColor(Palette.WHITE);
            this.rebuild();
        });
    }

    update(): void {
        // Static between interactions; rebuilds on purchase.
    }
}

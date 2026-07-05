import Phaser, { Scene } from 'phaser';
import { Contract } from '../../../../campaign/Contract';
import { SortieManager } from '../../../../campaign/SortieManager';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import {
    drawBackdropDim, drawPaper, drawWaxSeal, drawWoodPanel, Fonts, Palette
} from '../../../../ui/UIStyle';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const SQUAD_SIZE = 3;

const NOTICE_W = 380;
const NOTICE_H = 170;

/**
 * The contract board: a wall of posted notices. Pick one, muster a squad of
 * three from the personnel ledger, and dispatch.
 */
export class ContractBoardPanel extends AbstractHqPanel {
    private dynamic: Phaser.GameObjects.GameObject[] = [];
    private statusText!: Phaser.GameObjects.Text;
    private launchButton!: Phaser.GameObjects.Container;
    private launchChrome!: Phaser.GameObjects.Graphics;
    private launchLabel!: Phaser.GameObjects.Text;
    private selectedSquad: PlayerCharacter[] = [];

    constructor(scene: Scene) {
        super(scene, 'Contract Board');
        this.titleText.setVisible(false); // replaced by the styled header

        const dim = drawBackdropDim(scene, 0.5);
        this.add(dim);

        // Header plaque
        const header = scene.add.container(scene.scale.width / 2, 48);
        header.add(drawWoodPanel(scene, 460, 62));
        header.add(scene.add.text(0, 0, 'THE CONTRACT BOARD', {
            fontFamily: Fonts.DISPLAY, fontSize: '34px', color: Palette.BRASS_TEXT,
        }).setOrigin(0.5));
        this.add(header);

        // Ledger strip along the bottom
        const strip = scene.add.container(scene.scale.width / 2, scene.scale.height - 42);
        strip.add(drawWoodPanel(scene, scene.scale.width - 80, 52));
        this.statusText = scene.add.text(0, 0, '', {
            fontFamily: Fonts.BODY, fontSize: '20px', color: Palette.WHITE,
        }).setOrigin(0.5);
        strip.add(this.statusText);
        this.add(strip);

        // Dispatch plaque: the commit action outranks everything else on screen.
        this.launchButton = scene.add.container(scene.scale.width * 0.82, scene.scale.height - 130);
        this.launchChrome = scene.add.graphics();
        this.launchLabel = scene.add.text(0, 0, 'DISPATCH SQUAD', {
            fontFamily: Fonts.DISPLAY, fontSize: '30px', color: Palette.DISABLED_TEXT,
        }).setOrigin(0.5);
        this.launchButton.add([this.launchChrome, this.launchLabel]);
        this.launchButton.setSize(330, 74);
        this.launchButton.setInteractive();
        this.launchButton.on('pointerover', () => this.launchButton.setScale(1.03));
        this.launchButton.on('pointerout', () => this.launchButton.setScale(1));
        this.launchButton.on('pointerdown', () => this.handleLaunch());
        this.add(this.launchButton);
    }

    private drawLaunchChrome(ready: boolean): void {
        const W = 330, H = 74;
        const g = this.launchChrome;
        g.clear();
        g.fillStyle(Palette.PAPER_SHADOW, 0.55);
        g.fillRect(-W / 2 + 5, -H / 2 + 6, W, H);
        g.fillStyle(ready ? Palette.WAX_RED : Palette.WOOD_PANEL, 1);
        g.fillRect(-W / 2, -H / 2, W, H);
        g.lineStyle(3, ready ? Palette.BRASS_BRIGHT : Palette.DISABLED, 1);
        g.strokeRect(-W / 2 + 4, -H / 2 + 4, W - 8, H - 8);
        this.launchLabel.setColor(ready ? Palette.WHITE : Palette.DISABLED_TEXT);
    }

    public show(): void {
        CampaignUiState.getInstance().ensureContractsPopulated();
        this.selectedSquad = [];
        CampaignUiState.getInstance().selectedContract = null;
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

        // --- The board of notices: staggered columns, like a real pin board ---
        campaign.availableContracts.forEach((contract, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = 310 + col * (NOTICE_W + 56);
            const y = 210 + row * (NOTICE_H + 40) + (col === 1 ? 46 : 0);
            this.addDynamic(this.buildNotice(contract, x, y, i));
        });

        // --- Personnel ledger, right third ---
        const ledgerX = this.scene.scale.width * 0.82;
        const ledgerHeader = this.scene.add.container(ledgerX, 120);
        ledgerHeader.add(drawWoodPanel(this.scene, 340, 46));
        ledgerHeader.add(this.scene.add.text(0, 0,
            `MUSTER ROLL · ${this.selectedSquad.length}/${SQUAD_SIZE}`, {
            fontFamily: Fonts.DISPLAY, fontSize: '24px', color: Palette.BRASS_TEXT,
        }).setOrigin(0.5));
        this.addDynamic(ledgerHeader);

        campaign.roster.forEach((soldier, i) => {
            this.addDynamic(this.buildMusterCard(soldier, ledgerX, 190 + i * 84));
        });

        this.refreshStatus();
    }

    /** One posted notice: paper, seal, title, terms. */
    private buildNotice(contract: Contract, x: number, y: number, index: number): Phaser.GameObjects.Container {
        const campaign = CampaignUiState.getInstance();
        const selected = campaign.selectedContract?.id === contract.id;
        const container = this.scene.add.container(x, y);

        const paper = drawPaper(this.scene, NOTICE_W, NOTICE_H, index % 2 === 1);
        container.add(paper);

        if (selected) {
            const outline = this.scene.add.graphics();
            outline.lineStyle(3, Palette.BRASS_BRIGHT, 1);
            outline.strokeRect(-NOTICE_W / 2 - 4, -NOTICE_H / 2 - 4, NOTICE_W + 8, NOTICE_H + 8);
            container.add(outline);
        }

        // Brass tack, visibly piercing the paper
        const pin = this.scene.add.graphics();
        pin.fillStyle(0x000000, 0.35);
        pin.fillEllipse(2, -NOTICE_H / 2 + 16, 14, 7);
        pin.fillStyle(Palette.BRASS, 1);
        pin.fillCircle(0, -NOTICE_H / 2 + 12, 7);
        pin.fillStyle(Palette.BRASS_BRIGHT, 1);
        pin.fillCircle(-2, -NOTICE_H / 2 + 10, 3);
        container.add(pin);

        container.add(this.scene.add.text(-NOTICE_W / 2 + 18, -NOTICE_H / 2 + 26, contract.name, {
            fontFamily: Fonts.DISPLAY, fontSize: '21px', color: Palette.INK,
            wordWrap: { width: NOTICE_W - 100 },
        }));

        container.add(this.scene.add.text(-NOTICE_W / 2 + 18, -NOTICE_H / 2 + 82, contract.regionName.toUpperCase(), {
            fontFamily: Fonts.UTILITY, fontSize: '12px', color: Palette.INK_FADED, letterSpacing: 2,
        }));

        container.add(this.scene.add.text(-NOTICE_W / 2 + 18, -NOTICE_H / 2 + 104,
            `${contract.numCombats} engagement${contract.numCombats > 1 ? 's' : ''} · ${contract.durationWeeks} weeks in the field`, {
            fontFamily: Fonts.BODY, fontSize: '16px', color: Palette.INK_FADED,
        }));

        const expiry = this.scene.add.text(-NOTICE_W / 2 + 18, NOTICE_H / 2 - 36,
            `EXPIRES IN ${contract.deadlineWeeks} WEEK${contract.deadlineWeeks > 1 ? 'S' : ''}`, {
            fontFamily: Fonts.UTILITY, fontSize: '13px', fontStyle: 'bold',
            color: Palette.CRIMSON_TEXT,
        });
        expiry.setRotation(-0.02);
        container.add(expiry);

        // Payout, ledger-style bottom right
        container.add(this.scene.add.text(NOTICE_W / 2 - 20, NOTICE_H / 2 - 36, `£${contract.payout}`, {
            fontFamily: Fonts.DISPLAY, fontSize: '30px', color: Palette.INK,
        }).setOrigin(1, 0.5));

        // Difficulty seal
        const seal = drawWaxSeal(this.scene, 22, contract.difficultyStars);
        seal.setPosition(NOTICE_W / 2 - 34, -NOTICE_H / 2 + 34);
        container.add(seal);

        // A pinned notice hangs slightly askew.
        container.setRotation(((index * 37) % 5 - 2) * 0.008);

        container.setSize(NOTICE_W, NOTICE_H);
        container.setInteractive();
        container.on('pointerover', () => container.setScale(1.02));
        container.on('pointerout', () => container.setScale(1));
        container.on('pointerdown', () => {
            campaign.selectedContract = contract;
            this.rebuild();
        });
        return container;
    }

    /** One soldier line in the muster roll: framed portrait + name plate. */
    private buildMusterCard(soldier: PlayerCharacter, x: number, y: number): Phaser.GameObjects.Container {
        const inSquad = this.selectedSquad.includes(soldier);
        const fit = soldier.isFitForDuty;
        const W = 340, H = 74;
        const container = this.scene.add.container(x, y);

        const plate = this.scene.add.graphics();
        plate.fillStyle(Palette.PAPER_SHADOW, 0.5);
        plate.fillRect(-W / 2 + 3, -H / 2 + 4, W, H);
        plate.fillStyle(inSquad ? Palette.VERDIGRIS : Palette.WOOD_PANEL, 0.96);
        plate.fillRect(-W / 2, -H / 2, W, H);
        plate.lineStyle(2, inSquad ? Palette.BRASS_BRIGHT : (fit ? Palette.BRASS : Palette.DISABLED), 0.9);
        plate.strokeRect(-W / 2 + 2, -H / 2 + 2, W - 4, H - 4);
        container.add(plate);

        // Portrait in a brass frame
        if (this.scene.textures.exists(soldier.portraitName)) {
            const portrait = this.scene.add.image(-W / 2 + 40, 0, soldier.portraitName).setDisplaySize(58, 58);
            if (!fit) portrait.setTint(0x666666);
            const frame = this.scene.add.graphics();
            frame.lineStyle(2, Palette.BRASS, 1);
            frame.strokeRect(-W / 2 + 11, -29, 58, 58);
            container.add(portrait);
            container.add(frame);
        }

        container.add(this.scene.add.text(-W / 2 + 80, -H / 2 + 12, soldier.name, {
            fontFamily: Fonts.DISPLAY, fontSize: '21px', color: fit ? Palette.WHITE : Palette.DISABLED_TEXT,
        }));
        container.add(this.scene.add.text(-W / 2 + 80, -H / 2 + 40, soldier.characterClass.name, {
            fontFamily: Fonts.BODY, fontSize: '15px', color: Palette.BRASS_TEXT,
        }));

        // Status stamp / stress gauge, right side
        if (soldier.weeksWoundedRemaining > 0) {
            container.add(this.makeStamp(`INFIRMARY ${soldier.weeksWoundedRemaining}w`, W / 2 - 74, 0));
        } else if (!fit) {
            container.add(this.makeStamp('SHAKEN', W / 2 - 74, 0));
        } else if (inSquad) {
            container.add(this.scene.add.text(W / 2 - 20, 0, '✓', {
                fontFamily: Fonts.DISPLAY, fontSize: '30px', color: Palette.BRASS_TEXT,
            }).setOrigin(1, 0.5));
        }
        if (soldier.stress > 0) {
            container.add(this.makeStressGauge(soldier.stress, W / 2 - 128, H / 2 - 14));
        }

        container.setSize(W, H);
        container.setInteractive();
        container.on('pointerover', () => { if (fit) container.setScale(1.02); });
        container.on('pointerout', () => container.setScale(1));
        container.on('pointerdown', () => {
            if (!fit) return;
            if (inSquad) {
                this.selectedSquad = this.selectedSquad.filter(c => c !== soldier);
            } else if (this.selectedSquad.length < SQUAD_SIZE) {
                this.selectedSquad.push(soldier);
            }
            this.rebuild();
        });
        return container;
    }

    private makeStamp(text: string, x: number, y: number): Phaser.GameObjects.Text {
        return this.scene.add.text(x, y, text, {
            fontFamily: Fonts.UTILITY, fontSize: '13px', fontStyle: 'bold',
            color: Palette.CRIMSON_TEXT,
        }).setOrigin(0.5).setRotation(-0.08);
    }

    /** Ten-segment stress gauge. */
    private makeStressGauge(stress: number, x: number, y: number): Phaser.GameObjects.Graphics {
        const g = this.scene.add.graphics();
        const segW = 9, segH = 6, gap = 2;
        for (let i = 0; i < 10; i++) {
            const filled = i < stress;
            g.fillStyle(filled ? (stress >= 7 ? Palette.WAX_RED : Palette.BRASS) : 0x1a120c, filled ? 1 : 0.8);
            g.fillRect(x + i * (segW + gap), y - segH / 2, segW, segH);
        }
        return g;
    }

    private refreshStatus(): void {
        const campaign = CampaignUiState.getInstance();
        const contract = campaign.selectedContract;
        const cal = campaign.calendar;

        const briefing = contract
            ? `"${contract.description}"`
            : `Year ${cal.year}, Q${cal.quarterOfYear}, week ${cal.weekOfQuarter} of 13   ·   ` +
              `Dividend of £${cal.currentDividendExpectation} due in ${cal.weeksUntilDividend}w   ·   ` +
              `Satisfaction ${cal.shareholderSatisfaction}/100`;
        this.statusText.setText(`${briefing}   ·   Squad ${this.selectedSquad.length}/${SQUAD_SIZE}`);

        const ready = contract !== null && this.selectedSquad.length === SQUAD_SIZE;
        this.drawLaunchChrome(ready);
    }

    private handleLaunch(): void {
        const campaign = CampaignUiState.getInstance();
        if (!campaign.selectedContract || this.selectedSquad.length !== SQUAD_SIZE) {
            return;
        }
        SortieManager.getInstance().startSortie(campaign.selectedContract, [...this.selectedSquad]);
    }

    update(): void {
        // Static between interactions; rebuilds on click.
    }
}

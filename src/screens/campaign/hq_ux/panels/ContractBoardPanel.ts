import Phaser, { Scene } from 'phaser';
import { isCharteredPartner } from '../../../../campaign/ClientReputation';
import { Contract } from '../../../../campaign/Contract';
import { SortieManager } from '../../../../campaign/SortieManager';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { DepthManager } from '../../../../ui/DepthManager';
import { TextBox } from '../../../../ui/TextBox';
import {
    drawBackdropDim, drawPaper, drawWaxSeal, drawWoodPanel, Fonts, Palette
} from '../../../../ui/UIStyle';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';
import {
    computePinPositions, PIN_TAG_H, PIN_TAG_W, REGION_ANCHORS,
} from './contractPinLayout';

const NOTICE_W = 380;
const NOTICE_H = 240;

/** Roman numerals, matching the tally marks drawWaxSeal engraves on the wax. */
const ROMAN_NUMERALS = ['I', 'II', 'III'];

/** Screen rect the survey map image occupies (see class doc for the source
 *  geography this was measured against). */
const MAP_RECT = { x: 32, y: 110, width: 1344, height: 896 };

/** Where the selected contract's full notice docks: a cartouche over the
 *  dark inland sea, lower-left of the map, where the geography is empty. */
const NOTICE_POS = { x: 270, y: 880 };

/** Keep-out margin around the docked notice cartouche. */
const NOTICE_KEEPOUT_MARGIN = 15;

/** The map art's ornate compass rose (normalized image coords; radius as a
 *  fraction of image width). Pins and their tags stay clear of it. */
const COMPASS_ROSE = { x: 0.80, y: 0.76, radiusFrac: 0.12 };

/**
 * The contract board: a survey map of Hell. Contracts appear as brass-tacked
 * pins scattered around their posting region; pick one, muster a squad from
 * the personnel ledger, and dispatch.
 */
export class ContractBoardPanel extends AbstractHqPanel {
    private dynamic: Phaser.GameObjects.GameObject[] = [];
    private statusText!: Phaser.GameObjects.Text;
    private launchButton!: Phaser.GameObjects.Container;
    private launchChrome!: Phaser.GameObjects.Graphics;
    private launchLabel!: Phaser.GameObjects.Text;
    private selectedSquad: PlayerCharacter[] = [];
    private hoverTooltip: TextBox | null = null;
    /** Freight stepper state, Trade Run notices only. Reset whenever the
     *  selected contract changes (see the pin pointerdown handler). */
    private cratesLoaded: number = 0;

    constructor(scene: Scene) {
        super(scene, 'Contract Board');
        this.titleText.setVisible(false); // replaced by the styled header

        const dim = drawBackdropDim(scene, 0.5);
        this.add(dim);

        // No header plaque: the tab rail (chrome, above) names this view.

        // Survey map, a brass/wood frame around the parchment.
        const mapCenterX = MAP_RECT.x + MAP_RECT.width / 2;
        const mapCenterY = MAP_RECT.y + MAP_RECT.height / 2;
        const frame = scene.add.graphics();
        frame.lineStyle(8, Palette.WOOD_PANEL, 1);
        frame.strokeRect(MAP_RECT.x - 4, MAP_RECT.y - 4, MAP_RECT.width + 8, MAP_RECT.height + 8);
        frame.lineStyle(3, Palette.BRASS, 1);
        frame.strokeRect(MAP_RECT.x - 4, MAP_RECT.y - 4, MAP_RECT.width + 8, MAP_RECT.height + 8);
        this.add(frame);

        const mapImage = scene.add.image(mapCenterX, mapCenterY, 'contract-map-hell')
            .setDisplaySize(MAP_RECT.width, MAP_RECT.height);
        this.add(mapImage);

        // Region labels: geography, not contract state, so drawn once here
        // rather than rebuilt on every selection change.
        Object.entries(REGION_ANCHORS).forEach(([regionName, { label }], i) => {
            if (!label) return;
            const pos = this.imageToScreen(label.x, label.y);
            const rotation = ((i % 2 === 0) ? 1 : -1) * (0.02 + (i % 3) * 0.007);
            const text = scene.add.text(pos.x, pos.y, regionName.toUpperCase(), {
                fontFamily: Fonts.DISPLAY, fontSize: '22px', color: Palette.INK,
            }).setOrigin(0.5).setRotation(rotation);
            text.setStroke('#e4d5b0', 4);
            this.add(text);
        });

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

    /** Normalized image coords (0..1, top-left origin) to panel-local screen
     *  coords, via the fixed MAP_RECT the map image is displayed at. */
    private imageToScreen(nx: number, ny: number): { x: number; y: number } {
        return {
            x: MAP_RECT.x + nx * MAP_RECT.width,
            y: MAP_RECT.y + ny * MAP_RECT.height,
        };
    }

    /** The keep-out rectangle around the docked notice cartouche, in the
     *  {x, y, width, height} shape contractPinLayout expects: pins must
     *  never be even partially covered by the selected contract's notice. */
    private static noticeKeepOutRect(): { x: number; y: number; width: number; height: number } {
        return {
            x: NOTICE_POS.x - NOTICE_W / 2 - NOTICE_KEEPOUT_MARGIN,
            y: NOTICE_POS.y - NOTICE_H / 2 - NOTICE_KEEPOUT_MARGIN,
            width: NOTICE_W + NOTICE_KEEPOUT_MARGIN * 2,
            height: NOTICE_H + NOTICE_KEEPOUT_MARGIN * 2,
        };
    }

    /** The map art's ornate compass rose, in screen space. */
    private static compassRoseCircle(): { x: number; y: number; radius: number } {
        return {
            x: MAP_RECT.x + COMPASS_ROSE.x * MAP_RECT.width,
            y: MAP_RECT.y + COMPASS_ROSE.y * MAP_RECT.height,
            radius: COMPASS_ROSE.radiusFrac * MAP_RECT.width,
        };
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
        this.cratesLoaded = 0;
        CampaignUiState.getInstance().selectedContract = null;
        this.rebuild();
        super.show();
    }

    /** The squad size the currently-selected contract requires. No contract
     *  selected yet: the standard complement of three, purely for the
     *  placeholder status line (the launch gate always re-checks against the
     *  actually-selected contract before dispatch). */
    private requiredSquadSize(): number {
        return CampaignUiState.getInstance().selectedContract?.squadSize ?? 3;
    }

    /** Short Company-register phrase for a notice's crew requirement. */
    private static crewRequirementLabel(squadSize: number): string {
        switch (squadSize) {
            case 2: return 'Crew of two, danger rates.';
            case 4: return 'Full push: crew of four.';
            default: return 'Standard complement of three.';
        }
    }

    private clearDynamic(): void {
        this.hideHoverTooltip();
        this.dynamic.forEach(o => { this.remove(o); o.destroy(); });
        this.dynamic = [];
    }

    private addDynamic<T extends Phaser.GameObjects.GameObject>(obj: T): T {
        this.dynamic.push(obj);
        this.add(obj);
        return obj;
    }

    /**
     * Small paper-styled plaque explaining a posted notice's seal or payout.
     * Positioned near (x, y) in panel-local space, clamped so it never runs
     * off the right edge. Only one is ever shown at a time.
     */
    private showHoverTooltip(bbcodeText: string, x: number, y: number): void {
        this.hideHoverTooltip();
        const tooltip = new TextBox({
            scene: this.scene,
            x, y,
            width: 260,
            text: bbcodeText,
            fillColor: Palette.PAPER_SHADOW,
            style: { fontSize: '15px', fontFamily: Fonts.BODY, color: Palette.WHITE },
        });
        tooltip.setDepth(DepthManager.getInstance().TOOLTIP);
        tooltip.disableInteractive();

        // Clamp so it stays on-screen for notices near the right edge.
        const halfW = tooltip.width / 2;
        const minX = halfW + 8;
        const maxX = this.scene.scale.width - halfW - 8;
        tooltip.x = Phaser.Math.Clamp(tooltip.x, minX, maxX);
        const minY = tooltip.height / 2 + 8;
        tooltip.y = Math.max(tooltip.y, minY);

        this.hoverTooltip = tooltip;
        this.addDynamic(tooltip);
    }

    private hideHoverTooltip(): void {
        if (this.hoverTooltip) {
            const idx = this.dynamic.indexOf(this.hoverTooltip);
            if (idx >= 0) this.dynamic.splice(idx, 1);
            this.remove(this.hoverTooltip);
            this.hoverTooltip.destroy();
            this.hoverTooltip = null;
        }
    }

    private rebuild(): void {
        this.clearDynamic();
        const campaign = CampaignUiState.getInstance();

        // --- Survey map: one pin per posted contract, scattered around its
        // region anchor. All positions are computed together (not pin by
        // pin) so later pins can steer clear of earlier ones. ---
        const pinPositions = computePinPositions(
            campaign.availableContracts,
            MAP_RECT,
            ContractBoardPanel.noticeKeepOutRect(),
            ContractBoardPanel.compassRoseCircle(),
        );
        campaign.availableContracts.forEach((contract, i) => {
            const { x, y } = pinPositions[i];
            this.addDynamic(this.buildContractPin(contract, x, y));
        });

        // --- Docked notice for the selected contract: a cartouche over the
        // map's dark inland sea, clear of the muster roll at any roster size.
        // The pin scatter treats its rect as a keep-out zone, so it never
        // covers a pin either.
        if (campaign.selectedContract) {
            this.addDynamic(this.buildNotice(campaign.selectedContract, NOTICE_POS.x, NOTICE_POS.y));
        }

        // --- Freight stepper: Trade Run notices only ---
        if (campaign.selectedContract?.isTradeRun) {
            this.addDynamic(this.buildFreightStepper(campaign.selectedContract));
        }

        // --- Personnel ledger, right third ---
        // Chrome (status bar + tab rail) occupies y 0-100; the muster header
        // sits below it with headroom to spare.
        const ledgerX = this.scene.scale.width * 0.82;
        const ledgerHeader = this.scene.add.container(ledgerX, 135);
        ledgerHeader.add(drawWoodPanel(this.scene, 340, 46));
        ledgerHeader.add(this.scene.add.text(0, 0,
            `MUSTER ROLL · ${this.selectedSquad.length}/${this.requiredSquadSize()}`, {
            fontFamily: Fonts.DISPLAY, fontSize: '24px', color: Palette.BRASS_TEXT,
        }).setOrigin(0.5));
        this.addDynamic(ledgerHeader);

        campaign.roster.forEach((soldier, i) => {
            this.addDynamic(this.buildMusterCard(soldier, ledgerX, 205 + i * 84));
        });

        this.refreshStatus();
    }

    /** One brass-tacked pin on the survey map, marking a posted contract. */
    private buildContractPin(contract: Contract, x: number, y: number): Phaser.GameObjects.Container {
        const campaign = CampaignUiState.getInstance();
        const selected = campaign.selectedContract?.id === contract.id;

        const container = this.scene.add.container(x, y);

        if (selected) {
            const outline = this.scene.add.graphics();
            outline.lineStyle(3, Palette.BRASS_BRIGHT, 1);
            outline.strokeCircle(0, -6, 20);
            outline.strokeRect(-PIN_TAG_W / 2 - 4, PIN_TAG_H / 2 - 4, PIN_TAG_W + 8, PIN_TAG_H + 8);
            container.add(outline);
        }

        // Brass tack head, piercing the map.
        const tack = this.scene.add.graphics();
        tack.fillStyle(0x000000, 0.35);
        tack.fillEllipse(2, -2, 14, 7);
        tack.fillStyle(Palette.BRASS, 1);
        tack.fillCircle(0, -6, 9);
        tack.fillStyle(Palette.BRASS_BRIGHT, 1);
        tack.fillCircle(-2.5, -8.5, 3.5);
        container.add(tack);

        // Difficulty wax seal doubles as the pin's head ornament.
        const seal = drawWaxSeal(this.scene, 14, contract.difficultyStars);
        seal.setPosition(0, -6);
        container.add(seal);
        seal.setSize(28, 28);
        seal.setInteractive({ useHandCursor: false });
        seal.on('pointerover', () => {
            const numeral = ROMAN_NUMERALS[contract.difficultyStars - 1] ?? ROMAN_NUMERALS[ROMAN_NUMERALS.length - 1];
            this.showHoverTooltip(
                `Difficulty [b]${numeral}[/b] of III — the Survey Desk's estimate of local resistance. ` +
                `Harder postings pay better.`,
                container.x + seal.x, container.y + seal.y - 40,
            );
        });
        seal.on('pointerout', () => this.hideHoverTooltip());

        // Small parchment tag beneath the pin: name + payout (VP, for a
        // Prestige Commission — see design doc "Payout: £0").
        const tagY = PIN_TAG_H / 2 + 14;
        const tag = this.scene.add.container(0, tagY);
        tag.add(drawPaper(this.scene, PIN_TAG_W, PIN_TAG_H));
        tag.add(this.scene.add.text(-PIN_TAG_W / 2 + 8, -PIN_TAG_H / 2 + 6, contract.name, {
            fontFamily: Fonts.DISPLAY, fontSize: '15px', color: Palette.INK,
            wordWrap: { width: PIN_TAG_W - 16 },
            maxLines: 2,
        }));
        const tagPayoutLabel = contract.isPrestige ? `${contract.vpReward} VP` : `£${contract.payout}`;
        tag.add(this.scene.add.text(PIN_TAG_W / 2 - 8, PIN_TAG_H / 2 - 8, tagPayoutLabel, {
            fontFamily: Fonts.DISPLAY, fontSize: '18px', color: contract.isPrestige ? Palette.GOOD_TEXT : Palette.INK,
        }).setOrigin(1, 1));
        container.add(tag);

        container.setSize(PIN_TAG_W, PIN_TAG_H + 40);
        container.setInteractive();
        container.on('pointerover', () => {
            container.setScale(1.06);
            const weeksLabel = `${contract.durationWeeks} week${contract.durationWeeks > 1 ? 's' : ''}`;
            const engagementsLabel = `${contract.numCombats} engagement${contract.numCombats > 1 ? 's' : ''}`;
            const deadlineLabel = `${contract.deadlineWeeks} week${contract.deadlineWeeks > 1 ? 's' : ''}`;
            this.showHoverTooltip(
                `[b]${contract.name}[/b]\n${contract.client}\n` +
                `${engagementsLabel} · ${weeksLabel} · ${ContractBoardPanel.crewRequirementLabel(contract.squadSize)}\n` +
                `Expires in ${deadlineLabel}`,
                container.x, container.y - 90,
            );
        });
        container.on('pointerout', () => {
            container.setScale(1);
            this.hideHoverTooltip();
        });
        container.on('pointerdown', () => {
            const switchingContract = campaign.selectedContract?.id !== contract.id;
            campaign.selectedContract = contract;
            // Switching to a pin with fewer slots than currently selected:
            // trim the overflow off the end rather than wiping the whole
            // selection (keeps as much of a careful muster as still fits).
            if (this.selectedSquad.length > contract.squadSize) {
                this.selectedSquad = this.selectedSquad.slice(0, contract.squadSize);
            }
            // Freight stepper resets whenever the selected contract changes
            // (re-clicking the same already-selected pin keeps the count).
            if (switchingContract) {
                this.cratesLoaded = 0;
            }
            this.rebuild();
        });
        return container;
    }

    /** The one full posted notice, docked for whichever contract is
     *  currently selected. Display + tooltips only — clicking it does not
     *  re-select or trim (that only happens via the map pin). */
    private buildNotice(contract: Contract, x: number, y: number): Phaser.GameObjects.Container {
        const campaign = CampaignUiState.getInstance();
        const container = this.scene.add.container(x, y);

        const paper = drawPaper(this.scene, NOTICE_W, NOTICE_H, false);
        container.add(paper);

        const outline = this.scene.add.graphics();
        outline.lineStyle(3, Palette.BRASS_BRIGHT, 1);
        outline.strokeRect(-NOTICE_W / 2 - 4, -NOTICE_H / 2 - 4, NOTICE_W + 8, NOTICE_H + 8);
        container.add(outline);

        // Brass tack, visibly piercing the paper
        const pin = this.scene.add.graphics();
        pin.fillStyle(0x000000, 0.35);
        pin.fillEllipse(2, -NOTICE_H / 2 + 16, 14, 7);
        pin.fillStyle(Palette.BRASS, 1);
        pin.fillCircle(0, -NOTICE_H / 2 + 12, 7);
        pin.fillStyle(Palette.BRASS_BRIGHT, 1);
        pin.fillCircle(-2, -NOTICE_H / 2 + 10, 3);
        container.add(pin);

        // Flowed block: name, client line, engagements line, and the italic
        // footer stack top-to-bottom, each positioned below the previous by
        // its measured height + a small gap. Fixed y-offsets used to collide
        // whenever a line word-wrapped; flowing avoids that regardless of
        // how many lines any given piece of text takes. maxLines caps on the
        // name and footer keep pathologically long content from bursting
        // the paper even with the taller NOTICE_H.
        const flowGap = 6;
        let flowY = -NOTICE_H / 2 + 26;

        const nameText = this.scene.add.text(-NOTICE_W / 2 + 18, flowY, contract.name, {
            fontFamily: Fonts.DISPLAY, fontSize: '21px', color: Palette.INK,
            wordWrap: { width: NOTICE_W - 100 },
            maxLines: 2,
        });
        container.add(nameText);
        flowY += nameText.height + flowGap;

        // Prestige Commissions (src/docs/vp_endgame_design.md) are styled as
        // a commendation: the Court of Directors client tag reads distinctly
        // from an ordinary Chartered Partner tag, and never carries one
        // (it's an internal client, exempt from retainer tracking — see
        // ContractGenerator's COURT_OF_DIRECTORS_CLIENT doc).
        const chartered = !contract.isPrestige && isCharteredPartner(contract.client, campaign.contractsCompletedByClient);
        const clientLine = contract.isPrestige
            ? `COMMENDATION · ${contract.client.toUpperCase()}`
            : `CLIENT: ${contract.client.toUpperCase()}${chartered ? ' · CHARTERED PARTNER' : ''}`;
        const clientText = this.scene.add.text(-NOTICE_W / 2 + 18, flowY, clientLine, {
            fontFamily: Fonts.UTILITY, fontSize: '12px',
            color: contract.isPrestige ? Palette.GOOD_TEXT : (chartered ? Palette.GOOD_TEXT : Palette.INK_FADED),
            letterSpacing: 2,
            wordWrap: { width: NOTICE_W - 36 },
        });
        container.add(clientText);
        flowY += clientText.height + flowGap;

        const engagementsText = this.scene.add.text(-NOTICE_W / 2 + 18, flowY,
            `${contract.numCombats} engagement${contract.numCombats > 1 ? 's' : ''} · ${contract.durationWeeks} weeks · ${contract.regionName}`, {
            fontFamily: Fonts.BODY, fontSize: '16px', color: Palette.INK_FADED,
        });
        container.add(engagementsText);
        flowY += engagementsText.height + flowGap;

        const crewLabel = ContractBoardPanel.crewRequirementLabel(contract.squadSize);
        const freightLabel = contract.isTradeRun
            ? ` · £${contract.freightRatePerCrate} per crate delivered, carriage of up to ${contract.maxCrates}`
            : '';
        const noticeFooterLine = contract.isPrestige
            ? `${crewLabel} · The Court of Directors notes its satisfaction. It does not pay in anything so vulgar as money.`
            : contract.consumableRewardName
                ? `${crewLabel}${freightLabel} · Provisioning grant included: ${contract.consumableRewardName}`
                : `${crewLabel}${freightLabel}`;
        const footerText = this.scene.add.text(-NOTICE_W / 2 + 18, flowY, noticeFooterLine, {
            fontFamily: Fonts.BODY, fontSize: '13px', fontStyle: 'italic', color: Palette.INK_FADED,
            wordWrap: { width: NOTICE_W - 40 },
            maxLines: 3,
        });
        container.add(footerText);

        const expiry = this.scene.add.text(-NOTICE_W / 2 + 18, NOTICE_H / 2 - 36,
            `EXPIRES IN ${contract.deadlineWeeks} WEEK${contract.deadlineWeeks > 1 ? 'S' : ''}`, {
            fontFamily: Fonts.UTILITY, fontSize: '13px', fontStyle: 'bold',
            color: Palette.CRIMSON_TEXT,
        });
        expiry.setRotation(-0.02);
        container.add(expiry);

        // Payout, ledger-style bottom right. Trade runs quote the low base
        // here — the freight stepper shows the projected total once selected.
        // Prestige Commissions show VP instead of £ (payout is always 0).
        const payoutLabel = contract.isPrestige
            ? `${contract.vpReward} VP`
            : (contract.isTradeRun ? `£${contract.payout}+` : `£${contract.payout}`);
        const payoutText = this.scene.add.text(NOTICE_W / 2 - 20, NOTICE_H / 2 - 36, payoutLabel, {
            fontFamily: Fonts.DISPLAY, fontSize: '30px', color: contract.isPrestige ? Palette.GOOD_TEXT : Palette.INK,
        }).setOrigin(1, 0.5);
        container.add(payoutText);
        payoutText.setInteractive({ useHandCursor: false });
        payoutText.on('pointerover', () => {
            const tooltip = contract.isPrestige
                ? `Commission fee on completion: [b]${contract.vpReward} VP[/b], entered directly into the charter's honors. No £ changes hands.`
                : contract.isTradeRun
                    ? `Base payment on delivery: [b]£${contract.payout}[/b], plus [b]£${contract.freightRatePerCrate}[/b] per crate carried, banked directly to the Company vault.`
                    : `Payment on completion: [b]£${contract.payout}[/b], banked directly to the Company vault.`;
            this.showHoverTooltip(
                tooltip,
                container.x + payoutText.x, container.y + payoutText.y - 24,
            );
        });
        payoutText.on('pointerout', () => this.hideHoverTooltip());

        // Difficulty seal
        const seal = drawWaxSeal(this.scene, 22, contract.difficultyStars);
        seal.setPosition(NOTICE_W / 2 - 34, -NOTICE_H / 2 + 34);
        container.add(seal);
        seal.setSize(44, 44);
        seal.setInteractive({ useHandCursor: false });
        seal.on('pointerover', () => {
            const numeral = ROMAN_NUMERALS[contract.difficultyStars - 1] ?? ROMAN_NUMERALS[ROMAN_NUMERALS.length - 1];
            this.showHoverTooltip(
                `Difficulty [b]${numeral}[/b] of III — the Survey Desk's estimate of local resistance. ` +
                `Harder postings pay better.`,
                container.x + seal.x, container.y + seal.y + 30,
            );
        });
        seal.on('pointerout', () => this.hideHoverTooltip());

        // Display + tooltips only: no pointerdown handler, this notice
        // neither re-selects nor trims the muster (selection happens via the
        // map pins, which also own the freight-stepper reset).
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
            } else if (this.selectedSquad.length < this.requiredSquadSize()) {
                this.selectedSquad.push(soldier);
            }
            this.rebuild();
        });
        return container;
    }

    /**
     * Freight stepper: +/- crate count for a selected Trade Run notice.
     * Projected payout (base + crates x freightRate) updates live. Launch
     * gate is unchanged by crate count — only the squad-size check gates
     * dispatch (see refreshStatus).
     */
    private buildFreightStepper(contract: Contract): Phaser.GameObjects.Container {
        // Sits above the dispatch plaque, clear of both the launch button
        // (scale.height - 130) below and the muster roll cards above.
        const x = this.scene.scale.width * 0.82;
        const y = this.scene.scale.height - 220;
        const container = this.scene.add.container(x, y);
        const W = 340, H = 74;

        container.add(drawWoodPanel(this.scene, W, H));
        container.add(this.scene.add.text(0, -H / 2 + 16,
            `FREIGHT: ${contract.cratesLoaded}/${contract.maxCrates} CRATES`, {
            fontFamily: Fonts.DISPLAY, fontSize: '18px', color: Palette.BRASS_TEXT,
        }).setOrigin(0.5));
        container.add(this.scene.add.text(0, H / 2 - 16,
            `Projected: £${contract.projectedPayout}`, {
            fontFamily: Fonts.BODY, fontSize: '16px', color: Palette.WHITE,
        }).setOrigin(0.5));

        const makeStepButton = (label: string, dx: number, delta: number): void => {
            const btn = this.scene.add.container(dx, 0);
            const chrome = this.scene.add.graphics();
            const enabled = delta > 0
                ? contract.cratesLoaded < contract.maxCrates
                : contract.cratesLoaded > 0;
            chrome.fillStyle(enabled ? Palette.WAX_RED : Palette.WOOD_PANEL, 1);
            chrome.fillRect(-22, -22, 44, 44);
            chrome.lineStyle(2, enabled ? Palette.BRASS_BRIGHT : Palette.DISABLED, 1);
            chrome.strokeRect(-22, -22, 44, 44);
            const label_ = this.scene.add.text(0, -2, label, {
                fontFamily: Fonts.DISPLAY, fontSize: '26px',
                color: enabled ? Palette.WHITE : Palette.DISABLED_TEXT,
            }).setOrigin(0.5);
            btn.add([chrome, label_]);
            btn.setSize(44, 44);
            if (enabled) {
                btn.setInteractive();
                btn.on('pointerover', () => btn.setScale(1.05));
                btn.on('pointerout', () => btn.setScale(1));
                btn.on('pointerdown', () => {
                    this.cratesLoaded = Phaser.Math.Clamp(this.cratesLoaded + delta, 0, contract.maxCrates);
                    contract.cratesLoaded = this.cratesLoaded;
                    this.rebuild();
                });
            }
            container.add(btn);
        };
        makeStepButton('-', -W / 2 + 32, -1);
        makeStepButton('+', W / 2 - 32, 1);

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
        const required = this.requiredSquadSize();

        const freightNote = contract?.isTradeRun
            ? `  ·  ${contract.cratesLoaded} crate(s) loaded, £${contract.projectedPayout} projected`
            : '';
        const briefing = contract
            ? `"${contract.description}"  ·  ${contract.paymentClause}${freightNote}`
            : `Select a posting on the map and muster your squad.`;
        this.statusText.setText(`${briefing}   ·   Squad ${this.selectedSquad.length}/${required}`);

        const ready = contract !== null && this.selectedSquad.length === required;
        this.drawLaunchChrome(ready);
    }

    private handleLaunch(): void {
        const campaign = CampaignUiState.getInstance();
        if (!campaign.selectedContract || this.selectedSquad.length !== campaign.selectedContract.squadSize) {
            return;
        }
        SortieManager.getInstance().startSortie(campaign.selectedContract, [...this.selectedSquad]);
    }

    update(): void {
        // Static between interactions; rebuilds on click.
    }
}

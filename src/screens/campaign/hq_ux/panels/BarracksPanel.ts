import Phaser, { Scene } from 'phaser';
import { deckCap, isAtDeckCap, pendingLevels, relicSlots } from '../../../../campaign/Leveling';
import { RUSH_TREATMENT_COST_PER_WEEK } from '../../../../campaign/RushTreatment';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { AbstractRelic } from '../../../../relics/AbstractRelic';
import { ModifierContext } from '../../../../rules/modifiers/AbstractCardModifier';
import { CardModifierRegistry } from '../../../../rules/modifiers/CardModifierRegistry';
import { GameState } from '../../../../rules/GameState';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBoxButton } from '../../../../ui/Button';
import { DepthManager } from '../../../../ui/DepthManager';
import { TextBox } from '../../../../ui/TextBox';
import { drawBackdropDim, drawWoodPanel, Fonts, Palette } from '../../../../ui/UIStyle';
import { CampaignUiState, RELIC_INSURANCE_COST } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';
import { PlaytestJournal } from '../../../../utils/PlaytestJournal';
import { CorrectivePhrenologyWing } from '../../../../strategic_projects/CorrectivePhrenologyWing';
import { BEQUEST_COST, ProbateAndEffectsOffice } from '../../../../strategic_projects/ProbateAndEffectsOffice';
import { ThePatternRoom } from '../../../../strategic_projects/ThePatternRoom';
import { LongServiceTestimonialsBoard, TESTIMONIAL_VP_PER_LEVEL } from '../../../../strategic_projects/LongServiceTestimonialsBoard';
import { DRILL_COST, DRILL_MAX_LEVEL, DRILL_XP, SchoolOfMusketry } from '../../../../strategic_projects/SchoolOfMusketry';
import { SALVAGE_SELL_FRACTION, WattleAndGraySalvageAuctioneers } from '../../../../strategic_projects/WattleAndGraySalvageAuctioneers';

const REMOVAL_COST = 40;
const UPGRADE_COST = 60;
const THERAPY_COST = 30;
const THERAPY_RELIEF = 4;
const REMOVAL_GATE = new CorrectivePhrenologyWing().name;
const UPGRADE_GATE = new ThePatternRoom().name;
const BEQUEST_GATE = new ProbateAndEffectsOffice().name;
const RETIRE_GATE = new LongServiceTestimonialsBoard().name;
const DRILL_GATE = new SchoolOfMusketry().name;
const SALVAGE_GATE = new WattleAndGraySalvageAuctioneers().name;
const ARMOURY_PICKER_DEPTH = DepthManager.getInstance().REWARD_SCREEN + 2000;

/**
 * Roster management: inspect a soldier's deck, remove or upgrade cards
 * (gated by strategic projects), and hire recruits. Presented as a
 * personnel ledger — three columns of ruled entries (roster, deck,
 * recruits) on the Company's headed paper.
 */
export class BarracksPanel extends AbstractHqPanel {
    private dynamicElements: Phaser.GameObjects.GameObject[] = [];
    private statusLine: TextBox;

    private selectedSoldier: PlayerCharacter | null = null;
    private selectedCard: PlayableCard | null = null;

    /** Arm-confirm state for the irreversible Retire with Testimonial
     *  action (The Long Service & Testimonials Board): first click arms,
     *  second executes. Disarmed whenever another soldier is selected (and
     *  on show); the retire button renders its armed state from this. */
    private armedRetirement: PlayerCharacter | null = null;

    /** Armoury picker overlay: shown after clicking an empty equipment slot. */
    private armouryPickerElements: Phaser.GameObjects.GameObject[] = [];

    constructor(scene: Scene) {
        super(scene, 'Barracks');
        this.titleText.setVisible(false); // tab rail names the view

        const dim = drawBackdropDim(scene, 0.5);
        this.add(dim);

        const statusStrip = scene.add.container(scene.scale.width / 2, scene.scale.height - 60);
        statusStrip.add(drawWoodPanel(scene, 1100, 44));
        this.statusLine = new TextBox({
            scene,
            x: 0,
            y: 0,
            width: 1080,
            height: 40,
            text: '',
            fillColor: Palette.WOOD_PANEL,
            style: { fontSize: '17px', fontFamily: Fonts.BODY, color: Palette.BRASS_TEXT }
        });
        this.statusLine.setStroke(false);
        statusStrip.add(this.statusLine);
        this.add(statusStrip);
    }

    public show(): void {
        CampaignUiState.getInstance().ensureRecruitsPopulated();
        this.selectedSoldier = null;
        this.selectedCard = null;
        this.armedRetirement = null;
        this.clearArmouryPicker();
        this.rebuild();
        super.show();
    }

    private clearDynamic(): void {
        this.dynamicElements.forEach(e => { this.remove(e); e.destroy(); });
        this.dynamicElements = [];
    }

    private addDynamic<T extends Phaser.GameObjects.GameObject>(obj: T): T {
        this.dynamicElements.push(obj);
        this.add(obj);
        return obj;
    }

    private rebuild(): void {
        this.clearDynamic();
        this.clearArmouryPicker();
        const campaign = CampaignUiState.getInstance();
        const width = this.scene.scale.width;

        // --- Roster, left column ---
        // Chrome (status bar + tab rail) occupies y 0-100; column headers
        // start below it with headroom to spare.
        this.addDynamic(this.buildColumnHeader(`ROSTER · ${campaign.roster.length}/${campaign.getRosterCap()}`, width * 0.14, 130, 420));
        campaign.roster.forEach((soldier, i) => {
            const selected = this.selectedSoldier === soldier;
            const trait = soldier.buffs.find(b => b.isPersonaTrait)?.getDisplayName() ?? '';
            const status = soldier.weeksWoundedRemaining > 0
                ? ` — WOUNDED ${soldier.weeksWoundedRemaining}w`
                : (soldier.stress >= PlayerCharacter.STRESS_DEPLOYMENT_LIMIT ? ' — SHAKEN' : '');
            const label = `${soldier.name} (${soldier.characterClass.name}) — Lv ${soldier.level}`
                + (trait ? ` — ${trait}` : '')
                + (soldier.stress > 0 ? ` — stress ${soldier.stress}` : '')
                + status;
            const y = 180 + i * 52;
            if (this.scene.textures.exists(soldier.portraitName)) {
                const portrait = this.scene.add.image(width * 0.14 - 225, y, soldier.portraitName)
                    .setDisplaySize(44, 44);
                this.addDynamic(portrait);
            }
            const button = this.addDynamic(new TextBoxButton({
                scene: this.scene, x: width * 0.14, y, width: 400, height: 44,
                text: label,
                style: { fontSize: '14px', fontFamily: Fonts.BODY, color: Palette.WHITE },
                fillColor: selected ? Palette.VERDIGRIS : Palette.WOOD_PANEL
            }));
            button.onClick(() => {
                // Selecting a (different) soldier disarms any pending
                // retirement confirmation.
                if (this.armedRetirement !== soldier) this.armedRetirement = null;
                this.selectedSoldier = soldier;
                this.selectedCard = null;
                this.rebuild();
            });

            const pending = pendingLevels(soldier);
            if (pending > 0) {
                const promoteButton = this.addDynamic(new TextBoxButton({
                    scene: this.scene, x: width * 0.14 + 260, y, width: 140, height: 40,
                    text: `PROMOTE (${pending})`,
                    style: { fontSize: '13px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
                    fillColor: Palette.BRASS
                }));
                promoteButton.onClick(() => {
                    this.scene.events.emit('navigate', 'promotion');
                });
            }
        });

        // Therapy and rush-treatment actions for the selected soldier stack
        // beneath the roster list, one row each, in order.
        let belowRosterY = 180 + campaign.roster.length * 52 + 15;

        if (this.selectedSoldier && this.selectedSoldier.stress > 0) {
            const soldier = this.selectedSoldier;
            const therapyCost = campaign.getTherapyCost(THERAPY_COST);
            const canTreat = GameState.getInstance().moneyInVault >= therapyCost;
            const therapyButton = this.addDynamic(new TextBoxButton({
                scene: this.scene, x: width * 0.14, y: belowRosterY,
                width: 400, height: 44,
                text: `Therapy for ${soldier.name}: -${THERAPY_RELIEF} stress (£${therapyCost})`,
                style: { fontSize: '14px', fontFamily: Fonts.BODY, color: canTreat ? Palette.WHITE : Palette.DISABLED_TEXT },
                fillColor: canTreat ? Palette.VERDIGRIS : Palette.DISABLED
            }));
            therapyButton.onClick(() => {
                if (!canTreat) { this.setStatus('Insufficient funds.'); return; }
                GameState.getInstance().moneyInVault -= therapyCost;
                const stressBuff = soldier.buffs.find(b => b.id === 'stress');
                if (stressBuff) {
                    stressBuff.stacks = Math.max(0, stressBuff.stacks - THERAPY_RELIEF);
                    if (stressBuff.stacks === 0) {
                        soldier.buffs = soldier.buffs.filter(b => b !== stressBuff);
                    }
                }
                SaveManager.save();
                PlaytestJournal.getInstance().record('purchase', { kind: 'therapy', cost: therapyCost, soldier: soldier.name });
                this.setStatus(`${soldier.name} spends an afternoon with the accredited phrenologists. Stress: ${soldier.stress}.`);
                this.rebuild();
            });
            belowRosterY += 52;
        }

        // Rush treatment for the selected soldier: £RUSH_TREATMENT_COST_PER_WEEK
        // removes one week of weeksWoundedRemaining per click, repeatable
        // down to zero. Dry Company register — the Infirmary bills by the week.
        if (this.selectedSoldier && this.selectedSoldier.weeksWoundedRemaining > 0) {
            const soldier = this.selectedSoldier;
            const canAfford = GameState.getInstance().moneyInVault >= RUSH_TREATMENT_COST_PER_WEEK;
            const rushButton = this.addDynamic(new TextBoxButton({
                scene: this.scene, x: width * 0.14, y: belowRosterY,
                width: 400, height: 44,
                text: `[b]Rush Treatment[/b] for ${soldier.name}: -1 week (£${RUSH_TREATMENT_COST_PER_WEEK}) — ${soldier.weeksWoundedRemaining}w remaining`,
                style: { fontSize: '14px', fontFamily: Fonts.BODY, color: canAfford ? Palette.WHITE : Palette.DISABLED_TEXT },
                fillColor: canAfford ? Palette.VERDIGRIS : Palette.DISABLED
            }));
            rushButton.onClick(() => {
                if (!canAfford) { this.setStatus('Insufficient funds for the Infirmary\'s rush surcharge.'); return; }
                GameState.getInstance().moneyInVault -= RUSH_TREATMENT_COST_PER_WEEK;
                soldier.weeksWoundedRemaining = Math.max(0, soldier.weeksWoundedRemaining - 1);
                SaveManager.save();
                PlaytestJournal.getInstance().record('purchase', { kind: 'rush-heal', cost: RUSH_TREATMENT_COST_PER_WEEK, soldier: soldier.name });
                this.setStatus(soldier.weeksWoundedRemaining > 0
                    ? `The Infirmary bills the Company £${RUSH_TREATMENT_COST_PER_WEEK} to hasten ${soldier.name}'s recovery. ${soldier.weeksWoundedRemaining}w remaining.`
                    : `${soldier.name} is discharged from the Infirmary, fit for duty ahead of schedule.`);
                this.rebuild();
            });
            belowRosterY += 52;
        }

        // EQUIPMENT strip for the selected soldier (Relic Equipment Slots,
        // src/docs/relic_equipment_design.md): slot boxes (n/cap), click an
        // empty slot to open the armoury picker, click an equipped slot to
        // unequip, INSURE button per equipped-uninsured relic.
        if (this.selectedSoldier) {
            belowRosterY = this.buildEquipmentStrip(this.selectedSoldier, width, belowRosterY);
            // Second-wave Capital Works actions (each self-gates on its
            // project): School of Musketry drill, then the Testimonials
            // Board's irreversible retire (arm-confirm).
            belowRosterY = this.buildDrillAction(this.selectedSoldier, width, belowRosterY);
            belowRosterY = this.buildRetireAction(this.selectedSoldier, width, belowRosterY);
        }

        // --- Deck of the selected soldier, middle column ---
        if (this.selectedSoldier) {
            this.addDynamic(this.buildColumnHeader(
                `${this.selectedSoldier.name.toUpperCase()}'S DECK · ${this.selectedSoldier.cardsInMasterDeck.length}/${deckCap(this.selectedSoldier, this.selectedSoldier.startingDeck.length)}`,
                width * 0.45, 130, 360
            ));
            this.selectedSoldier.cardsInMasterDeck.forEach((card, i) => {
                const selected = this.selectedCard === card;
                const button = this.addDynamic(new TextBoxButton({
                    scene: this.scene, x: width * 0.45, y: 180 + i * 46, width: 340, height: 40,
                    text: card.name,
                    style: { fontSize: '14px', fontFamily: Fonts.BODY, color: Palette.WHITE },
                    fillColor: selected ? Palette.VERDIGRIS : Palette.WOOD_PANEL
                }));
                button.onClick(() => {
                    this.selectedCard = card;
                    this.rebuild();
                });
            });

            if (this.selectedCard) {
                this.buildCardActions(width);
            }

            // Bequeath from Archive (The Probate & Effects Office, Capital
            // Works Rebuild Batch C): sits beneath the Remove/Upgrade
            // actions. Only rendered when the Office is owned and the
            // Company Archive holds anything.
            this.buildBequestAction(width);
        }

        // --- Recruits, right column ---
        this.addDynamic(this.buildColumnHeader('RECRUITS', width * 0.8, 130, 300));
        campaign.recruitCandidates.forEach((candidate, i) => {
            const trait = candidate.buffs.find(b => b.isPersonaTrait)?.getDisplayName() ?? '';
            if (this.scene.textures.exists(candidate.portraitName)) {
                const portrait = this.scene.add.image(width * 0.78 - 195, 200 + i * 100, candidate.portraitName)
                    .setDisplaySize(56, 56);
                this.addDynamic(portrait);
            }
            this.addDynamic(new TextBox({
                scene: this.scene, x: width * 0.78, y: 180 + i * 100, width: 340, height: 40,
                text: `${candidate.name} (${candidate.characterClass.name})${trait ? ' — ' + trait : ''}`,
                fillColor: Palette.WOOD_DARK,
                style: { fontSize: '14px', fontFamily: Fonts.BODY, color: Palette.WHITE }
            }));
            const recruitCost = campaign.getRecruitCost();
            const canHire = GameState.getInstance().moneyInVault >= recruitCost
                && campaign.roster.length < campaign.getRosterCap();
            const hireButton = this.addDynamic(new TextBoxButton({
                scene: this.scene, x: width * 0.78, y: 222 + i * 100, width: 170, height: 38,
                text: `Hire (£${recruitCost})`,
                style: { fontSize: '14px', fontFamily: Fonts.DISPLAY, color: canHire ? Palette.WHITE : Palette.DISABLED_TEXT },
                fillColor: canHire ? Palette.VERDIGRIS : Palette.DISABLED
            }));
            hireButton.onClick(() => {
                if (campaign.hireRecruit(candidate)) {
                    SaveManager.save();
                    PlaytestJournal.getInstance().record('purchase', { kind: 'recruit', cost: recruitCost, name: candidate.name });
                    this.setStatus(`${candidate.name} signs the Company ledger. Welcome aboard.`);
                    this.rebuild();
                } else {
                    this.setStatus(campaign.roster.length >= campaign.getRosterCap()
                        ? 'The barracks are full.'
                        : 'Insufficient funds.');
                }
            });
        });

        this.refreshStatusDefault();
    }

    /** A brass-bordered wood plaque used as a ledger column heading. */
    private buildColumnHeader(text: string, x: number, y: number, width: number): Phaser.GameObjects.Container {
        const container = this.scene.add.container(x, y);
        container.add(drawWoodPanel(this.scene, width, 38));
        container.add(this.scene.add.text(0, 0, text, {
            fontFamily: Fonts.DISPLAY, fontSize: '19px', color: Palette.BRASS_TEXT,
        }).setOrigin(0.5));
        return container;
    }

    private buildCardActions(width: number): void {
        const campaign = CampaignUiState.getInstance();
        const gameState = GameState.getInstance();
        const card = this.selectedCard!;
        const soldier = this.selectedSoldier!;
        const actionsY = 180 + soldier.cardsInMasterDeck.length * 46 + 20;

        // Removal (Retraining Program)
        const removalUnlocked = campaign.ownsProject(REMOVAL_GATE);
        const canRemove = removalUnlocked
            && gameState.moneyInVault >= REMOVAL_COST
            && soldier.cardsInMasterDeck.length > 1;
        const removeButton = this.addDynamic(new TextBoxButton({
            scene: this.scene, x: width * 0.45, y: actionsY, width: 340, height: 40,
            text: removalUnlocked ? `Remove card (£${REMOVAL_COST})` : `Remove — requires ${REMOVAL_GATE}`,
            style: { fontSize: '14px', fontFamily: Fonts.BODY, color: canRemove ? Palette.WHITE : Palette.DISABLED_TEXT },
            fillColor: canRemove ? Palette.WAX_RED : Palette.DISABLED
        }));
        removeButton.onClick(() => {
            if (!canRemove) {
                this.setStatus(removalUnlocked ? 'Cannot remove (funds, or last card).' : `Requires the ${REMOVAL_GATE} project.`);
                return;
            }
            gameState.moneyInVault -= REMOVAL_COST;
            soldier.removeCard(card);
            this.selectedCard = null;
            SaveManager.save();
            this.setStatus(`${card.name} is struck from ${soldier.name}'s repertoire.`);
            this.rebuild();
        });

        // Upgrade (The Foundry): random eligible positive modifier
        const upgradeUnlocked = campaign.ownsProject(UPGRADE_GATE);
        const eligibleModifiers = CardModifierRegistry.getInstance().positiveModifiers
            .filter(mod => mod.isApplicableInContext(ModifierContext.REST_SITE_UPGRADE) && mod.eligible(card));
        const canUpgrade = upgradeUnlocked
            && gameState.moneyInVault >= UPGRADE_COST
            && eligibleModifiers.length > 0;
        const upgradeButton = this.addDynamic(new TextBoxButton({
            scene: this.scene, x: width * 0.45, y: actionsY + 48, width: 340, height: 40,
            text: upgradeUnlocked ? `Upgrade card (£${UPGRADE_COST})` : `Upgrade — requires ${UPGRADE_GATE}`,
            style: { fontSize: '14px', fontFamily: Fonts.BODY, color: canUpgrade ? Palette.WHITE : Palette.DISABLED_TEXT },
            fillColor: canUpgrade ? Palette.VERDIGRIS : Palette.DISABLED
        }));
        upgradeButton.onClick(() => {
            if (!canUpgrade) {
                this.setStatus(upgradeUnlocked ? 'Cannot upgrade (funds, or no eligible improvement).' : `Requires the ${UPGRADE_GATE} project.`);
                return;
            }
            gameState.moneyInVault -= UPGRADE_COST;
            const modifier = eligibleModifiers[Math.floor(Math.random() * eligibleModifiers.length)];
            modifier.applyModification(card);
            SaveManager.save();
            this.setStatus(`${soldier.name}'s card reworked at the Foundry: ${card.name}.`);
            this.rebuild();
        });
    }

    /**
     * Drill (The School of Musketry & Applied Blasphemy, second wave): £40
     * grants +20 XP to the selected soldier, below level DRILL_MAX_LEVEL
     * only — a rebuild pump that can't inflate veterans. Wounded/stressed
     * soldiers may drill (ruling). Pending promotions surface through the
     * existing derived flow (PROMOTE button / debrief); this never resolves
     * levels itself. Returns the y just past the row.
     */
    private buildDrillAction(soldier: PlayerCharacter, width: number, startY: number): number {
        const campaign = CampaignUiState.getInstance();
        if (!campaign.ownsProject(DRILL_GATE)) return startY;
        if (soldier.level >= DRILL_MAX_LEVEL) return startY;

        const canAfford = GameState.getInstance().moneyInVault >= DRILL_COST;
        const drillButton = this.addDynamic(new TextBoxButton({
            scene: this.scene, x: width * 0.14, y: startY, width: 400, height: 44,
            text: `Drill ${soldier.name} (£${DRILL_COST}, +${DRILL_XP} XP)`,
            style: { fontSize: '14px', fontFamily: Fonts.BODY, color: canAfford ? Palette.WHITE : Palette.DISABLED_TEXT },
            fillColor: canAfford ? Palette.VERDIGRIS : Palette.DISABLED
        }));
        drillButton.onClick(() => {
            if (!canAfford) { this.setStatus('Insufficient funds. The School does not drill on credit.'); return; }
            GameState.getInstance().moneyInVault -= DRILL_COST;
            soldier.xp += DRILL_XP;
            SaveManager.save();
            PlaytestJournal.getInstance().record('purchase', { kind: 'drill', cost: DRILL_COST, soldier: soldier.name, xp: DRILL_XP });
            this.setStatus(`${soldier.name} completes a week at the School of Musketry & Applied Blasphemy. +${DRILL_XP} XP.`);
            this.rebuild();
        });
        return startY + 52;
    }

    /**
     * Retire with Testimonial (The Long Service & Testimonials Board,
     * second wave): banks TESTIMONIAL_VP_PER_LEVEL × level onto the OWNED
     * project instance's victoryPoints (the same per-project serialization
     * path as The Company Gazette) and strikes the soldier from the roster
     * (wages stop by construction). Irreversible, so arm-confirm: first
     * click arms, second executes; selecting another soldier disarms.
     * Cannot retire the last roster soldier; the wounded may be retired.
     * Returns the y just past the row.
     */
    private buildRetireAction(soldier: PlayerCharacter, width: number, startY: number): number {
        const campaign = CampaignUiState.getInstance();
        if (!campaign.ownsProject(RETIRE_GATE)) return startY;

        const vp = TESTIMONIAL_VP_PER_LEVEL * soldier.level;
        const isLastSoldier = campaign.roster.length <= 1;
        const armed = this.armedRetirement === soldier;
        const retireButton = this.addDynamic(new TextBoxButton({
            scene: this.scene, x: width * 0.14, y: startY, width: 400, height: 44,
            text: armed
                ? `CONFIRM: retire ${soldier.name} (banks ${vp} VP)`
                : `Retire with Testimonial (banks ${vp} VP)`,
            style: { fontSize: '14px', fontFamily: Fonts.BODY, color: isLastSoldier ? Palette.DISABLED_TEXT : Palette.WHITE },
            fillColor: isLastSoldier ? Palette.DISABLED : (armed ? Palette.WAX_RED : Palette.WOOD_PANEL)
        }));
        retireButton.onClick(() => {
            if (isLastSoldier) {
                this.setStatus('The Company cannot retire its last soldier. Someone must mind the ledgers.');
                return;
            }
            if (!armed) {
                this.armedRetirement = soldier;
                this.setStatus('Click again to confirm the citation.');
                this.rebuild();
                return;
            }
            this.armedRetirement = null;
            campaign.roster = campaign.roster.filter(c => c !== soldier);
            const board = campaign.ownedStrategicProjects.find(p => p.name === RETIRE_GATE);
            if (board) board.victoryPoints += vp;
            this.selectedSoldier = null;
            this.selectedCard = null;
            SaveManager.save();
            PlaytestJournal.getInstance().record('retirement', { soldier: soldier.name, level: soldier.level, vp });
            this.setStatus(`${soldier.name} retires with a testimonial: ${vp} VP entered in the Board's ledger, one name struck from the wage book.`);
            this.rebuild();
        });
        return startY + 52;
    }

    /**
     * "Bequeath from Archive (£30)" (The Probate & Effects Office): shown
     * beneath the Remove/Upgrade card actions whenever the Office is owned,
     * the Company Archive is non-empty, and a soldier is selected. Opens a
     * picker of archived cards (same overlay pattern as the armoury relic
     * picker). Deck-cap gated, matching PromotionPanel's acquisition rule.
     */
    private buildBequestAction(width: number): void {
        const campaign = CampaignUiState.getInstance();
        const soldier = this.selectedSoldier;
        if (!soldier) return;
        if (!campaign.ownsProject(BEQUEST_GATE)) return;
        if (campaign.cardArchive.length === 0) return;

        const y = 180 + soldier.cardsInMasterDeck.length * 46 + 20 + (this.selectedCard ? 96 : 0);
        const atCap = isAtDeckCap(soldier, soldier.startingDeck.length, soldier.cardsInMasterDeck.length);
        const canBequeath = GameState.getInstance().moneyInVault >= BEQUEST_COST && !atCap;
        const bequestButton = this.addDynamic(new TextBoxButton({
            scene: this.scene, x: width * 0.45, y, width: 340, height: 40,
            text: `Bequeath from Archive (£${BEQUEST_COST})`,
            style: { fontSize: '14px', fontFamily: Fonts.BODY, color: canBequeath ? Palette.WHITE : Palette.DISABLED_TEXT },
            fillColor: canBequeath ? Palette.VERDIGRIS : Palette.DISABLED
        }));
        bequestButton.onClick(() => {
            if (!canBequeath) {
                this.setStatus(atCap ? `${soldier.name}'s repertoire is at capacity.` : 'Insufficient funds.');
                return;
            }
            this.showArchivePicker(soldier);
        });
    }

    /** Full-screen overlay listing the Company Archive's cards; picking one
     *  bequeaths a copy onto `soldier` for BEQUEST_COST. Same overlay
     *  pattern (and element pool) as the armoury relic picker. */
    private showArchivePicker(soldier: PlayerCharacter): void {
        const campaign = CampaignUiState.getInstance();
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        const backdrop = this.scene.add.rectangle(centerX, centerY, 1100, 620, 0x000000, 0.9)
            .setStrokeStyle(4, 0xC9A227)
            .setDepth(ARMOURY_PICKER_DEPTH);
        this.armouryPickerElements.push(backdrop);

        const instructions = new TextBox({
            scene: this.scene, x: centerX, y: centerY - 270, width: 1000, height: 60,
            text: `[color=gold]THE COMPANY ARCHIVE[/color]\nBequeath an entry from the effects of the deceased to ${soldier.name} (£${BEQUEST_COST}).`,
            style: { fontSize: '20px', fontFamily: Fonts.BODY, color: Palette.WHITE, align: 'center', wordWrap: { width: 960 } },
            fillColor: Palette.WOOD_DARK
        }).setDepth(ARMOURY_PICKER_DEPTH + 1);
        this.armouryPickerElements.push(instructions);

        campaign.cardArchive.forEach((card, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const x = centerX - 260 + col * 520;
            const y = centerY - 190 + row * 70;
            const entry = new TextBoxButton({
                scene: this.scene, x, y, width: 500, height: 60,
                text: `[color=gold]${card.name}[/color]`,
                style: { fontSize: '13px', fontFamily: Fonts.BODY, color: Palette.WHITE, align: 'center', wordWrap: { width: 470 } },
                fillColor: Palette.WOOD_PANEL
            }).setDepth(ARMOURY_PICKER_DEPTH + 1);
            entry.onClick(() => {
                const gameState = GameState.getInstance();
                if (gameState.moneyInVault < BEQUEST_COST) {
                    this.setStatus('Insufficient funds.');
                    return;
                }
                gameState.moneyInVault -= BEQUEST_COST;
                campaign.cardArchive = campaign.cardArchive.filter(c => c !== card);
                const copy = card.Copy();
                soldier.addCard(copy); // sets owningCharacter and pushes onto cardsInMasterDeck
                SaveManager.save();
                PlaytestJournal.getInstance().record('purchase', { kind: 'bequest', cost: BEQUEST_COST, soldier: soldier.name, card: card.name });
                this.clearArmouryPicker();
                this.setStatus(`${card.name} passes to ${soldier.name} under the terms of the estate. The Office retains its fee.`);
                this.rebuild();
            });
            this.armouryPickerElements.push(entry);
        });

        const closeButton = new TextBoxButton({
            scene: this.scene, x: centerX, y: centerY + 270, width: 220, height: 50,
            text: 'Close',
            style: { fontSize: '18px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            fillColor: Palette.WAX_RED
        }).setDepth(ARMOURY_PICKER_DEPTH + 1);
        closeButton.onClick(() => this.clearArmouryPicker());
        this.armouryPickerElements.push(closeButton);

        this.add(this.armouryPickerElements);
    }

    /**
     * EQUIPMENT strip: one row per slot (Leveling.relicSlots(soldier.level)).
     * An empty slot opens the armoury picker; an equipped slot unequips on
     * click and shows an INSURE button beside it when not yet underwritten.
     * Returns the y-coordinate just past the strip, for whatever's stacked below.
     */
    private buildEquipmentStrip(soldier: PlayerCharacter, width: number, startY: number): number {
        const campaign = CampaignUiState.getInstance();
        const cap = relicSlots(soldier.level);
        const headerY = startY;
        this.addDynamic(new TextBox({
            scene: this.scene, x: width * 0.14, y: headerY, width: 400, height: 32,
            text: `EQUIPMENT · ${soldier.equippedRelics.length}/${cap} · Armoury: ${campaign.armoury.length}`,
            fillColor: Palette.WOOD_DARK,
            style: { fontSize: '14px', fontFamily: Fonts.DISPLAY, color: Palette.BRASS_TEXT }
        }));

        let y = headerY + 40;
        for (let slot = 0; slot < cap; slot++) {
            const relic = soldier.equippedRelics[slot];
            if (relic) {
                const insured = soldier.insuredRelics.includes(relic);
                const slotButton = this.addDynamic(new TextBoxButton({
                    scene: this.scene, x: width * 0.14 - 65, y, width: 270, height: 40,
                    text: `${relic.getDisplayName()}${insured ? ' [color=gold](underwritten)[/color]' : ''}`,
                    style: { fontSize: '13px', fontFamily: Fonts.BODY, color: Palette.WHITE },
                    fillColor: Palette.WOOD_PANEL
                }));
                slotButton.onClick(() => {
                    campaign.unequipRelic(soldier, relic);
                    SaveManager.save();
                    this.setStatus(`${relic.getDisplayName()} struck off ${soldier.name}'s kit and returned to the armoury.`);
                    this.rebuild();
                });

                if (!insured) {
                    const canInsure = GameState.getInstance().moneyInVault >= RELIC_INSURANCE_COST;
                    const insureButton = this.addDynamic(new TextBoxButton({
                        scene: this.scene, x: width * 0.14 + 130, y, width: 130, height: 40,
                        text: `Insure (£${RELIC_INSURANCE_COST})`,
                        style: { fontSize: '12px', fontFamily: Fonts.DISPLAY, color: canInsure ? Palette.WHITE : Palette.DISABLED_TEXT },
                        fillColor: canInsure ? Palette.VERDIGRIS : Palette.DISABLED
                    }));
                    insureButton.onClick(() => {
                        if (!campaign.insureRelic(soldier, relic)) {
                            this.setStatus('Insufficient funds to underwrite this relic.');
                            return;
                        }
                        SaveManager.save();
                        PlaytestJournal.getInstance().record('purchase', { kind: 'relic-insure', cost: RELIC_INSURANCE_COST, soldier: soldier.name, relic: relic.getDisplayName() });
                        this.setStatus(`${relic.getDisplayName()} underwritten for £${RELIC_INSURANCE_COST}. Infernal Marine & Postal thanks you for your custom.`);
                        this.rebuild();
                    });
                }
            } else {
                const emptyButton = this.addDynamic(new TextBoxButton({
                    scene: this.scene, x: width * 0.14, y, width: 400, height: 40,
                    text: '[ empty slot — click to assign from armoury ]',
                    style: { fontSize: '13px', fontFamily: Fonts.BODY, color: Palette.DISABLED_TEXT },
                    fillColor: Palette.WOOD_DARK
                }));
                emptyButton.onClick(() => {
                    this.showArmouryPicker(soldier);
                });
            }
            y += 46;
        }
        return y + 8;
    }

    private clearArmouryPicker(): void {
        this.armouryPickerElements.forEach(e => { this.remove(e); e.destroy(); });
        this.armouryPickerElements = [];
    }

    /** Full-screen overlay listing the armoury's unassigned relics (name +
     *  one-line effect + flavor); picking one equips it onto `soldier`. */
    private showArmouryPicker(soldier: PlayerCharacter): void {
        const campaign = CampaignUiState.getInstance();
        const centerX = this.scene.scale.width / 2;
        const centerY = this.scene.scale.height / 2;

        const backdrop = this.scene.add.rectangle(centerX, centerY, 1100, 620, 0x000000, 0.9)
            .setStrokeStyle(4, 0xC9A227)
            .setDepth(ARMOURY_PICKER_DEPTH);
        this.armouryPickerElements.push(backdrop);

        const instructions = new TextBox({
            scene: this.scene, x: centerX, y: centerY - 270, width: 1000, height: 60,
            text: `[color=gold]THE ARMOURY[/color]\nAssign a relic to ${soldier.name}'s kit.`,
            style: { fontSize: '20px', fontFamily: Fonts.BODY, color: Palette.WHITE, align: 'center', wordWrap: { width: 960 } },
            fillColor: Palette.WOOD_DARK
        }).setDepth(ARMOURY_PICKER_DEPTH + 1);
        this.armouryPickerElements.push(instructions);

        if (campaign.armoury.length === 0) {
            const empty = new TextBox({
                scene: this.scene, x: centerX, y: centerY, width: 700, height: 60,
                text: 'The armoury is bare. Acquire relics on sortie to stock it.',
                style: { fontSize: '16px', fontFamily: Fonts.BODY, color: Palette.DISABLED_TEXT, align: 'center' },
                fillColor: Palette.WOOD_PANEL
            }).setDepth(ARMOURY_PICKER_DEPTH + 1);
            this.armouryPickerElements.push(empty);
        } else {
            // With Wattle & Gray owned, each unassigned relic also offers a
            // sell action at 50% of list (equipped relics never appear here
            // — the armoury is by definition unequipped stock; unequip
            // first to sell a slotted relic). Entries narrow to make room.
            const salvageOwned = campaign.ownsProject(SALVAGE_GATE);
            campaign.armoury.forEach((relic, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                const x = centerX - 260 + col * 520;
                const y = centerY - 190 + row * 70;
                const entryW = salvageOwned ? 400 : 500;
                const entryX = salvageOwned ? x - 50 : x;
                const entry = new TextBoxButton({
                    scene: this.scene, x: entryX, y, width: entryW, height: 60,
                    text: `[color=gold]${relic.getDisplayName()}[/color]\n${relic.getDescription()}`,
                    style: { fontSize: '13px', fontFamily: Fonts.BODY, color: Palette.WHITE, align: 'center', wordWrap: { width: entryW - 30 } },
                    fillColor: Palette.WOOD_PANEL
                }).setDepth(ARMOURY_PICKER_DEPTH + 1);
                entry.onClick(() => {
                    if (!campaign.equipRelic(soldier, relic)) {
                        this.setStatus('That slot is already full.');
                        return;
                    }
                    SaveManager.save();
                    this.clearArmouryPicker();
                    this.setStatus(`${relic.getDisplayName()} assigned to ${soldier.name}'s kit.`);
                    this.rebuild();
                });
                this.armouryPickerElements.push(entry);

                if (salvageOwned) {
                    const salePrice = Math.floor(relic.price * SALVAGE_SELL_FRACTION);
                    const sellButton = new TextBoxButton({
                        scene: this.scene, x: x + 205, y, width: 95, height: 60,
                        text: `Sell\n£${salePrice}`,
                        style: { fontSize: '13px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE, align: 'center' },
                        fillColor: Palette.WAX_RED
                    }).setDepth(ARMOURY_PICKER_DEPTH + 1);
                    sellButton.onClick(() => {
                        campaign.armoury = campaign.armoury.filter(r => r !== relic);
                        GameState.getInstance().moneyInVault += salePrice;
                        SaveManager.save();
                        PlaytestJournal.getInstance().record('sale', { kind: 'relic', price: salePrice, name: relic.getDisplayName() });
                        this.clearArmouryPicker();
                        this.setStatus(`${relic.getDisplayName()} goes to Wattle & Gray for £${salePrice}. Half of list, as quoted.`);
                        this.rebuild();
                    });
                    this.armouryPickerElements.push(sellButton);
                }
            });
        }

        const closeButton = new TextBoxButton({
            scene: this.scene, x: centerX, y: centerY + 270, width: 220, height: 50,
            text: 'Close',
            style: { fontSize: '18px', fontFamily: Fonts.DISPLAY, color: Palette.WHITE },
            fillColor: Palette.WAX_RED
        }).setDepth(ARMOURY_PICKER_DEPTH + 1);
        closeButton.onClick(() => this.clearArmouryPicker());
        this.armouryPickerElements.push(closeButton);

        this.add(this.armouryPickerElements);
    }

    private setStatus(message: string): void {
        this.statusLine.setText(message);
    }

    private refreshStatusDefault(): void {
        const gameState = GameState.getInstance();
        if (this.statusLine.getText() === '') {
            this.setStatus(`Funds: £${gameState.moneyInVault}`);
        }
    }

    update(): void {
        // Static between interactions; rebuilds on click.
    }
}

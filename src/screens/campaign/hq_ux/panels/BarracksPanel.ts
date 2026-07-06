import Phaser, { Scene } from 'phaser';
import { pendingLevels } from '../../../../campaign/Leveling';
import { PlayableCard } from '../../../../gamecharacters/PlayableCard';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { ModifierContext } from '../../../../rules/modifiers/AbstractCardModifier';
import { CardModifierRegistry } from '../../../../rules/modifiers/CardModifierRegistry';
import { GameState } from '../../../../rules/GameState';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState, ROSTER_CAP } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const REMOVAL_COST = 40;
const UPGRADE_COST = 60;
const THERAPY_COST = 30;
const THERAPY_RELIEF = 4;
const REMOVAL_GATE = 'Retraining Program';
const UPGRADE_GATE = 'The Foundry';

/**
 * Roster management: inspect a soldier's deck, remove or upgrade cards
 * (gated by strategic projects), and hire recruits.
 */
export class BarracksPanel extends AbstractHqPanel {
    private dynamicElements: Phaser.GameObjects.GameObject[] = [];
    private statusLine: TextBox;

    private selectedSoldier: PlayerCharacter | null = null;
    private selectedCard: PlayableCard | null = null;

    constructor(scene: Scene) {
        super(scene, 'Barracks');
        this.titleText.setVisible(false); // tab rail names the view

        this.statusLine = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: scene.scale.height - 60,
            width: 1100,
            height: 40,
            text: '',
            style: { fontSize: '18px', color: '#ffff88' }
        });
        this.add(this.statusLine);
    }

    public show(): void {
        CampaignUiState.getInstance().ensureRecruitsPopulated();
        this.selectedSoldier = null;
        this.selectedCard = null;
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
        const campaign = CampaignUiState.getInstance();
        const width = this.scene.scale.width;

        // --- Roster, left column ---
        // Chrome (status bar + tab rail) occupies y 0-100; column headers
        // start below it with headroom to spare.
        this.addDynamic(new TextBox({
            scene: this.scene, x: width * 0.14, y: 130, width: 200, height: 35,
            text: `Roster (${campaign.roster.length}/${ROSTER_CAP})`,
            style: { fontSize: '20px', color: '#ffffff' }
        }));
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
                style: { fontSize: '14px', color: '#ffffff' },
                fillColor: selected ? 0x226622 : 0x333344
            }));
            button.onClick(() => {
                this.selectedSoldier = soldier;
                this.selectedCard = null;
                this.rebuild();
            });

            const pending = pendingLevels(soldier);
            if (pending > 0) {
                const promoteButton = this.addDynamic(new TextBoxButton({
                    scene: this.scene, x: width * 0.14 + 260, y, width: 140, height: 40,
                    text: `PROMOTE (${pending})`,
                    style: { fontSize: '14px', color: '#ffffff' },
                    fillColor: 0x886600
                }));
                promoteButton.onClick(() => {
                    this.scene.events.emit('navigate', 'promotion');
                });
            }
        });

        // Therapy for the selected soldier
        if (this.selectedSoldier && this.selectedSoldier.stress > 0) {
            const soldier = this.selectedSoldier;
            const therapyCost = campaign.getTherapyCost(THERAPY_COST);
            const canTreat = GameState.getInstance().moneyInVault >= therapyCost;
            const therapyButton = this.addDynamic(new TextBoxButton({
                scene: this.scene, x: width * 0.14, y: 180 + campaign.roster.length * 52 + 15,
                width: 400, height: 44,
                text: `Therapy for ${soldier.name}: -${THERAPY_RELIEF} stress (£${therapyCost})`,
                style: { fontSize: '14px', color: canTreat ? '#ffffff' : '#888888' },
                fillColor: canTreat ? 0x224466 : 0x222222
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
                this.setStatus(`${soldier.name} spends an afternoon with the accredited phrenologists. Stress: ${soldier.stress}.`);
                this.rebuild();
            });
        }

        // --- Deck of the selected soldier, middle column ---
        if (this.selectedSoldier) {
            this.addDynamic(new TextBox({
                scene: this.scene, x: width * 0.45, y: 130, width: 300, height: 35,
                text: `${this.selectedSoldier.name}'s deck (${this.selectedSoldier.cardsInMasterDeck.length} cards)`,
                style: { fontSize: '20px', color: '#ffffff' }
            }));
            this.selectedSoldier.cardsInMasterDeck.forEach((card, i) => {
                const selected = this.selectedCard === card;
                const button = this.addDynamic(new TextBoxButton({
                    scene: this.scene, x: width * 0.45, y: 180 + i * 46, width: 340, height: 40,
                    text: card.name,
                    style: { fontSize: '14px', color: '#ffffff' },
                    fillColor: selected ? 0x226622 : 0x333344
                }));
                button.onClick(() => {
                    this.selectedCard = card;
                    this.rebuild();
                });
            });

            if (this.selectedCard) {
                this.buildCardActions(width);
            }
        }

        // --- Recruits, right column ---
        this.addDynamic(new TextBox({
            scene: this.scene, x: width * 0.8, y: 130, width: 200, height: 35,
            text: 'Recruits',
            style: { fontSize: '20px', color: '#ffffff' }
        }));
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
                style: { fontSize: '14px', color: '#ffffff' }
            }));
            const recruitCost = campaign.getRecruitCost();
            const canHire = GameState.getInstance().moneyInVault >= recruitCost
                && campaign.roster.length < ROSTER_CAP;
            const hireButton = this.addDynamic(new TextBoxButton({
                scene: this.scene, x: width * 0.78, y: 222 + i * 100, width: 170, height: 38,
                text: `Hire (£${recruitCost})`,
                style: { fontSize: '14px', color: canHire ? '#ffffff' : '#888888' },
                fillColor: canHire ? 0x226622 : 0x222222
            }));
            hireButton.onClick(() => {
                if (campaign.hireRecruit(candidate)) {
                    SaveManager.save();
                    this.setStatus(`${candidate.name} signs the Company ledger. Welcome aboard.`);
                    this.rebuild();
                } else {
                    this.setStatus(campaign.roster.length >= ROSTER_CAP
                        ? 'The barracks are full.'
                        : 'Insufficient funds.');
                }
            });
        });

        this.refreshStatusDefault();
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
            style: { fontSize: '14px', color: canRemove ? '#ffffff' : '#888888' },
            fillColor: canRemove ? 0x662222 : 0x222222
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
            style: { fontSize: '14px', color: canUpgrade ? '#ffffff' : '#888888' },
            fillColor: canUpgrade ? 0x226622 : 0x222222
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

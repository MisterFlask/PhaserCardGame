import { Scene } from 'phaser';
import { Contract } from '../../../../campaign/Contract';
import { SortieManager } from '../../../../campaign/SortieManager';
import { PlayerCharacter } from '../../../../gamecharacters/PlayerCharacter';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

const SQUAD_SIZE = 3;

/**
 * The contract board: pick a contract, assign a squad of 3, launch the sortie.
 * Replaces trade-route selection as the expedition entry point.
 */
export class ContractBoardPanel extends AbstractHqPanel {
    private contractButtons: TextBoxButton[] = [];
    private rosterButtons: (TextBoxButton | Phaser.GameObjects.Image)[] = [];
    private contractDetail: TextBox;
    private statusLine: TextBox;
    private launchButton: TextBoxButton;

    private selectedSquad: PlayerCharacter[] = [];

    constructor(scene: Scene) {
        super(scene, 'Contract Board');

        this.contractDetail = new TextBox({
            scene,
            x: scene.scale.width * 0.72,
            y: 260,
            width: 460,
            height: 220,
            text: 'Select a contract.',
            style: { fontSize: '16px', color: '#ffffff', wordWrap: { width: 440 } }
        });

        this.statusLine = new TextBox({
            scene,
            x: scene.scale.width / 2,
            y: scene.scale.height - 160,
            width: 900,
            height: 40,
            text: '',
            style: { fontSize: '18px', color: '#ffff88' }
        });

        this.launchButton = new TextBoxButton({
            scene,
            x: scene.scale.width * 0.72,
            y: scene.scale.height - 100,
            width: 260,
            height: 60,
            text: 'Dispatch Squad',
            style: { fontSize: '22px', color: '#ffffff' },
            fillColor: 0x555555
        });
        this.launchButton.onClick(() => this.handleLaunch());

        this.add([this.contractDetail, this.statusLine, this.launchButton]);
    }

    public show(): void {
        CampaignUiState.getInstance().ensureContractsPopulated();
        this.selectedSquad = [];
        CampaignUiState.getInstance().selectedContract = null;
        this.rebuildLists();
        super.show();
    }

    private clearButtons(): void {
        this.contractButtons.forEach(b => { this.remove(b); b.destroy(); });
        this.rosterButtons.forEach(b => { this.remove(b); b.destroy(); });
        this.contractButtons = [];
        this.rosterButtons = [];
    }

    private rebuildLists(): void {
        this.clearButtons();
        const campaign = CampaignUiState.getInstance();

        // --- Contract list, left column ---
        campaign.availableContracts.forEach((contract, i) => {
            const selected = campaign.selectedContract?.id === contract.id;
            const button = new TextBoxButton({
                scene: this.scene,
                x: this.scene.scale.width * 0.25,
                y: 140 + i * 95,
                width: 620,
                height: 80,
                text: this.contractLabel(contract),
                style: { fontSize: '16px', color: '#ffffff' },
                fillColor: selected ? 0x226622 : 0x333344
            });
            button.onClick(() => {
                campaign.selectedContract = contract;
                this.rebuildLists();
            });
            this.contractButtons.push(button);
            this.add(button);
        });

        if (campaign.availableContracts.length === 0) {
            this.contractDetail.setText('The board is bare. Advance time by completing a contract... which requires a contract. (This should not happen.)');
        }

        // --- Roster, right column ---
        campaign.roster.forEach((character, i) => {
            const inSquad = this.selectedSquad.includes(character);
            const fit = character.isFitForDuty;
            const unfitReason = character.weeksWoundedRemaining > 0
                ? ` — WOUNDED ${character.weeksWoundedRemaining}w`
                : (!fit ? ' — SHAKEN' : '');
            const label = `${character.name} (${character.characterClass.name})`
                + (character.stress > 0 ? ` — stress ${character.stress}` : '')
                + unfitReason
                + (inSquad ? '  ✓' : '');
            const y = 420 + i * 55;
            if (this.scene.textures.exists(character.portraitName)) {
                const portrait = this.scene.add.image(this.scene.scale.width * 0.72 - 255, y, character.portraitName)
                    .setDisplaySize(45, 45);
                if (!fit) portrait.setTint(0x555555);
                this.rosterButtons.push(portrait);
                this.add(portrait);
            }
            const button = new TextBoxButton({
                scene: this.scene,
                x: this.scene.scale.width * 0.72,
                y,
                width: 460,
                height: 45,
                text: label,
                style: { fontSize: '15px', color: fit ? '#ffffff' : '#888888' },
                fillColor: inSquad ? 0x226622 : (fit ? 0x333344 : 0x222222)
            });
            button.onClick(() => {
                if (!fit) return;
                if (inSquad) {
                    this.selectedSquad = this.selectedSquad.filter(c => c !== character);
                } else if (this.selectedSquad.length < SQUAD_SIZE) {
                    this.selectedSquad.push(character);
                }
                this.rebuildLists();
            });
            this.rosterButtons.push(button);
            this.add(button);
        });

        this.refreshDetailAndStatus();
    }

    private contractLabel(contract: Contract): string {
        const stars = '★'.repeat(contract.difficultyStars) + '☆'.repeat(3 - contract.difficultyStars);
        return `${contract.name}   [${contract.regionName}]\n`
            + `${stars}   £${contract.payout}   ${contract.numCombats} engagement${contract.numCombats > 1 ? 's' : ''}   expires in ${contract.deadlineWeeks}w`;
    }

    private refreshDetailAndStatus(): void {
        const campaign = CampaignUiState.getInstance();
        const contract = campaign.selectedContract;

        if (contract) {
            this.contractDetail.setText(
                `${contract.name}\n\n${contract.description}\n\n`
                + `Region: ${contract.regionName}   Duration: ${contract.durationWeeks}w\n`
                + `Payout on completion: £${contract.payout}`
            );
        } else {
            this.contractDetail.setText('Select a contract.');
        }

        const cal = campaign.calendar;
        this.statusLine.setText(
            `Year ${cal.year}, Q${cal.quarterOfYear}, week ${cal.weekOfQuarter}/13   |   `
            + `Dividend of £${cal.currentDividendExpectation} due in ${cal.weeksUntilDividend}w   |   `
            + `Shareholder satisfaction: ${cal.shareholderSatisfaction}/100   |   `
            + `Squad: ${this.selectedSquad.length}/${SQUAD_SIZE}`
        );

        const ready = contract !== null && this.selectedSquad.length === SQUAD_SIZE;
        this.launchButton.setFillColor(ready ? 0x226622 : 0x555555);
    }

    private handleLaunch(): void {
        const campaign = CampaignUiState.getInstance();
        if (!campaign.selectedContract || this.selectedSquad.length !== SQUAD_SIZE) {
            return;
        }
        SortieManager.getInstance().startSortie(campaign.selectedContract, [...this.selectedSquad]);
    }

    update(): void {
        // Static between interactions; lists rebuild on click.
    }
}

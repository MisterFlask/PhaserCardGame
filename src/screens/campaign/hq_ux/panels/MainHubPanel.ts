import { Scene } from 'phaser';
import { CHARTER_YEARS } from '../../../../campaign/CampaignCalendar';
import { SortieManager } from '../../../../campaign/SortieManager';
import { SaveManager } from '../../../../saveload/SaveManager';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class MainHubPanel extends AbstractHqPanel {
    private fundsDisplay: TextBox;
    private yearDisplay: TextBox;
    private retirementDisplay: TextBox;
    private boardDisplay: TextBox;
    private reportDisplay: TextBox;
    private navigationButtons: Map<string, TextBoxButton>;

    constructor(scene: Scene) {
        super(scene, `The East Inferno Company`);

        const campaignState = CampaignUiState.getInstance();

        // Create retirement text display
        this.retirementDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            70,
            `10 Years To Retirement`,
            '#ffffff',
            300,
            30
        );

        // Create displays
        this.fundsDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            120,
            `Funds: £${campaignState.getCurrentFunds()}`,
            '#ffff00'
        );

        this.yearDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            170,
            `Year ${campaignState.calendar.year}`
        );

        this.boardDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            220,
            '',
            '#ffffff',
            700,
            30
        );

        this.reportDisplay = new TextBox({
            scene: this.scene,
            x: scene.scale.width * 0.75,
            y: scene.scale.height * 0.55,
            width: 500,
            height: 300,
            text: '',
            style: { fontSize: '15px', color: '#ccccbb', wordWrap: { width: 480 } }
        });

        // Create navigation buttons
        this.navigationButtons = new Map();
        this.createNavigationButtons();

        // Add all displays to container
        this.add([
            this.retirementDisplay,
            this.fundsDisplay,
            this.yearDisplay,
            this.boardDisplay,
            this.reportDisplay,
            ...this.navigationButtons.values()
        ]);
    }

    private createInfoDisplay(x: number, y: number, text: string, color: string = '#ffffff', width: number = 200, height: number = 40): TextBox {
        return new TextBox({
            scene: this.scene,
            x,
            y,
            width,
            height,
            text,
            style: { fontSize: '20px', color }
        });
    }

    private createNavigationButtons(): void {
        const buttonConfig = {
            width: 200,
            height: 50,
            style: { fontSize: '20px', color: '#ffffff' },
            fillColor: 0x444444
        };

        const buttons = [
            { text: 'Investment', x: 0.2, y: 0.6 },
            { text: 'Contract Board', x: 0.4, y: 0.6},
            { text: 'New Campaign', x: 0.85, y: 0.92 },
        ];

        buttons.forEach(({ text, x, y}) => {
            const button = new TextBoxButton({
                scene: this.scene,
                x: this.scene.scale.width * x,
                y: this.scene.scale.height * y,
                text,
                ...buttonConfig
            });

            button.onClick(() => this.navigateTo(text));
            this.navigationButtons.set(text, button);
        });

        // Initialize trade route button state
        this.updateTradeRouteButton();
    }

    private navigateTo(destination: string): void {
        const lowerDest = destination.toLowerCase();
        if (lowerDest === 'contract board') {
            this.scene.events.emit('navigate', 'contracts');
        } else if (lowerDest === 'new campaign') {
            // Wipe the save and reboot into a fresh campaign.
            SaveManager.deleteSave();
            window.location.reload();
        } else {
            this.scene.events.emit('navigate', lowerDest);
        }
    }

    private updateTradeRouteButton(): void {
        const campaignState = CampaignUiState.getInstance();
        const tradeButton = this.navigationButtons.get('Trade Routes');
        
        if (!tradeButton) return;

        tradeButton.setText('Trade Route');
        tradeButton.setFillColor(0x00aa00); // Green
    }

    update(): void {
        const campaignState = CampaignUiState.getInstance();
        const cal = campaignState.calendar;
        this.fundsDisplay.setText(`Funds: £${campaignState.getCurrentFunds()}`);
        this.yearDisplay.setText(`Year ${cal.year}, Q${cal.quarterOfYear}, Week ${cal.weekOfQuarter}`);
        this.retirementDisplay.setText(
            cal.isSacked
                ? 'THE BOARD HAS LOST CONFIDENCE. YOU ARE SACKED.'
                : `${Math.max(0, CHARTER_YEARS - cal.year + 1)} Years Until Charter Expiry`
        );
        this.boardDisplay.setText(
            `Dividend of £${cal.currentDividendExpectation} due in ${cal.weeksUntilDividend}w   |   Shareholder satisfaction: ${cal.shareholderSatisfaction}/100`
        );

        const report = SortieManager.getInstance().lastSortieReport;
        this.reportDisplay.setText(report.length > 0 ? `— Latest dispatches —\n\n${report.join('\n')}` : '');

        this.updateTradeRouteButton();
    }
} 
import { Scene } from 'phaser';
import { TextGlyphs } from '../../../../text/TextGlyphs';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class MainHubPanel extends AbstractHqPanel {
    private fundsDisplay: TextBox;
    private yearDisplay: TextBox;
    private expectationsDisplay: TextBox;
    private warningDisplay: TextBox;
    private navigationButtons: Map<string, TextBoxButton>;

    constructor(scene: Scene) {
        super(scene, `! Company HQ${TextGlyphs.getInstance().ashesIcon}! ${TextGlyphs.getInstance().ashesIcon}`);

        const campaignState = CampaignUiState.getInstance();

        // Create displays
        this.fundsDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            100,
            `Funds: £${campaignState.getCurrentFunds()}`,
            '#ffff00'
        );

        this.yearDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            150,
            `Year: ${campaignState.currentYear}`
        );

        this.expectationsDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            200,
            `Expected Profit: £${campaignState.shareholderExpectation}`,
            undefined,
            300
        );

        this.warningDisplay = this.createInfoDisplay(
            scene.scale.width / 2,
            250,
            '',
            '#ff0000',
            400,
            60
        );

        // Create navigation buttons
        this.navigationButtons = new Map();
        this.createNavigationButtons();

        // Add all displays to container
        this.add([
            this.fundsDisplay,
            this.yearDisplay,
            this.expectationsDisplay,
            this.warningDisplay,
            ...this.navigationButtons.values()
        ]);

        this.updateWarnings();
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
            { text: 'New Expedition', x: 0.4, y: 0.6},
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
        // Map 'expedition loadout' to 'loadout'
        if (lowerDest === 'new expedition') {
            this.scene.events.emit('navigate', 'trade routes');
        } else {
            this.scene.events.emit('navigate', lowerDest);
        }
    }

    private updateWarnings(): void {
        const campaignState = CampaignUiState.getInstance();
        const warnings: string[] = [];

        if (campaignState.getShareholderSatisfaction() < 0.5) {
            warnings.push('WARNING: Shareholders are dissatisfied!');
        }

        // Add more warning conditions here
        if (campaignState.getCurrentFunds() < 100) {
            warnings.push('WARNING: Low on funds!');
        }

        this.warningDisplay.setText(warnings.join('\n'));
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
        this.fundsDisplay.setText(`Funds: £${campaignState.getCurrentFunds()}`);
        this.yearDisplay.setText(`Year: ${campaignState.currentYear}`);
        this.expectationsDisplay.setText(`Expected Profit: £${campaignState.shareholderExpectation}`);
        this.updateWarnings();
        this.updateTradeRouteButton();
    }
} 
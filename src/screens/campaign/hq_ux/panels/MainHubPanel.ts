import { Scene } from 'phaser';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignUiState } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class MainHubPanel extends AbstractHqPanel {
    private fundsDisplay: TextBox;
    private yearDisplay: TextBox;
    private retirementDisplay: TextBox;
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
            `Year: ${campaignState.currentYear}`
        );


        // Create navigation buttons
        this.navigationButtons = new Map();
        this.createNavigationButtons();

        // Add all displays to container
        this.add([
            this.retirementDisplay,
            this.fundsDisplay,
            this.yearDisplay,
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
        this.updateTradeRouteButton();
    }
} 
import { Scene } from 'phaser';
import { TextBoxButton } from '../../../../ui/Button';
import { TextBox } from '../../../../ui/TextBox';
import { CampaignState } from '../CampaignState';
import { AbstractHqPanel } from './AbstractHqPanel';

export class MainHubPanel extends AbstractHqPanel {
    private fundsDisplay: TextBox;
    private yearDisplay: TextBox;
    private expectationsDisplay: TextBox;
    private warningDisplay: TextBox;
    private navigationButtons: Map<string, TextBoxButton>;

    constructor(scene: Scene) {
        super(scene, 'Company HQ');

        const campaignState = CampaignState.getInstance();

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
            { text: 'Investment', x: 0.25, y: 0.6 },
            { text: 'Trade Routes', x: 0.5, y: 0.6 },
            { text: 'Personnel', x: 0.75, y: 0.6 },
            { text: 'Expedition Loadout', x: 0.5, y: 0.75 }
        ];

        buttons.forEach(({ text, x, y }) => {
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
    }

    private navigateTo(destination: string): void {
        this.scene.events.emit('navigate', destination.toLowerCase());
    }

    private updateWarnings(): void {
        const campaignState = CampaignState.getInstance();
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

    update(): void {
        const campaignState = CampaignState.getInstance();
        this.fundsDisplay.setText(`Funds: £${campaignState.getCurrentFunds()}`);
        this.yearDisplay.setText(`Year: ${campaignState.currentYear}`);
        this.expectationsDisplay.setText(`Expected Profit: £${campaignState.shareholderExpectation}`);
        this.updateWarnings();
    }
} 
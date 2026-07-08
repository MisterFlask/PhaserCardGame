import { CampaignUiState } from '../screens/campaign/hq_ux/CampaignUiState';
import { AbstractStrategicProject, WEEKS_PER_CAMPAIGN_YEAR } from '../strategic_projects/AbstractStrategicProject';
import { CardConfig } from '../utils/CardGuiUtils';
import { PhysicalCard } from './PhysicalCard';

export class PhysicalProjectCard extends PhysicalCard {
    private ownedIndicator?: Phaser.GameObjects.Image;
    private ownedLabel?: Phaser.GameObjects.Text;
    private priceLabel?: Phaser.GameObjects.Text;
    private purchaseButton?: Phaser.GameObjects.Container;
    private unavailableOverlay?: Phaser.GameObjects.Rectangle;
    private unavailableReasonText?: Phaser.GameObjects.Text;
    /** Staged Capital Works only: "STAGE II OF III — available Y6" line. */
    private stageProgressLabel?: Phaser.GameObjects.Text;

    constructor({
        scene,
        x,
        y,
        data,
        cardConfig
    }: {
        scene: Phaser.Scene;
        x: number;
        y: number;
        data: AbstractStrategicProject;
        cardConfig: CardConfig;
    }) {
        super({
            scene,
            x,
            y,
            data,
            cardConfig
        });
        this.setupInteractions();
        this.update();
    }

    /** A staged project (AbstractStrategicProject.isStaged()) stays
     *  purchase-interactive after its first stage — only a fully-staged
     *  project (or a non-staged owned project) is inert. */
    private isInteractive(project: AbstractStrategicProject): boolean {
        if (project.isStaged()) return !project.isFullyStaged();
        return !project.isOwned;
    }

    private setupInteractions(): void {
        this.container.setInteractive()
            .on('pointerover', () => {
                this.setGlow(true);
                // Show purchase button if it exists and the card still takes purchases
                if (this.purchaseButton) {
                    const project = this.data as AbstractStrategicProject;
                    if (this.isInteractive(project)) {
                        this.purchaseButton.setVisible(true);
                        this.purchaseButton.setAlpha(1); // Ensure full opacity
                    }
                }
                this.scene.events.emit('projectHovered', this.data as AbstractStrategicProject);
                // Bring the card to the front when hovered
                if (this.container.parentContainer) {
                    this.container.parentContainer.bringToTop(this.container);
                }
            })
            .on('pointerout', () => {
                this.setGlow(false);
                // Hide purchase button
                if (this.purchaseButton) {
                    this.purchaseButton.setVisible(false);
                }
                this.scene.events.emit('projectUnhovered');
            })
            .on('pointerdown', () => {
                const project = this.data as AbstractStrategicProject;
                if (this.isInteractive(project)) {
                    this.scene.events.emit('projectClicked', project);
                }
            });
    }

    update(): void {
        // Clear existing UI elements
        this.clearUIElements();

        const project = this.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();
        const isOwned = campaignState.ownedStrategicProjects.includes(project);

        project.isOwned = isOwned;

        if (project.isOwned){
            project.backgroundImageNameOverride = "red_background";
        }

        if (project.isStaged()) {
            // Staged Capital Works get their own rendering regardless of the
            // owned/available split: progress line + next-stage price while
            // stages remain, a plain OWNED badge once complete.
            if (project.isFullyStaged()) {
                this.renderOwnedState();
            } else {
                this.renderStagedState();
            }
        } else if (isOwned) {
            this.renderOwnedState();
        } else {
            this.renderPurchasableState();
        }
        this.updateVisuals();
    }

    private clearUIElements(): void {
        this.ownedIndicator?.destroy();
        this.ownedLabel?.destroy();
        this.priceLabel?.destroy();
        if (this.purchaseButton) {
            this.purchaseButton.removeAll(true);
            this.purchaseButton.destroy();
        }
        this.unavailableOverlay?.destroy();
        this.unavailableReasonText?.destroy();
        this.stageProgressLabel?.destroy();
    }

    private renderOwnedState(): void {
        // Add a green overlay for owned cards
        this.ownedIndicator = this.scene.add.image(0, -90, 'card-frame')
            .setTint(0x32CD32) // Green tint
            .setAlpha(0.5)
            .setScale(1.05);
        this.container.add(this.ownedIndicator);
        
        // Add owned label
        this.ownedLabel = this.scene.add.text(0, -120, "OWNED", {
            fontSize: '16px',
            fontFamily: 'verdana',
            color: '#FFFFFF',
            backgroundColor: '#32CD32',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.container.add(this.ownedLabel);
    }

    private renderPurchasableState(): void {
        const project = this.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();
        const canAfford = campaignState.getCurrentFunds() >= project.getMoneyCost();
        const prereqsMet = this.checkPrerequisitesMet(project);
        const isAvailable = canAfford && prereqsMet;
        
        // Add price label at the top
        this.priceLabel = this.scene.add.text(0, -120, `£${project.getMoneyCost()}`, {
            fontSize: '16px',
            fontFamily: 'verdana',
            color: '#FFFFFF',
            backgroundColor: canAfford ? '#4CAF50' : '#9E9E9E',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.container.add(this.priceLabel);
        
        // Create purchase button
        this.purchaseButton = this.scene.add.container(0, 0);
        
        const buttonBg = this.scene.add.rectangle(0, 90, 120, 40, 
            isAvailable ? 0x4CAF50 : 0x9E9E9E) // Green if available, gray if not
            .setOrigin(0.5);
        
        const buttonText = this.scene.add.text(0, 90, "PURCHASE", {
            fontSize: '14px',
            fontFamily: 'verdana',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        
        this.purchaseButton.add([buttonBg, buttonText]);
        this.container.add(this.purchaseButton);
        
        // Make sure button is on top of other card elements
        this.container.bringToTop(this.purchaseButton);
        
        // Initially hide the purchase button
        this.purchaseButton.setVisible(false);
        
        // Add an overlay if the project is not available
        if (!isAvailable) {
            this.unavailableOverlay = this.scene.add.rectangle(0, 0, 180, 250, 
                0x000000, 0.5)
                .setOrigin(0.5);
            this.container.add(this.unavailableOverlay);
            
            // Add text indicating why it's unavailable
            let reasonText = canAfford ? "" : "Insufficient Funds";
            if (!prereqsMet) {
                reasonText = reasonText ? "Requirements Not Met" : "Missing Prerequisites";
            }
            
            if (reasonText) {
                this.unavailableReasonText = this.scene.add.text(0, 0, reasonText, {
                    fontSize: '14px',
                    fontFamily: 'verdana',
                    color: '#FFFFFF',
                    backgroundColor: '#FF0000',
                    padding: { x: 5, y: 3 }
                }).setOrigin(0.5);
                this.container.add(this.unavailableReasonText);
            }
        }
    }

    private checkPrerequisitesMet(project: AbstractStrategicProject): boolean {
        const campaignState = CampaignUiState.getInstance();
        const prerequisites = project.getPrerequisites();

        // If no prerequisites, then requirements are met
        if (prerequisites.length === 0) {
            return true;
        }

        // Check if all prerequisites are in the owned projects
        return prerequisites.every(prereq =>
            campaignState.ownedStrategicProjects.some(owned => owned.name === prereq.name)
        );
    }

    /** Staged Capital Works (AbstractStrategicProject.stages set, not yet
     *  fully staged): a progress line ("STAGE II OF III — available Y6")
     *  plus a purchase button priced at the next stage. The year-gate
     *  refusal ("The board will not entertain...") renders as the
     *  unavailable-overlay reason, same slot insufficient-funds/prereqs use
     *  on a plain purchasable card. */
    private renderStagedState(): void {
        const project = this.data as AbstractStrategicProject;
        const campaignState = CampaignUiState.getInstance();
        const currentWeek = campaignState.calendar.week;
        const nextStage = project.getNextStage()!;
        const stageTotal = project.stages!.length;
        const stageOrdinal = project.stagesPurchased + 1;

        const canAfford = campaignState.getCurrentFunds() >= project.getMoneyCost();
        const gate = project.canPurchaseNextStage(currentWeek);
        const isAvailable = canAfford && gate.ok;

        // Progress line, above the price label. When the year-gate hasn't
        // cleared yet, name the year it opens ("STAGE II OF III —
        // available Y6"); once open, the line is just the stage count.
        let progressText = `STAGE ${toRoman(stageOrdinal)} OF ${toRoman(stageTotal)}`;
        if (!gate.ok && project.stagesPurchased > 0) {
            const availableWeek = project.lastStagePurchaseWeek + WEEKS_PER_CAMPAIGN_YEAR;
            const availableYear = Math.floor((availableWeek - 1) / WEEKS_PER_CAMPAIGN_YEAR) + 1;
            progressText += ` — available Y${availableYear}`;
        }
        this.stageProgressLabel = this.scene.add.text(
            0, -146, progressText,
            {
                fontSize: '13px',
                fontFamily: 'verdana',
                color: '#FFFFFF',
                backgroundColor: '#4A4A6A',
                padding: { x: 8, y: 3 }
            }
        ).setOrigin(0.5);
        this.container.add(this.stageProgressLabel);

        // Price label for the NEXT stage.
        this.priceLabel = this.scene.add.text(0, -120, `${nextStage.name} — £${nextStage.cost}`, {
            fontSize: '15px',
            fontFamily: 'verdana',
            color: '#FFFFFF',
            backgroundColor: canAfford ? '#4CAF50' : '#9E9E9E',
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        this.container.add(this.priceLabel);

        this.purchaseButton = this.scene.add.container(0, 0);
        const buttonBg = this.scene.add.rectangle(0, 90, 140, 40,
            isAvailable ? 0x4CAF50 : 0x9E9E9E).setOrigin(0.5);
        const buttonText = this.scene.add.text(0, 90, "ADVANCE STAGE", {
            fontSize: '12px',
            fontFamily: 'verdana',
            color: '#FFFFFF'
        }).setOrigin(0.5);
        this.purchaseButton.add([buttonBg, buttonText]);
        this.container.add(this.purchaseButton);
        this.container.bringToTop(this.purchaseButton);
        this.purchaseButton.setVisible(false);

        if (!isAvailable) {
            this.unavailableOverlay = this.scene.add.rectangle(0, 0, 180, 250,
                0x000000, 0.5).setOrigin(0.5);
            this.container.add(this.unavailableOverlay);

            // Dry refusal line: prefer the year-gate's own message
            // ("The board will not entertain the next stage before Year N."),
            // falling back to insufficient funds.
            const reasonText = !gate.ok ? (gate.reason ?? 'Not Yet Available') : 'Insufficient Funds';
            this.unavailableReasonText = this.scene.add.text(0, 0, reasonText, {
                fontSize: '13px',
                fontFamily: 'verdana',
                color: '#FFFFFF',
                backgroundColor: '#FF0000',
                padding: { x: 5, y: 3 },
                align: 'center',
                wordWrap: { width: 160 }
            }).setOrigin(0.5);
            this.container.add(this.unavailableReasonText);
        }
    }
}

/** 1-3 -> I/II/III. Stage counts are small and fixed (three, per the current
 *  design), so this only needs to cover a handful of values, but is written
 *  generically rather than as a 3-entry lookup. */
function toRoman(n: number): string {
    const numerals: [number, string][] = [
        [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
        [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
        [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
    ];
    let remaining = n;
    let result = '';
    for (const [value, symbol] of numerals) {
        while (remaining >= value) {
            result += symbol;
            remaining -= value;
        }
    }
    return result || String(n);
}

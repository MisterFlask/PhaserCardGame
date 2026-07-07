import Phaser, { Scene } from 'phaser';
import { StandingOrder } from '../../../../campaign/orders/StandingOrder';
import { STANDING_ORDER_REGISTRY, StandingOrdersState } from '../../../../campaign/orders/StandingOrdersState';
import { GameState } from '../../../../rules/GameState';
import { SaveManager } from '../../../../saveload/SaveManager';
import { AbstractStrategicProject } from '../../../../strategic_projects/AbstractStrategicProject';
import { StrategicProjectTechTree } from '../../../../strategic_projects/StrategicProjectTechTree';
import { TextBoxButton } from '../../../../ui/Button';
import { PhysicalProjectCard } from '../../../../ui/PhysicalProjectCard';
import { TextBox } from '../../../../ui/TextBox';
import { drawBackdropDim, drawWoodPanel, Fonts, Palette } from '../../../../ui/UIStyle';
import { CardGuiUtils } from '../../../../utils/CardGuiUtils';
import { CampaignUiState, CLIENT_RETAINER_ORDER_IDS, CLIENT_RETAINER_UNLOCK_THRESHOLD } from '../CampaignUiState';
import { AbstractHqPanel } from './AbstractHqPanel';

type InvestmentTab = 'capital-works' | 'standing-orders';

const ORDER_CARD_W = 480;
const ORDER_CARD_H = 160;

export class InvestmentPanel extends AbstractHqPanel {
    private projectCards: PhysicalProjectCard[] = [];
    private poundsDisplay: TextBox;
    private connectionLines: Phaser.GameObjects.Line[] = [];
    private treeContainer: Phaser.GameObjects.Container;
    private uiContainer: Phaser.GameObjects.Container;
    private currentLayout: Map<string, { x: number, y: number }> = new Map();

    private activeTab: InvestmentTab = 'capital-works';
    private capitalWorksTabButton!: TextBoxButton;
    private standingOrdersTabButton!: TextBoxButton;
    private standingOrdersContainer!: Phaser.GameObjects.Container;
    private standingOrdersDynamic: Phaser.GameObjects.GameObject[] = [];
    /** Non-null while the REPLACE picker is open: the id of the order the
     *  player wants to enact in place of one currently active/pending. */
    private replacePickerForOrderId: string | null = null;

    constructor(scene: Scene) {
        super(scene, 'Factory Investments');
        this.titleText.setVisible(false); // tab rail (BOARDROOM) names the view

        const dim = drawBackdropDim(scene, 0.5);
        this.add(dim);

        // Create UI container
        this.uiContainer = scene.add.container(0, 0);

        // Working-capital display, on a brass-bordered plaque. Chrome
        // (status bar + tab rail) occupies y 0-100; this sits just below
        // the tab rail, above the CAPITAL WORKS / STANDING ORDERS toggle.
        const poundsPlaque = scene.add.container(scene.scale.width / 2, 122);
        poundsPlaque.add(drawWoodPanel(scene, 420, 44));
        this.poundsDisplay = new TextBox({
            scene: scene,
            x: 0,
            y: 0,
            width: 400,
            text: `WORKING CAPITAL: £${GameState.getInstance().moneyInVault}`,
            fillColor: Palette.WOOD_PANEL,
            style: { fontSize: '20px', fontFamily: Fonts.DISPLAY, color: Palette.BRASS_TEXT, align: 'center' }
        });
        this.poundsDisplay.setStroke(false);
        poundsPlaque.add(this.poundsDisplay);
        this.uiContainer.add(poundsPlaque);

        // Add UI container to panel
        this.add(this.uiContainer);

        // Listen for funds changed events
        const onFundsChanged = this.updatePoundsDisplay.bind(this);
        scene.events.on('fundsChanged', onFundsChanged);

        // Setup event handlers for project card interactions
        const onProjectHovered = this.onProjectHovered.bind(this);
        const onProjectUnhovered = this.onProjectUnhovered.bind(this);
        const onProjectClicked = this.onProjectClicked.bind(this);
        scene.events.on('projectHovered', onProjectHovered);
        scene.events.on('projectUnhovered', onProjectUnhovered);
        scene.events.on('projectClicked', onProjectClicked);

        // create() re-runs this constructor on every sortie return; remove
        // these listeners on scene shutdown so stale panel closures don't
        // accumulate across sorties.
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            scene.events.off('fundsChanged', onFundsChanged);
            scene.events.off('projectHovered', onProjectHovered);
            scene.events.off('projectUnhovered', onProjectUnhovered);
            scene.events.off('projectClicked', onProjectClicked);
        });

        // Create the tree container
        this.treeContainer = scene.add.container(120, 300); // Add padding: 120px left, 300px from top
        this.add(this.treeContainer);

        this.displayTechTree();

        // Tab toggle: CAPITAL WORKS <-> STANDING ORDERS
        this.buildTabButtons();

        // Standing Orders view, built on demand
        this.standingOrdersContainer = scene.add.container(0, 0);
        this.add(this.standingOrdersContainer);

        // Hide initially until explicitly shown
        this.hide();
    }

    private buildTabButtons(): void {
        const scene = this.scene;
        const tabY = 165;
        this.capitalWorksTabButton = new TextBoxButton({
            scene, x: scene.scale.width / 2 - 130, y: tabY, width: 240, height: 40,
            text: 'CAPITAL WORKS',
            style: { fontSize: '16px', color: Palette.BRASS_TEXT, fontFamily: Fonts.DISPLAY },
            fillColor: Palette.WOOD_PANEL
        });
        this.capitalWorksTabButton.onClick(() => this.setTab('capital-works'));
        this.add(this.capitalWorksTabButton);

        this.standingOrdersTabButton = new TextBoxButton({
            scene, x: scene.scale.width / 2 + 130, y: tabY, width: 240, height: 40,
            text: 'STANDING ORDERS',
            style: { fontSize: '16px', color: Palette.BRASS_TEXT, fontFamily: Fonts.DISPLAY },
            fillColor: Palette.WOOD_PANEL
        });
        this.standingOrdersTabButton.onClick(() => this.setTab('standing-orders'));
        this.add(this.standingOrdersTabButton);

        this.refreshTabButtons();
    }

    private refreshTabButtons(): void {
        this.capitalWorksTabButton.setFillColor(this.activeTab === 'capital-works' ? Palette.VERDIGRIS : Palette.WOOD_PANEL);
        this.standingOrdersTabButton.setFillColor(this.activeTab === 'standing-orders' ? Palette.VERDIGRIS : Palette.WOOD_PANEL);
    }

    private setTab(tab: InvestmentTab): void {
        this.activeTab = tab;
        this.refreshTabButtons();

        const showCapitalWorks = tab === 'capital-works';
        this.treeContainer.setVisible(showCapitalWorks);
        this.poundsDisplay.setVisible(showCapitalWorks);
        this.standingOrdersContainer.setVisible(!showCapitalWorks);

        if (!showCapitalWorks) {
            this.rebuildStandingOrders();
        }
    }

    show(): void {
        this.setTab(this.activeTab);
        super.show();
    }

    hide(): void {
        super.hide();
    }

    private updatePoundsDisplay(): void {
        this.poundsDisplay.setText(`WORKING CAPITAL: £${GameState.getInstance().moneyInVault}`);
    }

    private clearCards(): void {
        // Clear all cards
        this.projectCards.forEach(card => {
            card.obliterate();
        });
        this.projectCards = [];
        
        // Clear all connection lines
        this.connectionLines.forEach(line => {
            line.destroy();
        });
        this.connectionLines = [];
    }

    private displayTechTree(): void {
        const campaignState = CampaignUiState.getInstance();
        
        // Combine available and owned projects for the tech tree layout
        const allProjects = [
            ...campaignState.availableStrategicProjects,
            ...campaignState.ownedStrategicProjects
        ];
        
        // Calculate layout using dagre
        const layout = StrategicProjectTechTree.calculateLayout(allProjects);
        this.currentLayout = layout;
        const edges = StrategicProjectTechTree.getEdges(allProjects);

        // Clear existing content
        this.clearCards();
        this.treeContainer.removeAll();

        // Draw connections first (so they're behind the cards)
        edges.forEach(edge => {
            const sourcePos = layout.get(edge.source);
            const targetPos = layout.get(edge.target);
            if (sourcePos && targetPos) {
                const line = this.scene.add.line(
                    0, 0,
                    sourcePos.x, sourcePos.y,
                    targetPos.x, targetPos.y,
                    Palette.BRASS, 0.7
                );
                line.setOrigin(0, 0);
                this.treeContainer.add(line);
                this.connectionLines.push(line);
            }
        });
        
        // Create all project cards at their calculated positions
        allProjects.forEach(project => {
            const pos = layout.get(project.name);
            if (pos) {
                const card = this.createProjectCard(project, pos.x, pos.y);
                this.treeContainer.add(card.container);
                this.projectCards.push(card);
            }
        });
    }

    private createProjectCard(project: AbstractStrategicProject, x: number, y: number): PhysicalProjectCard {
        const cardConfig = CardGuiUtils.getInstance().cardConfig;
        
        const card = new PhysicalProjectCard({
            scene: this.scene,
            x,
            y,
            data: project,
            cardConfig
        });
        
        return card;
    }
    
    private onProjectHovered(project: AbstractStrategicProject): void {
        this.highlightConnections(project);
    }
    
    private onProjectUnhovered(): void {
        this.resetConnectionHighlights();
    }
    
    private onProjectClicked(project: AbstractStrategicProject): void {
        const campaignState = CampaignUiState.getInstance();

        // Check if player can afford it and prerequisites are met
        const prerequisites = project.getPrerequisites();
        const prereqsMet = prerequisites.length === 0 || prerequisites.every(prereq => 
            campaignState.ownedStrategicProjects.some(owned => owned.name === prereq.name)
        );
        
        if (campaignState.getCurrentFunds() >= project.getMoneyCost() && prereqsMet) {
            // Move from available to owned
            campaignState.availableStrategicProjects = campaignState.availableStrategicProjects
                .filter(p => p !== project);
            campaignState.ownedStrategicProjects.push(project);
            
            // Deduct funds from GameState
            GameState.getInstance().moneyInVault -= project.getMoneyCost();

            // Company Secretariat (and any future bonus-slot Capital Work)
            // takes effect immediately on purchase.
            campaignState.syncStandingOrderBonusSlots();

            // Notify other components that funds have changed
            this.scene.events.emit('fundsChanged');

            // Update all cards to reflect the change
            this.updateCards();

            // Purchases are permanent: checkpoint immediately.
            SaveManager.save();
        }
    }
    
    private highlightConnections(project: AbstractStrategicProject): void {
        // Highlight connections to prerequisites
        const prerequisites = project.getPrerequisites();
        
        this.connectionLines.forEach(line => {
            line.setStrokeStyle(1, Palette.BRASS, 0.7); // Reset to default
        });

        if (prerequisites.length > 0) {
            const campaignState = CampaignUiState.getInstance();
            const allProjects = [
                ...campaignState.availableStrategicProjects,
                ...campaignState.ownedStrategicProjects
            ];
            
            const edges = StrategicProjectTechTree.getEdges(allProjects);
            
            // Find the edges connected to this project
            edges.forEach((edge, index) => {
                if (edge.target === project.name) {
                    // This is a prerequisite connection
                    this.connectionLines[index]?.setStrokeStyle(3, Palette.BRASS_BRIGHT, 1); // Brass, thicker, fully opaque
                }
            });
        }
    }
    
    private resetConnectionHighlights(): void {
        // Reset all connection lines to default appearance
        this.connectionLines.forEach(line => {
            line.setStrokeStyle(1, Palette.BRASS, 0.7);
        });
    }

    private updateCards(): void {
        // Update all project cards to reflect current state
        this.projectCards.forEach(card => {
            card.update();
        });
    }

    update(): void {
        // Update any dynamic content
        this.updatePoundsDisplay();

        // Update all cards
        this.updateCards();
    }

    // --- Standing Orders view ---

    private clearStandingOrdersDynamic(): void {
        this.standingOrdersDynamic.forEach(o => { this.standingOrdersContainer.remove(o); o.destroy(); });
        this.standingOrdersDynamic = [];
    }

    private addStandingOrdersDynamic<T extends Phaser.GameObjects.GameObject>(obj: T): T {
        this.standingOrdersDynamic.push(obj);
        this.standingOrdersContainer.add(obj);
        return obj;
    }

    private rebuildStandingOrders(): void {
        this.clearStandingOrdersDynamic();
        const scene = this.scene;
        const width = scene.scale.width;
        const ordersState = StandingOrdersState.getInstance();
        const campaign = CampaignUiState.getInstance();
        const year = campaign.calendar.year;
        const slots = ordersState.slotsForYear(year);
        const activeCount = ordersState.activeOrderIds.length;

        // Slot status header
        this.addStandingOrdersDynamic(new TextBox({
            scene, x: width / 2, y: 210, width: 500, height: 36,
            text: `STANDING ORDERS · ${activeCount}/${slots}`,
            style: { fontSize: '22px', fontFamily: Fonts.DISPLAY, color: Palette.BRASS_TEXT }
        }));

        const orders = Array.from(STANDING_ORDER_REGISTRY.values());
        const cols = 2;
        const startY = 260;
        const colW = ORDER_CARD_W + 40;
        const rowH = ORDER_CARD_H + 24;
        const originX = width / 2 - colW / 2;

        orders.forEach((order, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = originX + col * colW;
            const y = startY + row * rowH + ORDER_CARD_H / 2;
            this.addStandingOrdersDynamic(this.buildOrderCard(order, x, y, ordersState, year));
        });

        // Locked client-retainer rows: orders gated on repeat business with a
        // client (see CampaignUiState.CLIENT_RETAINER_ORDER_IDS). Drawn below
        // the main grid so the launch pool's layout is untouched. A retainer
        // order id that IS in the registry (i.e. its Standing Order has been
        // implemented) is shown as a normal card above instead of here once
        // unlocked — this row is purely the "not yet unlocked" placeholder.
        const lockedClientOrders = Object.entries(CLIENT_RETAINER_ORDER_IDS)
            .filter(([client, orderId]) => !STANDING_ORDER_REGISTRY.has(orderId) || !campaign.isClientRetainerUnlocked(client));
        const lockedStartY = startY + Math.ceil(orders.length / cols) * rowH + 20;
        lockedClientOrders.forEach(([client, orderId], i) => {
            const y = lockedStartY + i * (ORDER_CARD_H / 2 + 12);
            this.addStandingOrdersDynamic(this.buildLockedRetainerRow(client, orderId, width / 2, y, campaign));
        });

        // REPLACE picker overlay, drawn last so it sits above everything.
        if (this.replacePickerForOrderId) {
            this.addStandingOrdersDynamic(this.buildReplacePicker(this.replacePickerForOrderId, ordersState));
        }
    }

    /** ACTIVE / PENDING / available state for a single order, plus its card UI. */
    private buildOrderCard(
        order: StandingOrder, x: number, y: number, ordersState: StandingOrdersState, year: number
    ): Phaser.GameObjects.Container {
        const scene = this.scene;
        const container = scene.add.container(x, y);

        const isActive = ordersState.activeOrderIds.includes(order.id);
        const pendingList = ordersState.pendingOrderIds;
        // Pending state only matters for an order that is currently active and
        // queued for removal/replacement (not in the post-meeting list), or an
        // order freshly enacted this quarter that also appears in pendingOrderIds
        // (see StandingOrdersState.enact doc comment).
        const isQueuedForRemoval = isActive && pendingList !== null && !pendingList.includes(order.id);
        const hasFreeSlot = activeSlotsFree(ordersState, year);

        const bg = scene.add.graphics();
        bg.fillStyle(Palette.PAPER_SHADOW, 0.5);
        bg.fillRect(-ORDER_CARD_W / 2 + 4, -ORDER_CARD_H / 2 + 5, ORDER_CARD_W, ORDER_CARD_H);
        bg.fillStyle(isActive ? Palette.VERDIGRIS : Palette.WOOD_PANEL, 0.96);
        bg.fillRect(-ORDER_CARD_W / 2, -ORDER_CARD_H / 2, ORDER_CARD_W, ORDER_CARD_H);
        bg.lineStyle(2, isActive ? Palette.BRASS_BRIGHT : Palette.BRASS, 0.9);
        bg.strokeRect(-ORDER_CARD_W / 2 + 3, -ORDER_CARD_H / 2 + 3, ORDER_CARD_W - 6, ORDER_CARD_H - 6);
        container.add(bg);

        container.add(scene.add.text(-ORDER_CARD_W / 2 + 16, -ORDER_CARD_H / 2 + 10, order.name, {
            fontFamily: Fonts.DISPLAY, fontSize: '19px', color: Palette.WHITE,
            wordWrap: { width: ORDER_CARD_W - 120 },
        }));

        // State stamp, top right
        let stampText = 'AVAILABLE';
        let stampColor: string = Palette.DISABLED_TEXT;
        if (isQueuedForRemoval) {
            stampText = `RATIFIES IN ${CampaignUiState.getInstance().calendar.weeksUntilDividend}w`;
            stampColor = Palette.CRIMSON_TEXT;
        } else if (isActive) {
            stampText = 'ACTIVE';
            stampColor = Palette.GOOD_TEXT;
        }
        container.add(scene.add.text(ORDER_CARD_W / 2 - 14, -ORDER_CARD_H / 2 + 10, stampText, {
            fontFamily: Fonts.UTILITY, fontSize: '12px', fontStyle: 'bold', color: stampColor,
        }).setOrigin(1, 0));

        // Description (BBCode-capable)
        const descBox = new TextBox({
            scene, x: 0, y: -6, width: ORDER_CARD_W - 32, height: 74,
            text: order.description,
            style: { fontSize: '13px', fontFamily: 'verdana' }
        });
        descBox.setStroke(false);
        container.add(descBox);

        // Flavor line
        container.add(scene.add.text(-ORDER_CARD_W / 2 + 16, ORDER_CARD_H / 2 - 46, order.flavor, {
            fontFamily: Fonts.BODY, fontSize: '12px', color: Palette.INK_FADED, fontStyle: 'italic',
            wordWrap: { width: ORDER_CARD_W - 32 },
        }));

        // Action button, bottom right
        const actionButton = new TextBoxButton({
            scene, x: ORDER_CARD_W / 2 - 90, y: ORDER_CARD_H / 2 - 20, width: 160, height: 34,
            text: '...',
            style: { fontSize: '13px', color: Palette.BRASS_TEXT, fontFamily: Fonts.DISPLAY },
            fillColor: Palette.WOOD_PANEL
        });

        if (isQueuedForRemoval) {
            actionButton.setText(`RESCINDING · ${CampaignUiState.getInstance().calendar.weeksUntilDividend}w`);
            actionButton.setButtonEnabled(false);
        } else if (isActive) {
            actionButton.setText('RESCIND');
            actionButton.onClick(() => {
                ordersState.queueRemoval(order.id);
                SaveManager.save();
                this.rebuildStandingOrders();
            });
        } else if (hasFreeSlot) {
            actionButton.setText('ENACT');
            actionButton.onClick(() => {
                ordersState.enact(order.id, year);
                SaveManager.save();
                this.rebuildStandingOrders();
            });
        } else {
            // No free slot and not active: offer a direct REPLACE (swap one
            // active/pending order for this one in a single ratification
            // action) instead of forcing rescind-then-enact-next-quarter.
            actionButton.setText('REPLACE...');
            actionButton.onClick(() => {
                this.replacePickerForOrderId = order.id;
                this.rebuildStandingOrders();
            });
        }
        container.add(actionButton);

        return container;
    }

    /** A greyed row for a client-retainer order that hasn't unlocked yet. */
    private buildLockedRetainerRow(
        client: string, orderId: string, x: number, y: number, campaign: CampaignUiState
    ): Phaser.GameObjects.Container {
        const scene = this.scene;
        const container = scene.add.container(x, y);
        const rowW = ORDER_CARD_W * 2 + 40;
        const rowH = ORDER_CARD_H / 2;
        const completed = campaign.contractsCompletedByClient[client] ?? 0;

        const bg = scene.add.graphics();
        bg.fillStyle(Palette.PAPER_SHADOW, 0.4);
        bg.fillRect(-rowW / 2, -rowH / 2, rowW, rowH);
        bg.lineStyle(1, Palette.DISABLED, 0.6);
        bg.strokeRect(-rowW / 2 + 2, -rowH / 2 + 2, rowW - 4, rowH - 4);
        container.add(bg);

        container.add(scene.add.text(-rowW / 2 + 16, -rowH / 2 + 8, 'LOCKED', {
            fontFamily: Fonts.UTILITY, fontSize: '11px', fontStyle: 'bold', color: Palette.DISABLED_TEXT,
        }));

        const remaining = Math.max(0, CLIENT_RETAINER_UNLOCK_THRESHOLD - completed);
        const noticeText = new TextBox({
            scene, x: 0, y: 4, width: rowW - 32, height: rowH - 20,
            text: `[i]Retainer: fulfil ${remaining} more contract(s) for ${client} (${completed}/${CLIENT_RETAINER_UNLOCK_THRESHOLD}).[/i]`,
            style: { fontSize: '13px', fontFamily: 'verdana', color: Palette.DISABLED_TEXT }
        });
        noticeText.setStroke(false);
        container.add(noticeText);

        return container;
    }

    /** Inline overlay: pick which active/pending order to replace with
     *  `newOrderId`. Cancel closes it without changing anything. */
    private buildReplacePicker(newOrderId: string, ordersState: StandingOrdersState): Phaser.GameObjects.Container {
        const scene = this.scene;
        const width = scene.scale.width;
        const height = scene.scale.height;
        const newOrder = STANDING_ORDER_REGISTRY.get(newOrderId);
        // The post-meeting configuration is what REPLACE actually swaps
        // within (StandingOrdersState.queueReplace operates on
        // pendingOrderIds ?? activeOrderIds) — offer those, not raw
        // activeOrderIds, so a slate with an already-queued change picks
        // consistently with what will actually ratify.
        const candidateIds = ordersState.pendingOrderIds ?? ordersState.activeOrderIds;
        const candidates = candidateIds
            .map(id => STANDING_ORDER_REGISTRY.get(id))
            .filter((o): o is StandingOrder => o !== undefined);

        const container = scene.add.container(0, 0);
        container.add(drawBackdropDim(scene, 0.75));

        const panelW = 460;
        const panelH = 80 + candidates.length * 44 + 60;
        const panelX = width / 2;
        const panelY = height / 2;
        const panel = scene.add.container(panelX, panelY);
        panel.add(drawWoodPanel(scene, panelW, panelH));

        const title = new TextBox({
            scene, x: 0, y: -panelH / 2 + 30, width: panelW - 40, height: 40,
            text: `Replace which order with ${newOrder?.name ?? newOrderId}?`,
            style: { fontSize: '16px', fontFamily: Fonts.DISPLAY, color: Palette.BRASS_TEXT, align: 'center' }
        });
        title.setStroke(false);
        panel.add(title);

        candidates.forEach((candidate, i) => {
            const rowY = -panelH / 2 + 70 + i * 44;
            const rowButton = new TextBoxButton({
                scene, x: 0, y: rowY, width: panelW - 60, height: 36,
                text: candidate.name,
                style: { fontSize: '14px', color: Palette.BRASS_TEXT, fontFamily: Fonts.DISPLAY },
                fillColor: Palette.WOOD_PANEL
            });
            rowButton.onClick(() => {
                ordersState.queueReplace(candidate.id, newOrderId);
                SaveManager.save();
                this.replacePickerForOrderId = null;
                this.rebuildStandingOrders();
            });
            panel.add(rowButton);
        });

        const cancelButton = new TextBoxButton({
            scene, x: 0, y: panelH / 2 - 30, width: 160, height: 34,
            text: 'CANCEL',
            style: { fontSize: '13px', color: Palette.BRASS_TEXT, fontFamily: Fonts.DISPLAY },
            fillColor: Palette.WOOD_PANEL
        });
        cancelButton.onClick(() => {
            this.replacePickerForOrderId = null;
            this.rebuildStandingOrders();
        });
        panel.add(cancelButton);

        container.add(panel);
        return container;
    }
}

/** True if the order slate has room for one more active order this year. */
function activeSlotsFree(ordersState: StandingOrdersState, year: number): boolean {
    return ordersState.activeOrderIds.length < ordersState.slotsForYear(year);
}
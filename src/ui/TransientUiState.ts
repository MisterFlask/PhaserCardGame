import { ActionManagerFetcher } from "../utils/ActionManagerFetcher";
import { IncomingIntent } from "./IncomingIntent";
import type { PhysicalCard } from "./PhysicalCard";
import type { PhysicalIntent } from "./PhysicalIntent";
import { UIContextManager } from "./UIContextManager";

export class TransientUiState {
    private static instance: TransientUiState;

    // UI state properties
    public draggedCard: PhysicalCard | undefined = undefined;
    public hoveredCard: PhysicalCard | undefined = undefined;
    public hoveredIntent: PhysicalIntent | undefined = undefined;
    public hoveredIncomingIntent: IncomingIntent | undefined = undefined;
    public mouseOverCardDropZone: boolean = false;
    public showLiquidationPanel: boolean = false;

    private constructor() {}

    public static getInstance(): TransientUiState {
        if (!TransientUiState.instance) {
            TransientUiState.instance = new TransientUiState();
        }
        return TransientUiState.instance;
    }

    public setDraggedCard(card: PhysicalCard | undefined | null): void {
        // only applies to playable card instances
        if (card?.data?.isPlayableCard()) {
            this.draggedCard = card ?? undefined;
        }else{
            this.draggedCard = undefined;
        }
    }

    public setHoveredCard(card: PhysicalCard | undefined | null): void {
        this.hoveredCard = card ?? undefined;
    }

    public setHoveredIntent(intent: PhysicalIntent | undefined | null): void {
        this.hoveredIntent = intent ?? undefined;
    }

    public setHoveredIncomingIntent(incomingIntent: IncomingIntent   | undefined | null): void {
        this.hoveredIncomingIntent = incomingIntent ?? undefined;
    }

    public getDebugDisplayString(): string {
        return `UI State: ${UIContextManager.getInstance().getContext()}
Dragged Card: ${this.draggedCard ? this.draggedCard.data.name : 'None'}
Hovered Card: ${this.hoveredCard ? this.hoveredCard.data.name : 'None'}
Hovered Intent: ${this.hoveredIntent ? this.hoveredIntent.intent.id : 'None'}
Hovered Incoming Intent: ${this.hoveredIncomingIntent ? this.hoveredIncomingIntent.intent.id : 'None'}
Queue As String: ${ActionManagerFetcher.getActionManager().queueAsString()}
Mouse Over Card Drop Zone: ${this.mouseOverCardDropZone ? 'Yes' : 'No'}`.trim();
    }
} 
import type { PhysicalCard } from "./PhysicalCard";
import type { PhysicalIntent } from "./PhysicalIntent";

export class TransientUiState {
    private static instance: TransientUiState;

    // UI state properties
    public draggedCard: PhysicalCard | undefined = undefined;
    public hoveredCard: PhysicalCard | undefined = undefined;
    public hoveredIntent: PhysicalIntent | undefined = undefined;

    private constructor() {}

    public static getInstance(): TransientUiState {
        if (!TransientUiState.instance) {
            TransientUiState.instance = new TransientUiState();
        }
        return TransientUiState.instance;
    }

    public setDraggedCard(card: PhysicalCard | undefined | null): void {
        this.draggedCard = card ?? undefined;
    }

    public setHoveredCard(card: PhysicalCard | undefined | null): void {
        this.hoveredCard = card ?? undefined;
    }

    public setHoveredIntent(intent: PhysicalIntent | undefined | null): void {
        this.hoveredIntent = intent ?? undefined;
    }
} 
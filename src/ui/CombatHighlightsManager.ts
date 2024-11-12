import { AbstractCard } from "../gamecharacters/AbstractCard";
import { BaseCharacterType } from "../Types";
import { PhysicalCard } from "./PhysicalCard";
import { TransientUiState } from "./TransientUiState";

export class CombatHighlightsManager {
    private static instance: CombatHighlightsManager;
    private transientUiState: TransientUiState;

    // Color constants
    private static readonly ELIGIBLE_TARGET_COLOR = 0xffff00; // Yellow
    private static readonly HOVERED_TARGET_COLOR = 0x00ff00;  // Green
    private static readonly HOVERED_CARD_COLOR = 0xffffff;    // White

    private constructor() {
        this.transientUiState = TransientUiState.getInstance();
    }

    public static getInstance(): CombatHighlightsManager {
        if (!CombatHighlightsManager.instance) {
            CombatHighlightsManager.instance = new CombatHighlightsManager();
        }
        return CombatHighlightsManager.instance;
    }

    public update(allCharacters: BaseCharacterType[]): void {
        // Clear all highlights first
        this.clearAllHighlights(allCharacters);

        const draggedCard = this.transientUiState.draggedCard;
        const hoveredCard = this.transientUiState.hoveredCard;

        if (draggedCard) {
            this.handleDraggedCardHighlights(draggedCard, allCharacters);
        }

        if (hoveredCard) {
            this.handleHoveredCardHighlight(hoveredCard);
        }
    }

    private clearAllHighlights(characters: BaseCharacterType[]): void {
        // Clear character highlights
        characters.forEach(character => {
            if (character.physicalCard) {
                character.physicalCard.setGlow(false);
            }
        });
    }

    private handleDraggedCardHighlights(draggedCard: PhysicalCard, characters: BaseCharacterType[]): void {
        const hoveredCharacter = this.findHoveredCharacter(characters);

        characters.forEach(character => {
            if (!character.physicalCard) return;

            if (this.isEligibleTarget(draggedCard.data, character)) {
                // If this is the hovered character and it's eligible, highlight in green
                if (character === hoveredCharacter) {
                    character.physicalCard.glowColor = CombatHighlightsManager.HOVERED_TARGET_COLOR;
                    character.physicalCard.setGlow(true);
                } 
                // Otherwise highlight eligible targets in yellow
                else {
                    character.physicalCard.glowColor = CombatHighlightsManager.ELIGIBLE_TARGET_COLOR;
                    character.physicalCard.setGlow(true);
                }
            }
        });
    }

    private handleHoveredCardHighlight(hoveredCard: PhysicalCard): void {
        hoveredCard.glowColor = CombatHighlightsManager.HOVERED_CARD_COLOR;
        hoveredCard.setGlow(true);
    }

    private findHoveredCharacter(characters: BaseCharacterType[]): BaseCharacterType | undefined {
        return characters.find(character => 
            character.physicalCard && 
            character.physicalCard === this.transientUiState.hoveredCard
        );
    }

    private isEligibleTarget(draggedPlayableCard: AbstractCard, character: BaseCharacterType): boolean {
        return true;
    }
} 
import { AbstractCard, TargetingType } from "../gamecharacters/AbstractCard";
import { GameState } from "../rules/GameState";
import CombatUIManager from "../screens/subcomponents/CombatUiManager";
import { BaseCharacterType } from "../Types";
import { IncomingIntent } from "./IncomingIntent";
import { PhysicalCard } from "./PhysicalCard";
import { PhysicalIntent } from "./PhysicalIntent";
import { TransientUiState } from "./TransientUiState";
import { UIContext, UIContextManager } from "./UIContextManager";

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
        if (UIContextManager.getInstance().isContext(UIContext.CARD_SELECTION_FROM_HAND)
        || UIContextManager.getInstance().isContext(UIContext.CARD_SELECTION_FROM_CUSTOM_POOL)) {
            return;
        };

        // Clear all highlights first
        this.clearAllHighlights(allCharacters);

        if (this.transientUiState.hoveredIntent) {
            this.highlightDefender(this.transientUiState.hoveredIntent);
        }
        
        if (this.transientUiState.hoveredIncomingIntent) {
            this.highlightAttacker(this.transientUiState.hoveredIncomingIntent);
        }

        const draggedCard = this.transientUiState.draggedCard;
        const hoveredCard = this.transientUiState.hoveredCard;

        if (hoveredCard && !draggedCard) {  // Only do this when not dragging a card
            const cardOwner = allCharacters.find(char => char.id === hoveredCard.data.owningCharacter?.id);
            if (cardOwner?.physicalCard) {
                cardOwner.physicalCard.glowColor = CombatHighlightsManager.ELIGIBLE_TARGET_COLOR;
                cardOwner.physicalCard.setGlow(true);
            }
        }

        if (draggedCard) {
            this.handleDraggedCardHighlights(draggedCard, allCharacters);

            if (draggedCard.data.asPlayableCard().targetingType === TargetingType.NO_TARGETING) {
                CombatUIManager.getInstance().dropZoneHighlight.setAlpha(0.5)
                if (TransientUiState.getInstance().mouseOverCardDropZone) {
                    CombatUIManager.getInstance().dropZoneHighlight.setTint(CombatHighlightsManager.HOVERED_TARGET_COLOR)
                } else {
                    CombatUIManager.getInstance().dropZoneHighlight.setTint(CombatHighlightsManager.ELIGIBLE_TARGET_COLOR)
                }
            }
        }

        if (hoveredCard) {
            this.handleHoveredCardHighlight(hoveredCard);
        }

    }

    highlightAttacker(hoveredIncomingIntent: IncomingIntent) {
        var attacker = hoveredIncomingIntent.intent.owner;
        attacker?.physicalCard?.setGlow(true)
    }

    highlightDefender(hoveredIntent: PhysicalIntent) {
        hoveredIntent.getTargetedCharacter()?.physicalCard?.setGlow(true)
    }

    private clearAllHighlights(characters: BaseCharacterType[]): void {
        

        // Clear character highlights
        characters.forEach(character => {
            if (character.physicalCard) {
                character.physicalCard.setGlow(false);
            }
        });

        CombatUIManager.getInstance().dropZoneHighlight.setAlpha(0.0)
        // now, cards in hand
        GameState.getInstance().combatState.currentHand.forEach(card => {
            card.physicalCard?.setGlow(false);
        });
    }

    private handleDraggedCardHighlights(draggedCard: PhysicalCard, characters: BaseCharacterType[]): void {
        const hoveredCharacter = this.findHoveredCharacter(characters);

        characters.forEach(character => {
            if (!character.physicalCard) return;

            if (this.isEligibleTargetForPurposeOfHighlighting(draggedCard.data, character)) {
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

    private isEligibleTargetForPurposeOfHighlighting(draggedCard: AbstractCard, character: BaseCharacterType): boolean {
        if (draggedCard.asPlayableCard().targetingType === TargetingType.NO_TARGETING) return false;
        
        return draggedCard.isValidTarget(character);
    }
} 
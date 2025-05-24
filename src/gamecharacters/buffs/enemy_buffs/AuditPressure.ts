import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Dexterity } from "../persona/Dexterity";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";

export class AuditPressure extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "scroll";
        this.showSecondaryStacks = true;
        this.secondaryStacks = 0;
    }

    override getDisplayName(): string {
        return "Audit Pressure";
    }

    override getDescription(): string {
        return `If more than three cards were played this turn, all players lose ${this.getStacksDisplayText()} Dexterity.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        const gameState = GameState.getInstance();
        if (gameState.combatState.playerCharacters.some(pc => pc === playedCard.owningCharacter)) {
            this.secondaryStacks++;
        }
    }

    override onTurnEnd(): void {
        const gameState = GameState.getInstance();
        if (this.secondaryStacks > 3) {
            const actionManager = ActionManager.getInstance();
            gameState.combatState.playerCharacters.forEach(pc => {
                actionManager.applyBuffToCharacterOrCard(pc, new Dexterity(-this.stacks));
            });
        }
        this.secondaryStacks = 0;
    }
}

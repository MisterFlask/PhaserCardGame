import { Team } from "../../AbstractCard";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Dexterity } from "../persona/Dexterity";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";

export class AuditPressure extends AbstractBuff {
    private cardsPlayedThisTurn = 0;

    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
        this.imageName = "scroll";
    }

    override getDisplayName(): string {
        return "Audit Pressure";
    }

    override getDescription(): string {
        return `If the party plays more than three cards in a turn, everyone loses ${this.getStacksDisplayText()} Dexterity at end of turn.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard, _target?: BaseCharacter): void {
        const ownerOfCard = playedCard?.owningCharacter;
        if (ownerOfCard && ownerOfCard.team === Team.ALLY) {
            this.cardsPlayedThisTurn++;
        }
    }

    override onTurnEnd(): void {
        if (this.cardsPlayedThisTurn > 3) {
            const actionManager = ActionManager.getInstance();
            GameState.getInstance().combatState.playerCharacters.forEach(pc => {
                actionManager.applyBuffToCharacterOrCard(pc, new Dexterity(-this.stacks));
            });
        }
        this.cardsPlayedThisTurn = 0;
    }

    override onTurnStart(): void {
        this.cardsPlayedThisTurn = 0;
    }
}

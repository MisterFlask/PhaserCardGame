import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";
import { AbstractBuff } from "../AbstractBuff";

export class EldritchHorror extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "eldritch horror"; // Replace with actual icon name if available
        this.stackable = false;
        this.isDebuff = true;
    }

    override getName(): string {
        return "Eldritch Horror";
    }

    override getDescription(): string {
        return "Every turn after turn 5, the party gains 1 stress.";
    }

    override onTurnStart(): void {
        const currentTurn = GameState.getInstance().combatState.currentTurn;
        if (currentTurn > 5) {
            const actionManager = ActionManager.getInstance();
            this.forEachAlly((ally) => {
                actionManager.addStressToCharacter(ally, 1);
            });
        }
    }
}

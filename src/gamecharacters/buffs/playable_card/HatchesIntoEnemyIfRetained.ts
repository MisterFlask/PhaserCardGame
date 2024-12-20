import { ActionManager } from "../../../utils/ActionManager";
import { AutomatedCharacter } from "../../AutomatedCharacter";
import { AbstractBuff } from "../AbstractBuff";

export class HatchesIntoEnemyIfRetained extends AbstractBuff {
    private monsterToSpawn: AutomatedCharacter;

    constructor(monsterToSpawn: AutomatedCharacter) {
        super();
        this.isDebuff = true;
        this.monsterToSpawn = monsterToSpawn;
    }

    override getDisplayName(): string {
        return "Hatching";
    }

    override getDescription(): string {
        return `If this card is retained at end of turn, it is exhausted and a ${this.monsterToSpawn.name} joins the fight.`;
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.exhaustCard(ownerCard);
            ActionManager.getInstance().addMonsterToCombat(this.monsterToSpawn);
        }
    }

    override onThisCardInvoked(): void {
        this.stacks = 0;
    }
}

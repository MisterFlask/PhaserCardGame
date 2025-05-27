import { AbstractBuff } from "../AbstractBuff";
import { PlayableCard } from "../../PlayableCard";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";

export class ProductionQuota extends AbstractBuff {
    constructor(){
        super();
        this.isDebuff = false;
        this.imageName = "factory";
    }

    override getDisplayName(): string {
        return "Production Quota";
    }

    override getDescription(): string {
        return "Whenever a card exhausts, deal 3 damage to all heroes.";
    }

    override onAnyCardExhausted(_card: PlayableCard): void {
        const state = GameState.getInstance();
        const actionManager = ActionManager.getInstance();
        const owner = this.getOwnerAsCharacter() || undefined;
        for (const hero of state.combatState.playerCharacters) {
            actionManager.dealDamage({
                baseDamageAmount: 3,
                target: hero,
                sourceCharacter: owner,
                fromAttack: false
            });
        }
    }
}

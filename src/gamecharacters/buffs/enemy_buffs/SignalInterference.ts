import { BaseCharacter } from "../../BaseCharacter";
import { Team } from "../../AbstractCard";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { TargetingUtils } from "../../../utils/TargetingUtils";
import { ActionManager } from "../../../utils/ActionManager";

export class SignalInterference extends AbstractBuff {
    constructor(damage: number = 2) {
        super();
        this.stacks = damage;
        this.isDebuff = false;
        this.imageName = "lightning-bolt";
    }

    override getDisplayName(): string {
        return "Signal Interference";
    }

    override getDescription(): string {
        return `Whenever a player card is played, deal ${this.getStacksDisplayText()} damage to a random player.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard, target?: BaseCharacter): void {
        const ownerOfCard = playedCard?.owningCharacter;
        if (ownerOfCard && ownerOfCard.team === Team.ALLY) {
            const randomPlayer = TargetingUtils.getInstance().selectRandomPlayerCharacter();
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.stacks, target: randomPlayer, sourceCharacter: this.getOwnerAsCharacter(), fromAttack: false });
        }
    }
}

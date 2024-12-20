import { ActionManager } from "../../../utils/ActionManager";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class CargoSensitive extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Cargo Sensitive";
    }

    override getDescription(): string {
        return "When a Cargo card is played, this character takes 20 damage.";
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard, _target?: any) {
        // if played card is cargo (ValuableCargo buff?), let's assume it's a property on the card or name check
        // We know from the buffs glossary that "ValuableCargo" is a buff that can appear on a card.
        // Let's check if card is considered cargo by searching a 'ValuableCargo' buff.
        const isCargo = playedCard.buffs.some(buff => buff.getDisplayName().toLowerCase() === "valuablecargo");
        if (isCargo) {
            ActionManager.getInstance().dealDamage({
                baseDamageAmount: 20,
                target: this.getOwnerAsCharacter()!,
                fromAttack: false
            });
            ActionManager.getInstance().displaySubtitle("the cargo leech recoils in pain at your cargo card!", 1000);
        }
    }
}

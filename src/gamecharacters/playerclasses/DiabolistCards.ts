import { ActionManager } from "../../utils/ActionManager";
import { AbstractCard, PlayableCard, TargetingType } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";

export class ArcaneRitualCard extends PlayableCard {
    constructor() {
        super({
            name: "Arcane Ritual",
            description: "Deal 4 damage to target enemy. Draw 1 card. Gain 4 block.",
            portraitName: "gem-pendant",
            targetingType: TargetingType.ENEMY
        });
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().dealDamage({ target: targetCard, amount: 4 });
            ActionManager.getInstance().drawCards(1);
            ActionManager.getInstance().applyBlock({ block: 4, blockTargetCharacter: this.owner as BaseCharacter , appliedViaPlayableCard: this, blockSourceCharacter: this.owner as BaseCharacter});
            console.log(`Dealt 4 damage to ${targetCard.name}`);
        }
        console.log("Drew 1 card");
    }
}




export class SummonDemonCard extends PlayableCard {
    constructor() {
        super({
            name: "Summon Demon",
            description: "Summon a 5/5 Demon minion.",
            portraitName: "skull-bolt"
        });
    }

    override InvokeCardEffects (targetCard?: AbstractCard): void{
        if (targetCard && targetCard instanceof BaseCharacter) {
            //ActionManager.getInstance().summonDemon({ target: targetCard, amount: 5 });
            console.log(`Summoned a 5/5 Demon minion`);
        }
    }
}
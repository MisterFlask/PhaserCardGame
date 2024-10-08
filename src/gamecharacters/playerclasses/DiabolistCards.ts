import { ActionManager } from "../../utils/ActionManager";
import { TargetingType, AbstractCard } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";
import { PlayableCard } from "../PlayableCard";
export class ArcaneRitualCard extends PlayableCard {
    constructor() {
        super({
            name: "Arcane Ritual",
            description: `Deal 4 damage to target enemy. Draw 1 card. Gain 4 block to Diabolist.`,
            portraitName: "gem-pendant",
            targetingType: TargetingType.ENEMY
        });
        this.baseDamage = 4;
        this.baseBlock = 4;
    }

    override get description(): string {
        return `Deal ${this.getDisplayedDamage()} damage to target enemy. Draw 1 card. Gain ${this.getDisplayedBlock()} block to Diabolist.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.dealDamageToTarget(targetCard);
            ActionManager.getInstance().drawCards(1);
            this.applyBlockToTarget(this.owner);
        }
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
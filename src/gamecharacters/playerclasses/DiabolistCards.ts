import { AbstractCard, PlayableCard } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";
import { AutomatedCharacter } from "../CharacterClasses";
import { ActionManager } from "../../utils/ActionManager";

export class ArcaneRitualCard extends PlayableCard {
    constructor() {
        super({
            name: "Arcane Ritual",
            description: "Deal 4 damage to target enemy. Draw 1 card.",
            portraitName: "gem-pendant"
        });
    }

    IsPerformableOn = (targetCard: AbstractCard): boolean => {
        return targetCard instanceof AutomatedCharacter;
    }

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().dealDamage({ target: targetCard, amount: 4 });
            console.log(`Dealt 4 damage to ${targetCard.name}`);
        }
        // Logic for drawing a card would go here
        console.log("Drew 1 card");
    }
}

export class SummonDemonCard extends AbstractCard {
    constructor() {
        super({
            name: "Summon Demon",
            description: "Summon a 5/5 Demon minion.",
            portraitName: "skull-bolt"
        });
    }

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            //ActionManager.getInstance().summonDemon({ target: targetCard, amount: 5 });
            console.log(`Summoned a 5/5 Demon minion`);
        }
    }
}
import { AbstractCard, PlayableCard } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";
import { AutomatedCharacter } from "../CharacterClasses";
import { ActionManager } from "../../utils/ActionManager";

export class FireballCard extends AbstractCard {
    constructor() {
        super({
            name: "Fireball",
            description: "Deal 6 damage to target enemy.",
            portraitName: "fire"
        });
    }

    IsPerformableOn = (targetCard: AbstractCard): boolean => {
        return targetCard instanceof AutomatedCharacter;
    }

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().dealDamage({ target: targetCard, amount: 6 });
            console.log(`Dealt 6 damage to ${targetCard.name}`);
        }
    }
}

export class ToxicCloudCard extends AbstractCard {
    constructor() {
        super({
            name: "Toxic Cloud",
            description: "Apply 3 Poison to all enemies.",
            portraitName: "smog-grenade"
        });
    }

    InvokeCardEffects = (targetCard?: AbstractCard): void => {
        if (targetCard && targetCard instanceof BaseCharacter) {
            //ActionManager.getInstance().applyPoison({ target: targetCard, amount: 3 });
            console.log(`Applied 3 Poison to ${targetCard.name}`);
        }
    }
}
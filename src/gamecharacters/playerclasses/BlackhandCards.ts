import { ActionManager } from "../../utils/ActionManager";
import { AbstractCard, PlayableCard } from "../AbstractCard";
import { BaseCharacter } from "../BaseCharacter";

export class FireballCard extends PlayableCard {
    constructor() {
        super({
            name: "Fireball",
            description: "Deal 6 damage to target enemy.",
            portraitName: "fire"
        });
    }

    override InvokeCardEffects (targetCard?: AbstractCard): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            ActionManager.getInstance().dealDamage({ target: targetCard, amount: 6 });
            console.log(`Dealt 6 damage to ${targetCard.name}`);
        }
    }
}

export class ToxicCloudCard extends PlayableCard {
    constructor() {
        super({
            name: "Toxic Cloud",
            description: "Apply 3 Poison to all enemies.",
            portraitName: "smog-grenade"
        });
    }

    override InvokeCardEffects (targetCard?: AbstractCard): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            //ActionManager.getInstance().applyPoison({ target: targetCard, amount: 3 });
            console.log(`Applied 3 Poison to ${targetCard.name}`);
        }
    }
}
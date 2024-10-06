// grant 5 block to the targeted character

import { CombatResource, GameState } from "../../../../rules/GameState";
import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { PlayableCard } from "../../../PlayableCard";


export class StormCloak extends PlayableCard {
    constructor() {
        super({
            name: "Storm Cloak",
            description: `_`,
            portraitName: "firewall",
            targetingType: TargetingType.ENEMY,
        });
        this.baseBlock = 5
        this.energyCost = 2;

        this.resourceScalings.push({
            resource: GameState.getInstance().combatState.combatResources.ice,
            blockScaling: 2
        })
    }


    override get description(): string {
        return `Grant ${this.getDisplayedBlock()} Block to the targeted character.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (targetCard && targetCard instanceof BaseCharacter) {
            this.applyBlockToTarget(targetCard);
        }
    }
}

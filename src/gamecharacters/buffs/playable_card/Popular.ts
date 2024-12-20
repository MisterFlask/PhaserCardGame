import { DamageInfo } from "../../../rules/DamageInfo";
import { GameState } from "../../../rules/GameState";
import { BaseCharacter } from "../../BaseCharacter";
import { IBaseCharacter } from "../../IBaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Popular extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Popular";
    }

    override getDescription(): string {
        return "When this character is attacked, all enemies redirect their intents to the attacker.";
    }

    override onOwnerStruck_CannotModifyDamage(strikingUnit: IBaseCharacter | null, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo) {
        const gameState = GameState.getInstance();
        const enemies = gameState.combatState.enemies;

        for (const enemy of enemies) {
            const intents = enemy.intents;
            for (const intent of intents) {
                if (intent.target) {
                    intent.target = strikingUnit as BaseCharacter;
                }
            }
        }
    }
}

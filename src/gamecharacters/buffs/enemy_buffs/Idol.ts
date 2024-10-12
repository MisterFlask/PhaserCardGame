import { DamageInfo } from "../../../rules/DamageInfo";
import { GameState } from "../../../rules/GameState";
import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";

export class Idol extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getName(): string {
        return "Idol";
    }

    override getDescription(): string {
        return `When this character is attacked, ALL enemy intents focus on the attacker.`;
    }

    override onOwnerStruck(strikingUnit: BaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: DamageInfo): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // Iterate through all enemies
        combatState.enemies.forEach(enemy => {
            if (enemy !== this.getOwnerAsCharacter()) {
                // Change all intents to target the striking unit
                enemy.intents.forEach(intent => {
                    intent.target = strikingUnit;
                });
            }
        });
    }
}

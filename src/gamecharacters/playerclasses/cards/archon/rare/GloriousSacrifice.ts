import { GameState } from "../../../../../rules/GameState";
import { ActionManagerFetcher } from "../../../../../utils/ActionManagerFetcher";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { Strong } from "../../../../buffs/standard/Strong";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class GloriousSacrifice extends PlayableCard {
    constructor() {
        super({
            name: "Glorious Sacrifice",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 1;
        this.baseDamage = 20;
        this.buffs.push(new Strong(2)); // This character gains 2 strength on startup
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        if (targetCard) {
            // Deal 20 damage to the target
            this.dealDamageToTarget(targetCard);

            combatState.enemies.forEach(enemy => {
                BasicProcs.getInstance().Taunt(enemy, this.owner!);
            });

            ActionManagerFetcher.getActionManager().applyBuffToCharacter(this.owner!,new Vulnerable(1));
        }
    }

    override get description(): string {
        return `STARTUP: This character gains 2 strength. ON PLAY: Deal ${this.getDisplayedDamage()} damage to a target. Taunt all enemies and apply 1 Vulnerable to self. Cost 1.`;
    }
}

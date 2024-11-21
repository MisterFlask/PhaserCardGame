import { GameState } from "../../../../../rules/GameState";
import { ActionManagerFetcher } from "../../../../../utils/ActionManagerFetcher";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { Vulnerable } from "../../../../buffs/standard/Vulnerable";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class DeathOrGlory extends PlayableCard {
    constructor() {
        super({
            name: "Death or Glory",
            cardType: CardType.ATTACK,
            targetingType: TargetingType.ENEMY,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new ExhaustBuff());
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        if (targetCard) {

            combatState.enemies.forEach(enemy => {
                BasicProcs.getInstance().Taunt(enemy, this.owner!);
            });

            ActionManagerFetcher.getActionManager().applyBuffToCharacterOrCard(this.owner!,new Vulnerable(1));
        }
    }

    override get description(): string {
        return `All characters gain 2 strength.  Taunt all enemies and apply 1 Vulnerable to self.`;
    }
}

import { ActionManagerFetcher } from "../../../../../utils/ActionManagerFetcher";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { Intimidation } from "../../../../buffs/standard/Intimidation";

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

        const gameState = this.gameState;
        this.actionManager.modifyCombatResource(gameState.combatState.combatResources.pluck, gameState.combatState.combatResources.pluck.value);
        ActionManagerFetcher.getActionManager().applyBuffToCharacterOrCard(this.owningCharacter!,new Intimidation(10));
    }

    override get description(): string {
        return `Gain 10 Intimidation.  Double your Pluck.`;
    }
}

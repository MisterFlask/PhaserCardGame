import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";
import { AbstractCard, TargetingType } from "../../AbstractCard";
import { EntityRarity, PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../AbstractBuff";

export class EarWorm extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "ear-worm"; // Replace with actual icon name if available
    }

    override getName(): string {
        return "Ear Worm";
    }

    override getDescription(): string {
        return `Retain. At the end of your turn, deal ${this.getStacksDisplayText()} damage. Damage increases by 1 each turn this remains in your hand.`;
    }

    override onInHandAtEndOfTurn(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner) {
            const actionManager = ActionManager.getInstance();
            const gameState = GameState.getInstance();
            const player = gameState.combatState.playerCharacters[0]; // Assuming single player character

            actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                sourceCharacter: undefined,
                target: player,
                fromAttack: false,
            });

            this.stacks++; // Increase damage for next turn
        }
    }
}

export class EarWormCard extends PlayableCard {
    constructor() {
        super({
            name: "Ear Worm",
            cardType: CardType.NON_PLAYABLE,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseDamage = 0;
        this.baseBlock = 0;
        this.baseMagicNumber = 1;
        this.baseEnergyCost = 1;
        this.buffs.push(new EarWorm(this.baseMagicNumber));
    }


    override get description(): string {
        return `Retain. At the end of your turn, take damage. Damage increases by 1 each turn this remains in your hand.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        // The card effect is handled by the buff, so we don't need to do anything here
    }
}

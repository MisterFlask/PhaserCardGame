import { GameState } from "../../../rules/GameState";
import { TargetingType } from "../../AbstractCard";
import { IBaseCharacter } from "../../IBaseCharacter";
import { EntityRarity, PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../AbstractBuff";
import { ExhaustBuff } from "../playable_card/ExhaustBuff";

export class MothGod extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getName(): string {
        return "Moth God";
    }

    override getDescription(): string {
        return `At the start of each turn, apply Eggs to ${this.getStacksDisplayText()} random card(s) in your draw pile.`;
    }

    override onTurnStart(): void {
        const gameState = GameState.getInstance();
        const drawPile = gameState.combatState.currentDrawPile;

        for (let i = 0; i < this.stacks; i++) {
            if (drawPile.length > 0) {
                const randomIndex = Math.floor(Math.random() * drawPile.length);
                const randomCard = drawPile[randomIndex];
                if (randomCard instanceof PlayableCard) {
                    this.actionManager.applyBuffToCard(randomCard, new EggsBuff());
                }
            }
        }
    }
}

class EggsBuff extends AbstractBuff {
    override getName(): string {
        return "Eggs";
    }

    override getDescription(): string {
        return "If this card is in your hand at the end of turn, it is exhausted and a Moth is added to your draw pile.";
    }
    override onInHandAtEndOfTurn(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner) {
            this.actionManager.exhaustCard(owner);
            const moth = new Moth();
            this.actionManager.createCardToDrawPile(moth);
        }
    }
}

class Moth extends PlayableCard {
    constructor() {
        super({
            name: "Moth",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 3;
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new Hazardous(4));
    }

    override get description(): string {
        return "At the end of turn, deal 4 damage to you. Exhaust.";
    }

    override InvokeCardEffects(): void {
        // The effects are handled by the buffs
    }
}

class Hazardous extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.stackable = true;
    }

    override getName(): string {
        return "Hazardous";
    }

    override getDescription(): string {
        return `At the end of turn, deal ${this.getStacksDisplayText()} damage to you.`;
    }

    override onInHandAtEndOfTurn(): void {
        const owner = this.getOwnerAsPlayableCard();
        if (owner) {
            this.actionManager.dealDamage({
                baseDamageAmount: this.stacks,
                target: owner.owner as IBaseCharacter,
                sourceCharacter: owner.owner,
                fromAttack: false,
                sourceCard: owner
            });
        }
    }
}

import { GameState } from "../../../rules/GameState";
import { TargetingType } from "../../AbstractCard";
import { EntityRarity } from "../../EntityRarity";
import { PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../AbstractBuff";
import { ExhaustBuff } from "../playable_card/ExhaustBuff";
import { Hazardous } from "../playable_card/Hazardous";

export class EggLayer extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Egg Layer";
    }

    override getDescription(): string {
        return `At the start of each turn, apply Eggs to ${this.getStacksDisplayText()} random card(s) in your draw pile.`;
    }

    override onTurnStart(): void {
        const gameState = GameState.getInstance();
        const drawPile = gameState.combatState.drawPile;

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

export class EggsBuff extends AbstractBuff {
    override getDisplayName(): string {
        return "Eggs";
    }

    override getDescription(): string {
        return "If this card is in your hand at the end of turn, it is exhausted and a Moth is added to your draw pile.  Removed if card is played.";
    }
    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            this.actionManager.exhaustCard(ownerCard);
            const moth = new Moth();
            moth.owningCharacter = ownerCard.owningCharacter;
            this.actionManager.createCardToDrawPile(moth);
        }
    }

    override onThisCardInvoked(): void {
        this.stacks = 0;
    }
}

export class Moth extends PlayableCard {
    constructor() {
        super({
            name: "Moth",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new Hazardous(4));
    }

    override get description(): string {
        return "";
    }

    override InvokeCardEffects(): void {
        // The effects are handled by the buffs
    }
}


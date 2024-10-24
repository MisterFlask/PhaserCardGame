import { DeckLogic, PileName } from "../../../../../rules/DeckLogic";
import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { Strong } from "../../../../buffs/standard/Strong";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class LastBastion extends PlayableCard {
    constructor() {
        super({
            name: "Last Bastion",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 2;
        this.baseBlock = 20;
        this.buffs.push(new ExhaustBuff());
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        // All party members gain 20 block
        combatState.playerCharacters.forEach(ally => {
            this.actionManager.applyBlock({
                baseBlockValue: this.baseBlock,
                blockTargetCharacter: ally
            });

            // Party members with >4 stress gain 2 Strength
            if (ally.stress > 4) {
                const strengthBuff = new Strong(2);
                ally.buffs.push(strengthBuff);
            }
        });

        // Exhaust the card
        DeckLogic.moveCardToPile(this, PileName.Exhaust);
        
        BasicProcs.getInstance().SacrificeACardOtherThan(this);
    }

    override get description(): string {
        return `All party members gain ${this.getDisplayedBlock()} block. Sacrifice. Party members with >4 stress gain 2 Strength.`;
    }
}

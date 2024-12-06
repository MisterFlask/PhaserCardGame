import { DeckLogic, PileName } from "../../../../../rules/DeckLogicHelper";
import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";

export class LastBastion extends PlayableCard {
    constructor() {
        super({
            name: "Last Bastion",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 2;
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
        });

        // Exhaust the card
        DeckLogic.moveCardToPile(this, PileName.Exhaust);

        this.actionManager.modifyMettle(1)
        
        BasicProcs.getInstance().SacrificeACardOtherThan(this);
    }

    override get description(): string {
        return `All party members gain ${this.getDisplayedBlock()} block. Gain 1 Mettle. Sacrifice.`;
    }
}

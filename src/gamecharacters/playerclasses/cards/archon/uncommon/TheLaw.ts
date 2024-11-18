import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { TakeCover } from "../tokens/TakeCover";

export class TheLaw extends PlayableCard {
    constructor() {
        super({
            name: "The Law",
            cardType: CardType.POWER,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.UNCOMMON,
        });
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.actionManager.applyBuffToCharacterOrCard(this.owner!, new TheLawBuff(1));
    }

    override get description(): string {
        return `At the beginning of each turn, add a Take Cover to your hand.`;
    }
}
class TheLawBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.stacks = stacks;
    }
    
    override getName(): string {
        return "The Law";
    }

    override getDescription(): string {
        return `At the beginning of each turn, add ${this.stacks} Take Cover to your hand.`;
    }

    override onTurnStart(): void {
        for (let i = 0; i < this.stacks; i++) {
            BasicProcs.getInstance().ManufactureCardToHand(new TakeCover().withOwner(this.getOwnerAsCharacter()!));
        }
    }
}

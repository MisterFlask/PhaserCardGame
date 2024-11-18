import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Pyronox extends PlayableCard {
    constructor() {
        super({
            name: "Pyronox",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.RARE,
        });
        this.baseMagicNumber = 3;
        this.energyCost = 1;
    }

    override get description(): string {
        return `Apply Flames Amplifier to ALL enemies. Flames Amplifier increases the damage dealt by Burning by ${this.getDisplayedMagicNumber()}.`;
    }

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new FlamesAmplifierBuff(this.getBaseMagicNumberAfterResourceScaling()), this.owner as BaseCharacter);
        });
    }
}

export class FlamesAmplifierBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.imageName = "flames-amplifier";
        this.stacks = stacks;
        this.stackable = true;
        this.isDebuff = true;
    }

    override getName(): string {
        return "Flames Amplifier";
    }

    override getDescription(): string {
        return `Increases the damage dealt by Burning by ${this.getStacksDisplayText()}.`;
    }
}

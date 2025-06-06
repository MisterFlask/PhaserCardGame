import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Pyronox extends PlayableCard {
    constructor() {
        super({
            name: "Pyronox",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseMagicNumber = 6;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Apply ${this.getDisplayedMagicNumber()} stacks of Flames Amplifier to ALL enemies.  Gain 1 Venture.`;
    };

    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        this.forEachEnemy(enemy => {
            this.actionManager.applyBuffToCharacterOrCard(enemy, new FlamesAmplifierBuff(this.getBaseMagicNumberAfterResourceScaling()), this.owningCharacter as BaseCharacter);
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

    override getDisplayName(): string {
        return "Flames Amplifier";
    }

    override getDescription(): string {
        return `This character takes ${this.getStacksDisplayText()} additional damage from Burning.`;
    }

    // no implementation needed; this is handled in the Burning debuff

}

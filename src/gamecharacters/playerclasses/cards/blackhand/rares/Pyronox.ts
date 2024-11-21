import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { Burning } from "../../../../buffs/standard/Burning";
import { EntityRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";

export class Pyronox extends PlayableCard {
    constructor() {
        super({
            name: "Pyronox",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseMagicNumber = 3;
        this.baseEnergyCost = 1;
    }

    override get description(): string {
        return `Apply ${this.getDisplayedMagicNumber()} stacks of Flames Amplifier to ALL enemies.`;
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
        return `If this character is Burning, they take ${this.getStacksDisplayText()} additional damage at start of turn.`;
    }

    override onTurnStart(): void {
        if (this.getOwnerAsCharacter() && this.getOwnerAsCharacter()?.hasBuff(new Burning().getName())) {
            this.actionManager.dealDamage({ baseDamageAmount: this.stacks, target: this.getOwnerAsCharacter()!});
        }
    }
}

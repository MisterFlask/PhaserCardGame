import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { EntityRarity } from "../../../EntityRarity";
import { PlayableCard } from "../../../PlayableCard";
import { CardType } from "../../../Primitives";
import { AbstractBuff } from "../../../buffs/AbstractBuff";
import { Ethereal } from "../../../buffs/playable_card/Ethereal";
import { Vulnerable } from "../../../buffs/standard/Vulnerable";

class JumpscareBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Jumpscare Effect";
    }

    override getDescription(): string {
        return "When drawn, apply 1 Vulnerable to a random ally.";
    }

    override onCardDrawn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (!ownerCard) return;
        
        ownerCard.performActionOnRandomAlly((ally: BaseCharacter) => {
            this.actionManager.applyBuffToCharacterOrCard(ally, new Vulnerable(ownerCard.getBaseMagicNumberAfterResourceScaling()));
        });
    }
}

export class Jumpscare extends PlayableCard {
    constructor() {
        super({
            name: "Jumpscare",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.baseMagicNumber = 1;
        this.buffs.push(new Ethereal());
        this.buffs.push(new JumpscareBuff());
    }

    override InvokeCardEffects(): void {
        // The effect happens when drawn via JumpscareBuff
    }

    override get description(): string {
        return `When drawn, apply ${this.getDisplayedMagicNumber()} Vulnerable to a random ally. Transient.`;
    }
}


import { TargetingType } from "../../../gamecharacters/AbstractCard";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { Vulnerable } from "../../../gamecharacters/buffs/standard/Vulnerable";
import { Weak } from "../../../gamecharacters/buffs/standard/Weak";

export class ChairmanVizzerix extends PlayableCard {
    constructor() {
        super({
            name: "Chairman Vizzerix",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
        this.baseBlock = 15;
        this.portraitName = "cursed_cargo_2";
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} block to any target.  Drawn: Apply 2 Vulnerable and 2 Weak to a random ally.`;
    }
    
    override InvokeCardEffects(targetCard?: BaseCharacter): void {
        if (!targetCard) return;
        this.actionManager.applyBlock({
            baseBlockValue: this.getBaseBlockAfterResourceScaling(),
            blockSourceCharacter: undefined,
            blockTargetCharacter: targetCard,
        });
    }
    
    
}

class ChairmanVizzerixDrawnBuff extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.moveToMainDescription = true;
    }

    override getDisplayName(): string {
        return "Chairman Vizzerix Drawn";
    }

    override getDescription(): string {
        return "Drawn: Apply 2 Vulnerable and 2 Weak to a random ally.";
    }

    override onCardDrawn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (!ownerCard) return;
            ownerCard.performActionOnRandomAlly((ally) => {
            this.actionManager.applyBuffToCharacter(ally, new Vulnerable(2));
            this.actionManager.applyBuffToCharacter(ally, new Weak(2));
        });
    }


}

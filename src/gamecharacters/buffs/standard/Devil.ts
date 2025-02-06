import { PileName } from "../../../rules/DeckLogicHelper";
import { TargetingType } from "../../AbstractCard";
import { EntityRarity } from "../../EntityRarity";
import { PlayableCard } from "../../PlayableCard";
import { CardType } from "../../Primitives";
import { AbstractBuff } from "../AbstractBuff";
import { ExhaustBuff } from "../playable_card/ExhaustBuff";
import { Hazardous } from "../playable_card/Hazardous";
import { Unstable } from "../playable_card/Unstable";

export class Devil extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "devil"; // Replace with actual icon name if available
        this.stackable = true;
        this.isDebuff = false;
        this.stacks = stacks;
    }

    override getDisplayName(): string {
        return "Devil";
    }

    override getDescription(): string {
        return `When hit, shuffle a Smoldering into your draw pile that deals ${this.getStacksDisplayText()} damage to you at end of turn and exhausts.`;
    }

    override onOwnerStruck_CannotModifyDamage(): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;

        // Create a Smoldering card with damage equal to stacks
        const smoldering = new SmolderingCard(this.stacks);
        this.actionManager.moveCardToPile(smoldering, PileName.Draw);
    }
}

class SmolderingCard extends PlayableCard {
    constructor(damageAmount: number) {
        super({
            name: "Smoldering",
            cardType: CardType.STATUS,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.COMMON,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new Unstable());
        this.buffs.push(new ExhaustBuff());
        this.buffs.push(new Hazardous(damageAmount));
    }

    override get description(): string {
        return ''
    }

    override InvokeCardEffects(): void {
        // Do nothing
    }
}

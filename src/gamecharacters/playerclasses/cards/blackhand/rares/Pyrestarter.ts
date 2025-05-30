import { ActionManager } from "../../../../../utils/ActionManager";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { Burning } from "../../../../buffs/standard/Burning";
import { IBaseCharacter } from "../../../../IBaseCharacter";
import { PlayableCard } from "../../../../PlayableCard";

export class Pyrestarter extends PlayableCard {
    constructor() {
        super({
            name: "Pyrestarter",
            description: `_`,
            portraitName: "fire-starter",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.baseBlock = 6;
        this.baseMagicNumber = 3;
        this.baseEnergyCost = 2;
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} block to ALL party members.  Discard 2 cards.`;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        this.forEachAlly(ally => {
            this.applyBlockToTarget(ally);
        });
        this.actionManager.chooseCardToDiscard(1,2, true);
    }
}

export class PyrestarterBuff extends AbstractBuff {
    constructor(burningStacks: number) {
        super();
        this.imageName = "fire-starter";
        this.stacks = burningStacks;
        this.stackable = false;
    }

    override getDisplayName(): string {
        return "Pyrestarter Effect";
    }

    override getDescription(): string {
        return `Attacks apply ${this.getStacksDisplayText()} Burning. Removed at end of turn.`;
    }

    override onOwnerStriking_CannotModifyDamage(struckUnit: IBaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: any): void {
        if (struckUnit.team !== this.getOwnerAsCharacter()?.team) {
            
                ActionManager.getInstance().applyBuffToCharacterOrCard(
                    struckUnit as BaseCharacter,
                    new Burning(this.stacks),
                    this.getOwnerAsCharacter()!
                );
        }
    }

    override onTurnEnd(): void {
        this.stacks = 0;
    }
}

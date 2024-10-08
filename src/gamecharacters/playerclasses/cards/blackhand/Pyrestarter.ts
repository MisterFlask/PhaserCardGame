import { TargetingType } from "../../../AbstractCard";
import { BaseCharacter } from "../../../BaseCharacter";
import { Burning } from "../../../buffs/standard/Burning";
import { PlayableCard } from "../../../PlayableCard";
import { AbstractBuff } from "../../../buffs/AbstractBuff";
import { IBaseCharacter } from "../../../IBaseCharacter";
import { ActionManager } from "../../../../utils/ActionManager";

export class Pyrestarter extends PlayableCard {
    constructor() {
        super({
            name: "Pyrestarter",
            description: `_`,
            portraitName: "fire-starter",
            targetingType: TargetingType.NO_TARGETING,
        });
        this.baseBlock = 5;
        this.baseMagicNumber = 2;
        this.energyCost = 1;
    }

    override get description(): string {
        return `Apply ${this.getDisplayedBlock()} block to ALL party members. The rest of this turn, attacks from your party apply ${this.getDisplayedMagicNumber()} Burning per hit.`;
    }

    override InvokeCardEffects(): void {
        this.forEachAlly(ally => {
            this.applyBlockToTarget(ally);
            this.actionManager.applyBuffToCharacter(ally, new PyrestarterBuff(this.getBaseMagicNumberAfterResourceScaling()));
        });
    }
}

export class PyrestarterBuff extends AbstractBuff {
    constructor(burningStacks: number) {
        super();
        this.imageName = "fire-starter";
        this.stacks = burningStacks;
        this.stackable = false;
    }

    override getName(): string {
        return "Pyrestarter Effect";
    }

    override getDescription(): string {
        return `Attacks apply ${this.getStacksDisplayText()} Burning. Removed at end of turn.`;
    }

    override onOwnerStriking(struckUnit: IBaseCharacter, cardPlayedIfAny: PlayableCard | null, damageInfo: any): void {
        if (struckUnit.team !== this.getOwnerAsCharacter()?.team) {
            
                ActionManager.getInstance().applyBuffToCharacter(
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
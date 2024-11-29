import { GameState } from '../../../rules/GameState';
import { ActionManager } from '../../../utils/ActionManager';
import { IBaseCharacter } from '../../IBaseCharacter';
import { AbstractBuff } from '../AbstractBuff';
import { Burning } from './Burning';

export class ExplosiveFinishCardBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.imageName = "explosive-finish";
        this.stacks = stacks;
        this.stackable = false;
    }

    override getDisplayName(): string {
        return "Explosive Finish";
    }

    override getDescription(): string {
        return `On Fatal: Applies ${this.getStacksDisplayText()} Burning to all enemies.`;
    }

    override onFatal(killedUnit: IBaseCharacter): void {
        GameState.getInstance().combatState.enemies.forEach(enemy => {
            ActionManager.getInstance().applyBuffToCharacterOrCard(enemy, new Burning(this.stacks), this.getOwnerAsCharacter()!);
        });
    }
}

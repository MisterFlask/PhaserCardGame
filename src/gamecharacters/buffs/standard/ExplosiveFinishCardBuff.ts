import { AbstractBuff } from '../AbstractBuff';
import { IBaseCharacter } from '../../IBaseCharacter';
import { Burning } from './Burning';
import { ActionManager } from '../../../utils/ActionManager';
import { GameState } from '../../../rules/GameState';

export class ExplosiveFinishCardBuff extends AbstractBuff {
    constructor(stacks: number) {
        super();
        this.imageName = "explosive-finish";
        this.stacks = stacks;
        this.stackable = false;
    }

    override getName(): string {
        return "Explosive Finish";
    }

    override getDescription(): string {
        return `On Fatal: Applies ${this.getStacksDisplayText()} Burning to all enemies.`;
    }

    override onFatal(killedUnit: IBaseCharacter): void {
        GameState.getInstance().combatState.enemies.forEach(enemy => {
            ActionManager.getInstance().applyBuffToCharacter(enemy, new Burning(this.stacks), this.getOwnerAsCharacter()!);
        });
    }
}

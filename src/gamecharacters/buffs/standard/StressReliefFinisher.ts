import { AbstractBuff } from '../AbstractBuff';
import { IBaseCharacter } from '../../IBaseCharacter';
import { GameState } from '../../../rules/GameState';
import { ActionManager } from '../../../utils/ActionManager';
import { Stress } from './Stress';

export class StressReliefFinisher extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "stress-relief-finisher";
        this.stackable = true;
        this.stacks = 1;
    }

    override getName(): string {
        return "Stress Relief Finisher";
    }

    override getDescription(): string {
        return `Whenever this kills an enemy, the whole party heals ${this.getStacksDisplayText()} stress.`;
    }

    override onFatal(killedUnit: IBaseCharacter): void {
        const gameState = GameState.getInstance();
        gameState.combatState.playerCharacters.forEach(ally => {
            ActionManager.getInstance().removeBuffFromCharacter(ally, new Stress(1).getName(), this.stacks);
        });
    }
}

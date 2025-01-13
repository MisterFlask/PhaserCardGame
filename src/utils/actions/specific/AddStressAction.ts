import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { Stress } from "../../../gamecharacters/buffs/standard/Stress";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";

export class AddStressAction extends GameAction {
    constructor(
        private character: BaseCharacter, 
        private amount: number
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const actionManager = ActionManager.getInstance();
        const stressBuff = new Stress(this.amount);
        
        actionManager.applyBuffToCharacter(this.character, stressBuff);
        console.log(`Added ${this.amount} Stress to ${this.character.name}`);

        return [];
    }
} 
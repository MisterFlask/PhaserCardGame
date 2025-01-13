import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { Stress } from "../../../gamecharacters/buffs/standard/Stress";
import { ActionManager } from "../../ActionManager";
import { GameAction } from "../GameAction";

export class RelieveStressAction extends GameAction {
    constructor(
        private character: BaseCharacter, 
        private amount: number
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        const actionManager = ActionManager.getInstance();
        const reliefBuff = new Stress(this.amount);
        
        actionManager.removeBuffFromCharacter(
            this.character, 
            reliefBuff.getDisplayName(), 
            this.amount
        );
        
        console.log(`Relieved ${this.amount} Stress from ${this.character.name}`);

        return [];
    }
} 
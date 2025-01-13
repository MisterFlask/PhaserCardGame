import { GameAction } from "./GameAction";
export class GenericAction extends GameAction {
    constructor(private actionFunction: () => Promise<GameAction[]>) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        return await this.actionFunction();
    }
} 
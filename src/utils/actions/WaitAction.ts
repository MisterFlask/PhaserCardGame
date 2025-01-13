import { GameAction } from "./GameAction";

export class WaitAction extends GameAction {
    constructor(private milliseconds: number) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        await new Promise(resolve => setTimeout(resolve, this.milliseconds));
        return [];
    }
} 
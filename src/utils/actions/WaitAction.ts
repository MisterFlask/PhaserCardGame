import { backgroundResistantDelay } from "../BackgroundResistantDelay";
import { GameAction } from "./GameAction";

export class WaitAction extends GameAction {
    constructor(private milliseconds: number) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        await backgroundResistantDelay(this.milliseconds);
        return [];
    }
}
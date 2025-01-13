import { SubtitleManager } from "../../../ui/SubtitleManager";
import { GameAction } from "../GameAction";
import { WaitAction } from "../WaitAction";

export class DisplaySubtitleAction extends GameAction {
    constructor(
        private text: string, 
        private durationMs: number = 1000
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        await SubtitleManager.getInstance().showSubtitle(this.text);
        
        // Wait for the specified duration
        await new WaitAction(this.durationMs).playAction();
        
        await SubtitleManager.getInstance().hideSubtitle();
        
        return [];
    }
} 
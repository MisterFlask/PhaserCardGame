import { ActionManager } from "../utils/ActionManager";

export abstract class AbstractIntent {
    id: string;
    tooltipText: string;
    displayText: string;
    imageName: string;

    constructor(id: string, tooltipText: string, displayText: string, imageName: string) {
        this.id = id;
        this.tooltipText = tooltipText;
        this.displayText = displayText;
        this.imageName = imageName;
    }

    abstract act(actionManager: ActionManager): void;
}
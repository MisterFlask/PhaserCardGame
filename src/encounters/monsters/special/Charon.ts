import { AbstractChoice, AbstractEvent } from "../../../events/AbstractEvent";
import { AbstractIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";

export class Charon extends AutomatedCharacter {
    
    constructor() {
        super({ 
            name: 'Charon', 
            portraitName: 'Boss Harbinger', 
            maxHitpoints: 200, 
            description: 'Think of him as a large, ominous friend.' 
        });
        this.portraitTargetLargestDimension = 600;
        this.portraitOffsetXOverride = -100
        this.portraitOffsetYOverride = 0
    }

    override generateNewIntents(): AbstractIntent[] {
        return []; 
    }

    override onClickLaunchEvent(): AbstractEvent | null {
        return new MoveToNextActEvent();
    }
}

export class MoveToNextActChoice extends AbstractChoice {
    constructor() {
        super("Move to Next Act");
        this.nextEvent = null;
    }

    override canChoose(): boolean {
        return true;
    }

    override effect(): void {
        // TODO: Implement
    }
}

export class MoveToNextActEvent extends AbstractEvent {
    constructor() {
        super();
        this.description = "Move to the next act";
        this.name = "Move to Next Act";
        this.choices = [new MoveToNextActChoice()];
    }
}

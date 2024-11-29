import { AbstractIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";

export class Charon extends AutomatedCharacter {
    
    constructor() {
        super({ 
            name: 'Charon', 
            portraitName: 'Boss Harbinger', 
            maxHitpoints: 200, 
            description: 'Incur a debt of 100 Denarians for passage, payable on departure from Hell.' 
        });
        this.portraitTargetLargestDimension = 600;
        this.portraitOffsetXOverride = -100
        this.portraitOffsetYOverride = 0
    }

    override generateNewIntents(): AbstractIntent[] {
        return []; 
    }
}

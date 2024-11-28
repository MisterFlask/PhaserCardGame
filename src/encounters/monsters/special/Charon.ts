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
    }

    override generateNewIntents(): AbstractIntent[] {
        return []; 
    }
}

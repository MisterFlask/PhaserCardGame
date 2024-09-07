import { ActionManager } from "../utils/ActionManager";
import { BaseCharacter } from "./BaseCharacter";

export abstract class AbstractIntent {
    id: string;
    tooltipText: string;
    displayText: string;
    imageName: string;
    target: BaseCharacter;
    constructor({id, tooltipText, displayText, imageName, target}: {id: string, tooltipText: string, displayText: string, imageName: string, target: BaseCharacter}) {
        this.id = id;
        this.tooltipText = tooltipText;
        this.displayText = displayText;
        this.imageName = imageName;
        this.target = target;
    }

    abstract act(): void;
}


export class AttackIntent extends AbstractIntent {
    damage: number;
    constructor(target: BaseCharacter, damage: number) {
        super({id: 'Attack', tooltipText: 'Attacking for ' + damage + ' damage', displayText: damage.toString(), imageName: 'attack', target: target});
        this.damage = damage;
    }

    act(): void {
        console.log('Attacking ' + this.target.name);
        ActionManager.getInstance().dealDamage({amount: this.damage, target: this.target});
    }
}


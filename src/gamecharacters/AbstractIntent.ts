import { ActionManager } from "../utils/ActionManager";
import { TargetingUtils } from "../utils/TargetingUtils";
import { BaseCharacter } from "./BaseCharacter";

export abstract class AbstractIntent {
    id: string;
    tooltipText: string;
    displayText: string;
    imageName: string;
    target?: BaseCharacter;
    owner: BaseCharacter;
    constructor({ id, tooltipText, displayText, imageName, target, owner }: { id: string, tooltipText: string, displayText: string, imageName: string, target: BaseCharacter | undefined, owner: BaseCharacter }) {
        this.id = id;
        this.tooltipText = tooltipText;
        this.displayText = displayText;
        this.imageName = imageName;
        this.target = target;
        this.owner = owner;
    }

    abstract act(): void;
}


export class AttackIntent extends AbstractIntent {
    damage: number;
    constructor({ target, damage, owner }: { target?: BaseCharacter | undefined, damage: number, owner: BaseCharacter }) {
        super({ id: 'Attack', tooltipText: 'Attacking for ' + damage + ' damage', displayText: damage.toString(), imageName: 'knife-thrust', target: target, owner: owner });
        this.damage = damage;
        if (!this.target) {
            this.target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
        }
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        console.log('Attacking ' + this.target.name);
        ActionManager.getInstance().dealDamage({ amount: this.damage, target: this.target, sourceCharacter: this.owner });

    }
}


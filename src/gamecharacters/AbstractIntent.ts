import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { ActionManager } from "../utils/ActionManager";
import { TargetingUtils } from "../utils/TargetingUtils";
import { generateWordGuid } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";

export abstract class AbstractIntent implements JsonRepresentable {
    id: string;
    tooltipText: string;
    displayText: string;
    imageName: string;
    target?: BaseCharacter;
    owner: BaseCharacter;
    constructor({tooltipText, displayText, imageName, target, owner }: { tooltipText: string, displayText: string, imageName: string, target: BaseCharacter | undefined, owner: BaseCharacter }) {
        this.id = generateWordGuid();
        this.tooltipText = tooltipText;
        this.displayText = displayText;
        this.imageName = imageName;
        this.target = target;
        this.owner = owner;
    }

    abstract act(): void;

    createJsonRepresentation(): string {
        return JSON.stringify({
            className: this.constructor.name,
            id: this.id,
            tooltipText: this.tooltipText,
            displayText: this.displayText,
            imageName: this.imageName,
            target: this.target ? this.target.name : 'No target',
            owner: this.owner.name,
        }, null, 2);
    }
}


export class AttackIntent extends AbstractIntent {
    damage: number;
    constructor({ target, damage, owner }: { target?: BaseCharacter | undefined, damage: number, owner: BaseCharacter }) {
        super({  tooltipText: 'Attacking for ' + damage + ' damage', displayText: damage.toString(), imageName: 'knife-thrust', target: target, owner: owner });
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

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            damage: this.damage,
        }, null, 2);
    }
}


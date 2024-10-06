import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { CombatRules } from '../rules/CombatRules';
import { ActionManager } from "../utils/ActionManager";
import { TargetingUtils } from "../utils/TargetingUtils";
import { generateWordGuid } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";

export abstract class AbstractIntent implements JsonRepresentable {
    id: string;
    imageName: string;
    target?: BaseCharacter;
    owner: BaseCharacter;
    constructor({imageName, target, owner }: {imageName: string, target: BaseCharacter | undefined, owner: BaseCharacter }) {
        this.imageName = imageName;
        this.target = target;
        this.owner = owner;
        this.id = generateWordGuid(this.displayText());
    }

    abstract tooltipText(): string;
    abstract displayText(): string;

    abstract act(): void;

    createJsonRepresentation(): string {
        return JSON.stringify({
            className: this.constructor.name,
            id: this.id,
            imageName: this.imageName,
            target: this.target ? this.target.name : 'No target',
            owner: this.owner.name,
        }, null, 2);
    }
}


export class AttackIntent extends AbstractIntent {
    baseDamage: number;
    constructor({ target, baseDamage, owner }: { target?: BaseCharacter | undefined, baseDamage: number, owner: BaseCharacter }) {
        super({ imageName: 'knife-thrust', target: target, owner: owner });
        this.baseDamage = baseDamage;
        if (!this.target) {
            this.target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
        }
    }

    tooltipText(): string {
        return 'Attacking for ' + this.displayedDamage() + ' damage';
    }

    displayText(): string {
        return this.displayedDamage().toString();
    }

    displayedDamage(): number {
        return CombatRules.calculateDamage({ baseDamageAmount: this.baseDamage, target: this.target!, sourceCharacter: this.owner, sourceCard: undefined, fromAttack: true }).totalDamage;
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        console.log('Attacking ' + this.target.name);
        ActionManager.getInstance().dealDamage({ baseDamageAmount: this.baseDamage, target: this.target, sourceCharacter: this.owner });

    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            damage: this.baseDamage,
        }, null, 2);
    }
}


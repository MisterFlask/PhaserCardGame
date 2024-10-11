import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { CombatRules } from '../rules/CombatRules';
import { GameState } from '../rules/GameState';
import { PhysicalCard } from '../ui/PhysicalCard';
import { ActionManager } from "../utils/ActionManager";
import { TargetingUtils } from "../utils/TargetingUtils";
import { generateWordGuid } from "./AbstractCard";
import { BaseCharacter } from "./BaseCharacter";
import { AbstractBuff } from './buffs/AbstractBuff';

export abstract class AbstractIntent implements JsonRepresentable {
    id: string;
    imageName: string;
    target?: BaseCharacter;
    owner: BaseCharacter;
    title: string;

    constructor({imageName, target, owner }: {imageName: string, target: BaseCharacter | undefined, owner: BaseCharacter }) {
        this.imageName = imageName;
        this.target = target;
        this.owner = owner;
        this.id = generateWordGuid(this.displayText());
        this.title = '';
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

    withTitle(title: string): this {
        this.title = title;
        return this;
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
        ActionManager.getInstance().tiltCharacter(this.owner);

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

export class ApplyDebuffToAllPlayerCharactersIntent extends AbstractIntent {
    debuff: AbstractBuff;

    constructor({ debuff, owner }: { debuff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'chemical-bolt', target: undefined, owner: owner });
        this.debuff = debuff;
    }

    tooltipText(): string {
        return `Applying ${this.debuff.getName()} to a random player`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        console.log(`Applying ${this.debuff.stacks} stack(s) of ${this.debuff.getName()} to ${this.target.name}`);
        for (const target of TargetingUtils.getInstance().selectAllPlayerCharacters()) {
            ActionManager.getInstance().tiltCharacter(this.owner);
            ActionManager.getInstance().applyBuffToCharacter(target, this.debuff);
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.debuff.getName(),
            stacks: this.debuff.stacks,
        }, null, 2);
    }
}

export class ApplyDebuffToRandomCharacterIntent extends AbstractIntent {
    debuff: AbstractBuff;

    constructor({ debuff, owner }: { debuff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'poison-bottle-2', target: undefined, owner: owner });
        this.debuff = debuff;
        this.target = TargetingUtils.getInstance().selectRandomPlayerCharacter();
    }

    tooltipText(): string {
        return `Applying ${this.debuff.getName()} to a random player`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        ActionManager.getInstance().tiltCharacter(this.owner);

        console.log(`Applying ${this.debuff.stacks} stack(s) of ${this.debuff.getName()} to ${this.target.name}`);
        ActionManager.getInstance().applyBuffToCharacter(this.target, this.debuff);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.debuff.getName(),
            stacks: this.debuff.stacks,
        }, null, 2);
    }
}

export class ApplyBuffToSelfIntent extends AbstractIntent {
    buff: AbstractBuff;

    constructor({ buff: buff, owner }: { buff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'magick-trick', target: undefined, owner: owner });
        this.buff = buff;
    }

    tooltipText(): string {
        return `Applying ${this.buff.getName()} to self`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner);
        console.log(`Applying ${this.buff.stacks} stack(s) of ${this.buff.getName()} to allies`);
        ActionManager.getInstance().applyBuffToCharacter(this.owner, this.buff);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.buff.getName(),
            stacks: this.buff.stacks,
        }, null, 2);
    }
}

export class IntentListCreator {
    static selectRandomIntents(intentLists: AbstractIntent[][]): AbstractIntent[] {
        if (intentLists.length === 0) {
            return [];
        }
        const randomIndex = Math.floor(Math.random() * intentLists.length);
        return intentLists[randomIndex];
    }

    static iterateIntents(intentLists: AbstractIntent[][]): AbstractIntent[] {
        if (intentLists.length === 0) {
            return [];
        }
        
        const gameState = GameState.getInstance();
        const currentTurn = gameState.combatState.currentTurn;
        
        const index = currentTurn % intentLists.length;
        return intentLists[index];
    }

    static iterateIntentsWithRepeatingLastElement(intentLists: AbstractIntent[][]): AbstractIntent[] {
        if (intentLists.length === 0) {
            return [];
        }
        
        const gameState = GameState.getInstance();
        const currentTurn = gameState.combatState.currentTurn;
        
        if (currentTurn < intentLists.length) {
            return intentLists[currentTurn];
        } else {
            return intentLists[intentLists.length - 1];
        }
    }
}




export class DoSomethingIntent extends AbstractIntent {
    action: () => void;
    constructor({ owner, action, imageName }: { owner: BaseCharacter, action: () => void, imageName?: string }) {
        super({ imageName: imageName ?? 'uncertainty', target: undefined, owner: owner });
        ActionManager.getInstance().animateAttackerTilt(owner.physicalCard as PhysicalCard);
        this.action = action;
    }

    tooltipText(): string {
        return `This character is gonna do something!`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        this.action();
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
        }, null, 2);
    }
}


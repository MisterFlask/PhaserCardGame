import { JsonRepresentable } from '../interfaces/JsonRepresentable';
import { CombatRules } from '../rules/CombatRulesHelper';
import { GameState } from '../rules/GameState';
import { PhysicalCard } from '../ui/PhysicalCard';
import { ActionManager } from "../utils/ActionManager";
import ImageUtils from '../utils/ImageUtils';
import { TargetingUtils } from "../utils/TargetingUtils";
import { AbstractCard, generateWordGuid } from "./AbstractCard";
import type { AutomatedCharacter } from './AutomatedCharacter';
import type { BaseCharacter } from "./BaseCharacter";
import type { AbstractBuff } from './buffs/AbstractBuff';
import type { PlayableCard } from './PlayableCard';

export abstract class AbstractIntent implements JsonRepresentable {
    id: string;
    imageName: string;
    target?: BaseCharacter;
    owner?: BaseCharacter;
    title: string;
    targetsAllPlayers: boolean = false;
    iconTint: number = 0xffffff;

    constructor({imageName, target, owner }: {imageName: string, target: BaseCharacter | undefined, owner?: BaseCharacter }) {
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
            owner: this.owner?.name,
        }, null, 2);
    }

    withTitle(title: string): this {
        this.title = title;
        return this;
    }

    public generateSeededRandomColor(): number | undefined {
        if (!this.isUsingPlaceholderImage()) {
            return undefined;
        }
        let hash = 0;
        for (let i = 0; i < this.imageName.length; i++) {
            const char = this.imageName.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }

        const r = (hash & 255);
        const g = ((hash >> 8) & 255);
        const b = ((hash >> 16) & 255);

        return (r << 16) | (g << 8) | b;
    }


    public isUsingPlaceholderImage(): boolean {
        return !this.imageName || !ActionManager.getInstance().scene.textures.exists(this.imageName);
    }

    public getImageNameOrPlaceholderIfNoneExists(): string {
        // Check if the image exists in the texture cache
        const scene = ActionManager.getInstance().scene
        if (!scene) {
            throw new Error('Scene not set; probably you changed scenes and messed up handling deletion of old actions.');
        }
        if (this.isUsingPlaceholderImage()) {
            var placeholder = ImageUtils.getDeterministicAbstractPlaceholder(this.imageName);
            return placeholder;
        }
        return this.imageName;
    }
}

export class CosmeticCharacterBuffIntent extends AbstractIntent {
    tooltipText(): string {
        return "Incoming damage from buff: " + this.buff.getDisplayName();
    }
    displayText(): string {
        return this.damage?.toString();
    }
    act(): void {
        // no op intentionally because this handled by card buff
    }

    damage: number;
    buff: AbstractBuff;
    constructor({ buff, target, damage }: { buff: AbstractBuff, target: BaseCharacter, damage: number }) {
        super({ imageName: 'uncertainty', target: target, owner: undefined });
        this.buff = buff;
        if (!buff) {
            throw new Error('Buff cannot be null');
        }
        this.damage = damage;
        this.id = buff.id + '-' + target.id;
    }
}

export class CosmeticPlayableCardIntent extends AbstractIntent {
    tooltipText(): string {
        return "Incoming damage from your card: " + this.playableCard.name;
    }
    displayText(): string {
        return this.damage.toString();
    }
    act(): void {
        // no op intentionally because this handled by card buff
    }

    damage: number;
    playableCard: PlayableCard;
    constructor({ playableCard, target, damage }: { playableCard: PlayableCard, target: BaseCharacter, damage: number }) {
        super({ imageName: 'uncertainty', target: target, owner: undefined });
        this.playableCard = playableCard;
        this.damage = damage;
        this.id = playableCard.id + '-' + target.id;
    }
}

export class SummonIntent extends AbstractIntent {
    monsterToSummon: AutomatedCharacter;

    constructor({ monsterToSummon, owner }: { monsterToSummon: AutomatedCharacter, owner: BaseCharacter }) {
        super({ imageName: 'pentacle-intent', target: undefined, owner: owner });
        this.monsterToSummon = monsterToSummon;
    }

    tooltipText(): string {
        return `Summon ${this.monsterToSummon.name}`;
    }

    displayText(): string {
        return "";
    }

    act(): void {
        console.log(`Summoning ${this.monsterToSummon.name}`);
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        ActionManager.getInstance().addMonsterToCombat(this.monsterToSummon);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            monsterToSummon: this.monsterToSummon.name,
        }, null, 2);
    }
}

export class AddCardToPileIntent extends AbstractIntent {
    cardToAdd: PlayableCard;
    pileName: 'draw' | 'discard' | 'hand';

    constructor({ cardToAdd, pileName, owner }: { cardToAdd: PlayableCard, pileName: 'draw' | 'discard' | 'hand', owner: BaseCharacter }) {
        super({ imageName: 'card-plus', target: undefined, owner: owner });
        this.cardToAdd = cardToAdd;
        this.pileName = pileName;
    }

    tooltipText(): string {
        return `Add ${this.cardToAdd.name} to ${this.pileName} pile`;
    }

    displayText(): string {
        return "";
    }

    act(): void {
        console.log(`Adding ${this.cardToAdd.name} to ${this.pileName} pile`);
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;

        switch (this.pileName) {
            case 'draw':
                combatState.drawPile.push(this.cardToAdd);
                break;
            case 'discard':
                combatState.currentDiscardPile.push(this.cardToAdd);
                break;
            case 'hand':
                combatState.currentHand.push(this.cardToAdd);
                break;
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            cardToAdd: this.cardToAdd.name,
            pileName: this.pileName,
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
        return 'Attacking for ' + this.displayedDamage() + ' damage.  (base damage before modifiers was ' + this.baseDamage + ")";
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
        ActionManager.getInstance().tiltCharacter(this.owner!);

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

export class TagCardsIntent extends AbstractIntent {
    buffs: AbstractBuff[];
    numCardsToTag: number;
    pileToTagFrom: 'draw' | 'discard';

    constructor({ buffs, numCardsToTag, pileToTagFrom, owner }: { buffs: AbstractBuff[], numCardsToTag: number, pileToTagFrom: 'draw' | 'discard', owner: BaseCharacter }) {
        super({ imageName: 'tag', target: undefined, owner: owner });
        this.buffs = buffs;
        this.numCardsToTag = numCardsToTag;
        this.pileToTagFrom = pileToTagFrom;
    }

    tooltipText(): string {
        const buffNames = this.buffs.map(buff => buff.getDisplayName()).join(', ');
        return `Tag ${this.numCardsToTag} random card${this.numCardsToTag > 1 ? 's' : ''} in the ${this.pileToTagFrom} pile with ${buffNames}`;
    }

    displayText(): string {
        return `Tag ${this.numCardsToTag}`;
    }

    act(): void {
        console.log(`Tagging ${this.numCardsToTag} cards in the ${this.pileToTagFrom} pile`);
        const gameState = GameState.getInstance();
        const pile = this.pileToTagFrom === 'draw' ? gameState.combatState.drawPile : gameState.combatState.currentDiscardPile;
        
        // Shallow clone the pile to avoid modifying the original
        const clonedPile = [...pile];
        // Shuffle the pile to ensure randomness
        const cardsToTag = TargetingUtils.getInstance().selectRandomCardsFromPile(clonedPile as AbstractCard[], this.numCardsToTag);
        
        console.log(`Tagging ${cardsToTag.length} cards from the ${this.pileToTagFrom} pile`);
        
        for (const card of cardsToTag) {
            for (const buff of this.buffs) {
                ActionManager.getInstance().applyBuffToCard(card as PlayableCard, buff);
            }
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            buffs: this.buffs.map(buff => buff.getDisplayName()),
            numCardsToTag: this.numCardsToTag,
            pileToTagFrom: this.pileToTagFrom,
        }, null, 2);
    }
}


export class AttackAllPlayerCharactersIntent extends AbstractIntent {
    baseDamage: number;

    constructor({ baseDamage, owner }: { baseDamage: number, owner: BaseCharacter }) {
        super({ imageName: 'sword-array', target: undefined, owner: owner });
        this.baseDamage = baseDamage;
        this.iconTint = 0xff0000;
        this.targetsAllPlayers = true;
    }

    tooltipText(): string {
        return `Attacking all allies for ${this.displayedDamage()} damage`;
    }

    displayText(): string {
        return this.displayedDamage().toString();
    }

    displayedDamage(): number {
        const randomTarget = TargetingUtils.getInstance().selectRandomPlayerCharacter();
        return CombatRules.calculateDamage({ baseDamageAmount: this.baseDamage, target: randomTarget, sourceCharacter: this.owner, sourceCard: undefined, fromAttack: true }).totalDamage;
    }

    act(): void {
        console.log('Attacking all allied characters');
        ActionManager.getInstance().tiltCharacter(this.owner!);

        const playerCharacters = TargetingUtils.getInstance().selectAllPlayerCharacters();
        for (const target of playerCharacters) {
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.baseDamage, target: target, sourceCharacter: this.owner });
        }
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
        super({ imageName: 'chemical-bolt',   target: undefined, owner: owner });
        this.debuff = debuff;
        this.iconTint = 0x0000ff;
    }

    tooltipText(): string {
        return `Applying ${this.debuff.getDisplayName()} to a random player`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        for (const target of TargetingUtils.getInstance().selectAllPlayerCharacters()) {
            console.log(`Applying ${this.debuff.stacks} stack(s) of ${this.debuff.getDisplayName()} to ${target.name}`)
            ActionManager.getInstance().tiltCharacter(this.owner!);
            ActionManager.getInstance().applyBuffToCharacterOrCard(target, this.debuff);
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.debuff.getDisplayName(),
            stacks: this.debuff.stacks,
        }, null, 2);
    }
}

export class ApplyBuffToAllEnemyCharactersIntent extends AbstractIntent {
    buff: AbstractBuff;

    constructor({ debuff, owner }: { debuff: AbstractBuff, owner: BaseCharacter }) {
        super({ imageName: 'magick-trick', target: undefined, owner: owner });
        this.buff = debuff;
    }

    tooltipText(): string {
        return `Applying ${this.buff.getDisplayName()} to all your foes.`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        for (const target of TargetingUtils.getInstance().selectAllEnemyCharacters()) {
            console.log(`Applying ${this.buff.stacks} stack(s) of ${this.buff.getDisplayName()} to ${target.name}`)
            ActionManager.getInstance().applyBuffToCharacterOrCard(target, this.buff);
        }
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.buff.getDisplayName(),
            stacks: this.buff.stacks,
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
        return `Applying ${this.debuff?.getDisplayName()} to a random player`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        if (!this.target) {
            throw new Error('Target cannot be null');
        }
        ActionManager.getInstance().tiltCharacter(this.owner!);

        console.log(`Applying ${this.debuff.stacks} stack(s) of ${this.debuff.getDisplayName()} to ${this.target.name}`);
        ActionManager.getInstance().applyBuffToCharacterOrCard(this.target, this.debuff);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.debuff.getDisplayName(),
            stacks: this.debuff.stacks,
        }, null, 2);
    }
}

export class BlockForSelfIntent extends AbstractIntent {
    blockAmount: number;

    constructor({ blockAmount, owner }: { blockAmount: number, owner: BaseCharacter }) {
        super({ imageName: 'round-shield', target: undefined, owner: owner });
        this.blockAmount = blockAmount;
    }

    tooltipText(): string {
        return `Gaining ${this.blockAmount} Block`;
    }

    displayText(): string {
        return `${this.blockAmount}`;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        console.log(`${this.owner!.name} is gaining ${this.blockAmount} Block`);
        ActionManager.getInstance().applyBlock({ baseBlockValue: this.blockAmount, blockSourceCharacter: this.owner, blockTargetCharacter: this.owner });
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            blockAmount: this.blockAmount,
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
        return `Applying ${this.buff.getDisplayName()} to self`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        console.log(`Applying ${this.buff.stacks} stack(s) of ${this.buff.getDisplayName()} to allies`);
        ActionManager.getInstance().applyBuffToCharacterOrCard(this.owner!, this.buff);
    }

    createJsonRepresentation(): string {
        const baseRepresentation = JSON.parse(super.createJsonRepresentation());
        return JSON.stringify({
            ...baseRepresentation,
            className: this.constructor.name,
            debuff: this.buff.getDisplayName(),
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
    constructor({ owner, action, imageName, title }: { owner: BaseCharacter, action: () => void, imageName?: string, title?: string }) {
        super({ imageName: imageName ?? 'uncertainty', target: undefined, owner: owner });
        ActionManager.getInstance().animateAttackerTilt(owner.physicalCard as PhysicalCard);
        this.action = action;
        this.title = title ?? 'Do Something';
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


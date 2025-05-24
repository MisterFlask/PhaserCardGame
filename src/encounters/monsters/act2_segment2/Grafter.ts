import { AbstractIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { CardType } from "../../../gamecharacters/Primitives";
import { ActionManager } from "../../../utils/ActionManager";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";

class PatchworkSurgeon extends AbstractBuff {
    constructor(healAmount: number = 5) {
        super();
        this.isDebuff = false;
        this.imageName = "syringe";
        this.stacks = healAmount;
    }

    override getDisplayName(): string { return "Patchwork Surgeon"; }

    override getDescription(): string {
        return `Whenever a player plays a Power card, this enemy heals ${this.getStacksDisplayText()} HP.`;
    }

    override onAnyCardPlayedByAnyone(card: PlayableCard, _target?: BaseCharacter): void {
        const owner = this.getOwnerAsCharacter();
        if (owner && card.owningCharacter && card.owningCharacter.isPlayerCharacter() && card.cardType === CardType.POWER) {
            ActionManager.getInstance().heal(owner, this.stacks);
        }
    }
}

export class Grafter extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Grafter',
            portraitName: 'Clockwork Abomination',
            maxHitpoints: 90,
            description: 'A trench medic stitching the fallen into grisly servitors.'
        });
        this.buffs.push(new PatchworkSurgeon());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new AttackIntent({ baseDamage: 12, owner: this }).withTitle('Bone Saw')],
            [new AttackIntent({ baseDamage: 6, owner: this }).withTitle('Quick Slash'), new AttackIntent({ baseDamage: 6, owner: this }).withTitle('Quick Slash')]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

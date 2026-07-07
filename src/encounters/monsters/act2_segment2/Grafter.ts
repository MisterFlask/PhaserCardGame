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
            portraitName: 'grafter-trench-medic',
            maxHitpoints: 90,
            description: "A field surgeon of sorts, though I use the term charitably. He collects the dead - and, on one occasion I'd rather not revisit, the merely wounded - and stitches them into servants of a kind, all done with a needle the length of a bayonet and a bedside manner to match. Seems to draw strength from any doctrine or theory recited nearby, which suggests he was a keen student before the war and a keener one after. Do not let him examine you at length."
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

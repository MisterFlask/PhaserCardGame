import { AbstractIntent, AttackAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { ActionManager } from "../../../utils/ActionManager";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";

class ShrapnelClouds extends AbstractBuff {
    constructor(damage: number = 1) {
        super();
        this.stacks = damage;
        this.isDebuff = false;
        this.imageName = "grenade";
    }

    override getDisplayName(): string { return "Shrapnel Clouds"; }

    override getDescription(): string {
        return `Whenever a player draws a card, they take ${this.getStacksDisplayText()} damage.`;
    }

    override onAnyCardDrawn(card: PlayableCard): void {
        const owner = this.getOwnerAsCharacter();
        const player = card.owningCharacter as BaseCharacter | undefined;
        if (owner && player && player.isPlayerCharacter()) {
            ActionManager.getInstance().dealDamage({ baseDamageAmount: this.stacks, target: player, sourceCharacter: owner, fromAttack: false });
        }
    }
}

export class ZeppelinGrenadier extends AutomatedCharacter {
    constructor() {
        super({
            name: 'Zeppelin Grenadier',
            portraitName: 'Napoleonic Zombie',
            maxHitpoints: 85,
            description: 'German aerial trooper dropping shrapnel from above.'
        });
        this.buffs.push(new ShrapnelClouds(1));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [new AttackAllPlayerCharactersIntent({ baseDamage: 5, owner: this }).withTitle('Bombing Run')],
            [new AttackIntent({ baseDamage: 15, owner: this }).withTitle('Focused Bomb')]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

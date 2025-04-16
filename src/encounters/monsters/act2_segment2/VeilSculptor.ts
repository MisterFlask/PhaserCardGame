import { ActionManager } from "../../../gamecharacters/../utils/ActionManager";
import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../../../gamecharacters/PlayerCharacter";
import { PileName } from "../../../rules/DeckLogicHelper";

// a strange debuff that causes each character affected to draw haunting illusions each time they draw a card.
// specifically, whenever they draw a card, we add a useless "Phantom Mote" card into their discard pile.
class ConfoundingVisions extends AbstractBuff {
    constructor(stacks: number = 2) {
        super(stacks);
    }

    getDisplayName(): string {
        return "Confounding Visions";
    }

    getDescription(): string {
        return `each time you draw a card, add a useless phantom mote to your discard pile ${this.getStacksDisplayText()} times (then reduce stacks by one).`;
    }

    // whenever a card is drawn, we add a phantom mote to discard and reduce stacks by one
    public onAnyCardDrawn(card: PlayableCard): void {
        const owner = this.getOwnerAsCharacter();
        if (!owner) return;
        if (this.stacks > 0 && owner.isPlayerCharacter()) {
            const phantom = new PhantomMote();
            ActionManager.getInstance().displaySubtitle(`${owner.name}'s visions conjure a phantom mote...`);
            ActionManager.getInstance().moveCardToPile(phantom, PileName.Discard);
            this.stacks -= 1; 
        }
    }
}

// worthless clutter card
class PhantomMote extends PlayableCard {
    constructor() {
        super({
            name: "Phantom Mote",
            description: "an illusory speck. does nothing, can do nothing, is nothing."
        });
        this.baseEnergyCost = 0;
    }

    override InvokeCardEffects(player: PlayerCharacter) {
    }
}

// this enemy tries to warp your perception. 
// sometimes it attacks, other times it applies a strange debuff that messes with your deck draws.
export class VeilSculptor extends AutomatedCharacter {
    constructor() {
        super({
            name: "Veil Sculptor",
            portraitName: "Light Creatures Throne",
            maxHitpoints: 50,
            description: "a half-glimpsed entity of folded space and twitching glyphs."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const rnd = Math.random();
        if (rnd < 0.4) {
            // direct mental assault
            return [new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Mind Spike")];
        } else {
            // impose confounding visions on all players
            return [
                new ApplyDebuffToAllPlayerCharactersIntent({
                    debuff: new ConfoundingVisions(2),
                    owner: this
                }).withTitle("Whispering Ether")
            ];
        }
    }
}

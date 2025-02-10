import { AbstractIntent, AddCardToPileIntent, AttackIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { HatchesIntoEnemyIfRetained } from "../../../gamecharacters/buffs/playable_card/HatchesIntoEnemyIfRetained";
import { LimitedUses } from "../../../gamecharacters/buffs/playable_card/LimitedUses";
import { Popular } from "../../../gamecharacters/buffs/playable_card/Popular";
import { ReturnCardToHandAtStartOfTurn } from "../../../gamecharacters/buffs/playable_card/ReturnCardToHandAtStartOfTurn";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../../../gamecharacters/PlayerCharacter";
import { CrawlingInfestation } from "./CrawlingInfestation";

// imagine a card representing an egg that hatches into something nasty later
class InfestationEgg extends PlayableCard {
    constructor() {
        super({
            name: "Infestation Egg",
            description: "a writhing mass of embryonic horror. maybe it'll do nothing. or maybe it hatches?"
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new HatchesIntoEnemyIfRetained(new CrawlingInfestation()));
        this.buffs.push(new LimitedUses(2));
        this.buffs.push(new ReturnCardToHandAtStartOfTurn())

    }

    override InvokeCardEffects(player: PlayerCharacter) {
    }

    
}

export class HiveBroodmother extends AutomatedCharacter {
    constructor() {
        super({
            name: "Psalter-Louse",
            portraitName: "Corrupted Spider",
            maxHitpoints: 50,
            description: "a pulsating mass of carapace and ooze, surrounded by countless larvae. each strike feels muffled, as if absorbed by a living swarm."
        });
        this.buffs.push(new Popular());
    }

    override generateNewIntents(): AbstractIntent[] {
        // chooses between attacking and laying eggs
        const rnd = Math.random();
        if (rnd < 0.5) {
            // attack for low damage bc it's a swarm monster
            return [new AttackIntent({ baseDamage: 5, owner: this }).withTitle("Nip")];
        } else {
            // lay some nasty eggs in the player's deck
            return [new AddCardToPileIntent({
                cardToAdd: new InfestationEgg(),
                pileName: 'draw',
                owner: this
            }).withTitle("Lay Egg")];
        }
    }
}

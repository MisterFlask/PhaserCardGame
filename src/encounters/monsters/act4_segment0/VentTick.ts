import { AbstractIntent, AddCardToPileIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { HatchesIntoEnemyIfRetained } from "../../../gamecharacters/buffs/playable_card/HatchesIntoEnemyIfRetained";
import { LimitedUses } from "../../../gamecharacters/buffs/playable_card/LimitedUses";
import { ReturnCardToHandAtStartOfTurn } from "../../../gamecharacters/buffs/playable_card/ReturnCardToHandAtStartOfTurn";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { PlayerCharacter } from "../../../gamecharacters/PlayerCharacter";

// Egg/summon idiom reused verbatim from HiveBroodmother (act2_segment1): a
// retained card hatches into a fresh Vent Tick if the player doesn't play or
// discard it in time.
class VentEgg extends PlayableCard {
    constructor() {
        super({
            name: "Vent Egg",
            description: "warm to the touch, and getting warmer. best played quickly, or not retained at all."
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new HatchesIntoEnemyIfRetained(new VentTick()));
        this.buffs.push(new LimitedUses(2));
        this.buffs.push(new ReturnCardToHandAtStartOfTurn());
    }

    override InvokeCardEffects(player: PlayerCharacter) {
    }
}

// HP band: act-3 FoundryTick (38) + ~20% ≈ 46.
export class VentTick extends AutomatedCharacter {
    constructor() {
        super({
            name: "Vent Tick",
            portraitName: "vent-tick",
            maxHitpoints: 46,
            description: "Cavendish survey note, Brimstone Badlands vent field 4: a chitinous scavenger that clusters at fissure mouths in numbers no single trap accounts for, on the theory - mine, not the Company's - that the vents themselves are a nursery rather than a feeding ground. Bites for remarkably little, but deposits something in whatever it bites that continues developing well after the tick has been swept aside. The Barons' foremen call the resulting welts 'productive.' I have asked them to stop."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [ new AttackIntent({ baseDamage: 6, owner: this }).withTitle('Chip Bite') ],
            [ new AddCardToPileIntent({ cardToAdd: new VentEgg(), pileName: 'draw', owner: this }).withTitle('Lay Vent Egg') ]
        ];
        return IntentListCreator.iterateIntents(intents);
    }
}

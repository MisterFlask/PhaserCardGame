import { AbstractIntent, AttackIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { PlayableCard } from '../../../gamecharacters/PlayableCard';
import { CardType } from '../../../gamecharacters/Primitives';

class PhilosophicalShield extends AbstractBuff {
    private skillPlayedThisTurn: boolean = false;

    constructor() {
        super();
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Philosophy";
    }

    override getDescription(): string {
        return "Does not take attack damage until a Skill is played each turn.";
    }

    override onTurnStart(): void {
        this.skillPlayedThisTurn = false;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (playedCard.cardType === CardType.SKILL) {
            this.skillPlayedThisTurn = true;
        }
    }

    override getDamagePerHitCappedAt(): number {
        if (!this.skillPlayedThisTurn) {
            return 0;
        }
        return Infinity;
    }
}

export class Lexiophage extends AutomatedCharacter {
    constructor() {
        super({
            name: "Lexiophage",
            portraitName: "lexiophage-bureaucrat",
            maxHitpoints: 120,
            description: "A creature that feeds, so far as I can determine, on unresolved arguments. It ignores blows entirely while the debate is purely physical - shrugged off Morrison's cudgel without so much as blinking - but the instant anyone attempts actual reasoning with it, philosophy, doctrine, a well-argued point of procedure, it becomes gruesomely vulnerable, as though the syllogism itself had found the joint in its armor. Small wonder it thrives here; three-quarters of the Lowerarchy's clerical errors trace back to something very like it."
        });
        
        // Apply initial Philosophical Shield buff
        this.buffs.push(new PhilosophicalShield());
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Dialectical Critique")
            ],
            [
                new AttackIntent({ baseDamage: 20, owner: this }).withTitle("Existential Strike")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
}

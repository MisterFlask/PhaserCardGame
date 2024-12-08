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

export class FrenchIntellectual extends AutomatedCharacter {
    constructor() {
        super({
            name: "Lexiophage",
            portraitName: "Eldritch Intellectual",
            maxHitpoints: 120,
            description: "responsible for three out of four paperwork errors"
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

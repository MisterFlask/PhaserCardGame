import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { BaseCharacter } from "../../../gamecharacters/BaseCharacter";
import { PlayableCard } from "../../../gamecharacters/PlayableCard";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { Dexterity } from "../../../gamecharacters/buffs/persona/Dexterity";
import { Lethality } from "../../../gamecharacters/buffs/standard/Lethality";
import { GameState } from "../../../rules/GameState";
import { ActionManager } from "../../../utils/ActionManager";

// Custom buff to track which characters played cards during a turn
class SlothfulCurse extends AbstractBuff {
    private charactersPlayedCardThisTurn: Set<string> = new Set();

    constructor(stacks: number = 2) {
        super();
        this.stacks = stacks;
        this.isDebuff = true;
        this.imageName = "snail";
    }

    override getDisplayName(): string {
        return "Slothful Curse";
    }

    override getDescription(): string {
        return `At the end of turn, characters who didn't play a card lose ${this.getStacksDisplayText()} Lethality.`;
    }

    override onTurnStart(): void {
        // Reset the tracking at the start of each turn
        this.charactersPlayedCardThisTurn.clear();
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        // Track which character played a card
        if (playedCard.owningCharacter) {
            this.charactersPlayedCardThisTurn.add(playedCard.owningCharacter.id);
        }
    }

    override onTurnEnd(): void {
        const gameState = GameState.getInstance();
        const allCharacters = gameState.combatState.playerCharacters;
        
        // Apply negative lethality to characters who didn't play a card
        allCharacters.forEach(character => {
            if (!this.charactersPlayedCardThisTurn.has(character.id)) {
                console.log(`${character.name} didn't play a card this turn, applying -${this.stacks} Lethality`);
                ActionManager.getInstance().applyBuffToCharacterOrCard(
                    character, 
                    new Lethality(-this.stacks)
                );
            }
        });
    }
}

// Keeping this class for reference or future use, but it's no longer used in the current implementation
class ApplySlothfulCurseIntent extends AbstractIntent {
    buff: AbstractBuff;

    constructor({ owner }: { owner: BaseCharacter }) {
        super({ imageName: 'snail', target: undefined, owner: owner });
        this.buff = new SlothfulCurse(2);
    }

    tooltipText(): string {
        return `At the end of turn, characters who didn't play a card lose 2 Lethality.`;
    }

    displayText(): string {
        return ``;
    }

    act(): void {
        ActionManager.getInstance().tiltCharacter(this.owner!);
        
        // Apply the buff to the owner (the enemy)
        // The buff will track card plays and apply the debuff at end of turn
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

export class SlothfulSentinel extends AutomatedCharacter {
    constructor() {
        super({
            name: "Slothful Sentinel",
            portraitName: "Sloth Monster",
            maxHitpoints: 65,
            description: "A lumbering guardian that punishes inaction. Its heavy-lidded eyes track your every move, or lack thereof."
        });
        
        // Apply the SlothfulCurse as an innate buff
        ActionManager.getInstance().applyBuffToCharacterOrCard(this, new SlothfulCurse(2));
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            // First turn: Attack (removed the SlothfulCurse intent since it's now innate)
            [
                new AttackIntent({ baseDamage: 24, owner: this }).withTitle("Heavy Swing")
            ],
            // Second turn: Apply debuff and attack
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ 
                    debuff: new Dexterity(-2), 
                    owner: this 
                }).withTitle("Draining Presence"),
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Sluggish Strike")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }
} 
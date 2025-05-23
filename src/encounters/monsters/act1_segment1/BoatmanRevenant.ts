// Buff: At the beginning of combat, all cargo in your deck costs 1 more to play (Waterlogged)

// The Boatman Revenant alternates between attacking everyone and making everyone Weak or Vulnerable (2).

import { AbstractIntent, ApplyDebuffToAllPlayerCharactersIntent, AttackAllPlayerCharactersIntent, IntentListCreator } from '../../../gamecharacters/AbstractIntent';
import { AutomatedCharacter } from '../../../gamecharacters/AutomatedCharacter';
import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { Vulnerable } from '../../../gamecharacters/buffs/standard/Vulnerable';
import { Weak } from '../../../gamecharacters/buffs/standard/Weak';
import { CardType } from '../../../gamecharacters/Primitives';
import { GameState } from '../../../rules/GameState';

// Custom buff that makes cargo cards cost 1 more
class Waterlogged extends AbstractBuff {
    constructor() {
        super();
        this.isDebuff = true;
        this.imageName = "f";
        this.tint = 0x00FFFF;
    }

    override getDisplayName(): string {
        return "Waterlogged";
    }

    override getDescription(): string {
        return "All cargo cards in your deck cost 1 more to play.";
    }

    override onCombatStart(): void {
        // Apply to all cargo cards in the deck
        const gameState = GameState.getInstance();
        const allCards = [
            ...gameState.combatState.drawPile,
            ...gameState.combatState.currentDiscardPile,
            ...gameState.combatState.currentHand
        ];

        allCards.forEach(card => {
            if (card.cardType === CardType.ITEM) {
                card.baseEnergyCost += 1;
            }
        });
    }
}

export class BoatmanRevenant extends AutomatedCharacter {
    constructor() {
        super({
            name: "Boatman Revenant",
            portraitName: "ghost_ship",
            maxHitpoints: 45,
            description: "A spectral ferryman who makes cargo more expensive to transport"
        });
        
        this.portraitTargetLargestDimension = 300;
        this.portraitOffsetXOverride = -40;
        this.portraitOffsetYOverride = 0;
    }

    override generateNewIntents(): AbstractIntent[] {
        const intents: AbstractIntent[][] = [
            [
                new AttackAllPlayerCharactersIntent({ baseDamage: 8, owner: this }).withTitle("Ghostly Swipe")
            ],
            [
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Weak(2), owner: this }).withTitle("Ethereal Touch"),
                new ApplyDebuffToAllPlayerCharactersIntent({ debuff: new Vulnerable(2), owner: this }).withTitle("Ethereal Touch")
            ]
        ];

        return IntentListCreator.iterateIntents(intents);
    }

    override OnCombatStart(): void {
        super.OnCombatStart();
        // Apply Waterlogged to all player characters
        const gameState = GameState.getInstance();
        gameState.combatState.playerCharacters.forEach(player => {
            this.actionManager.applyBuffToCharacterOrCard(player, new Waterlogged());
        });
    }
}

import { AbstractBuff } from "../AbstractBuff";

export class Erratic extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.stacks = stacks;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Erratic";
    }

    override getDescription(): string {
        return "When drawn, this card's owner becomes a random party member.";
    }

    override onCardDrawn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (!ownerCard) {
            return;
        }

        const playerCharacters = this.gameState.combatState.playerCharacters;
        if (playerCharacters.length === 0) {
            return;
        }

        // Get a random player character
        const randomIndex = Math.floor(Math.random() * playerCharacters.length);
        const randomCharacter = playerCharacters[randomIndex];

        // Set the card's owner to the random character
        ownerCard.owningCharacter = randomCharacter;
    }
}

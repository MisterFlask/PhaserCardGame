import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { DesignatedFoe } from "./DesignatedFoe";

export class Duelist extends AbstractBuff {
    constructor() {
        super();
        this.stackable = false;
        this.isDebuff = false;
    }

    override getDisplayName(): string {
        return "Duelist";
    }

    override getDescription(): string {
        return "At combat start, marks a random player as the Designated Foe. Takes no damage from characters who are not the Designated Foe.";
    }

    override onCombatStart(): void {
        // Get all player characters
        const playerCharacters = this.combatState.playerCharacters;
        if (playerCharacters.length === 0) return;

        // Select a random player character
        const randomIndex = Math.floor(Math.random() * playerCharacters.length);
        const targetCharacter = playerCharacters[randomIndex];

        // Apply the DesignatedFoe buff
        this.actionManager.applyBuffToCharacterOrCard(targetCharacter, new DesignatedFoe());
    }

    override getCombatDamageTakenModifier(sourceCharacter?: BaseCharacter, sourceCard?: PlayableCard): number {
        // If there's no source character, allow the damage
        if (!sourceCharacter) return 0;

        // Check if the source character has the DesignatedFoe buff
        const hasDesignatedFoe = sourceCharacter.buffs.some(buff => buff instanceof DesignatedFoe);

        // If the attacker is not the designated foe, reduce damage to 0
        return hasDesignatedFoe ? 0 : -999;
    }
}

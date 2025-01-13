import { TemporaryLethality } from "../../gamecharacters/buffs/standard/TemporaryLethality";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class Shatterkiss extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
        this.stackable = true;
        this.stacks = 1;
    }

    override getDisplayName(): string {
        return "Shatterkiss";
    }

    override getDescription(): string {
        return `Allied characters gain ${3 * this.stacks} Temporary Lethality the first turn of combat.`;
    }

    override onCombatStart(): void {
        GameState.getInstance().combatState.playerCharacters.forEach(character => {
            ActionManager.getInstance().applyBuffToCharacterOrCard(character, new TemporaryLethality(3 * this.stacks));
        });
    }
} 
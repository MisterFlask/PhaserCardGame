// marrowspike
//Whenever you spend Blood, all allies gain 1 Lethality

import { Lethality } from "../../gamecharacters/buffs/standard/Strong";
import { EntityRarity } from "../../gamecharacters/PlayableCard";
import { AbstractRelic } from "../../relics/AbstractRelic";
import { ResourceUsedEvent } from "../../rules/combatresources/AbstractCombatResource";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";

export class MarrowSpike extends AbstractRelic {
    private readonly BASE_LETHALITY = 1;

    constructor() {
        super();
        this.rarity = EntityRarity.COMMON;
        this.stackable = true;
        this.stacks = 1;
    }

    override getDisplayName(): string {
        return "Marrow Spike";
    }

    override getDescription(): string {
        return `Whenever you spend Blood, all allies gain ${this.BASE_LETHALITY * this.stacks} Lethality`;
    }

    override onEvent(event: ResourceUsedEvent): void {
        if (event instanceof ResourceUsedEvent && event.isBlood()) {
            GameState.getInstance().combatState.playerCharacters.forEach(character => {
                ActionManager.getInstance().applyBuffToCharacterOrCard(character, new Lethality(this.BASE_LETHALITY * this.stacks));
            });
        }
    }
}

import { Stress } from "../../gamecharacters/buffs/standard/Stress";
import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { CombatResourceUsedEvent } from "../../rules/combatresources/AbstractCombatResource";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class ScreamingParasite extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
        this.imageName = "screaming-parasite";
        this.flavorText = "Feeds on Blood and voices its opinion of the arrangement at length.";
    }

    override getDisplayName(): string {
        return "Screaming Parasite";
    }

    override getDescription(): string {
        return "Whenever you spend Blood, all allies gain 1 Stress.";
    }

    override onEvent(event: CombatResourceUsedEvent): void {
        if (event instanceof CombatResourceUsedEvent && event.isBlood()) {
            GameState.getInstance().combatState.playerCharacters.forEach(character => {
                ActionManager.getInstance().applyBuffToCharacter(character, new Stress(1));
            });
        }
    }
}

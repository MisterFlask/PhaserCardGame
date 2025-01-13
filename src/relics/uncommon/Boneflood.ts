import { EntityRarity, PlayableCard } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class Boneflood extends AbstractRelic {
    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
    }

    override getDisplayName(): string {
        return "Boneflood";
    }

    override getDescription(): string {
        return "Whenever you play a card of cost 3 or greater, deal 20 damage to all enemies.";
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (playedCard.energyCost >= 3) {
            GameState.getInstance().combatState.enemies.forEach(enemy => {
                ActionManager.getInstance().dealDamage({
                    baseDamageAmount: 20,
                    target: enemy,
                    fromAttack: false
                });
            });
        }
    }
} 
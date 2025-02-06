import { EntityRarity } from "../../gamecharacters/EntityRarity";
import { PlayableCard } from "../../gamecharacters/PlayableCard";
import { GameState } from "../../rules/GameState";
import { ActionManager } from "../../utils/ActionManager";
import { AbstractRelic } from "../AbstractRelic";

export class Boneflood extends AbstractRelic {
    private readonly BASE_DAMAGE = 20;

    constructor() {
        super();
        this.rarity = EntityRarity.RARE;
        this.stackable = true;
        this.stacks = 1;
    }

    override getDisplayName(): string {
        return "Boneflood";
    }

    override getDescription(): string {
        return `Whenever you play a card of cost 3 or greater, deal ${this.BASE_DAMAGE * this.stacks} damage to all enemies.`;
    }

    override onAnyCardPlayedByAnyone(playedCard: PlayableCard): void {
        if (playedCard.energyCost >= 3) {
            GameState.getInstance().combatState.enemies.forEach(enemy => {
                ActionManager.getInstance().dealDamage({
                    baseDamageAmount: this.BASE_DAMAGE * this.stacks,
                    target: enemy,
                    fromAttack: false
                });
            });
        }
    }
} 
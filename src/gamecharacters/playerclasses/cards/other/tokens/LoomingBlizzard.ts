import { GameState } from "../../../../../rules/GameState";
import { ActionManager } from "../../../../../utils/ActionManager";
import { TargetingType } from "../../../../AbstractCard";
import { BaseCharacter } from "../../../../BaseCharacter";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { AbstractBuff } from "../../../../buffs/AbstractBuff";
import { Frostbite } from "../../../../buffs/standard/Frostbite";

class LoomingBlizzardBuff extends AbstractBuff {
    override getDisplayName(): string { return "Looming Blizzard"; }
    override getDescription(): string {
        return "Unplayable. Ethereal. At end of turn, all characters with Frostbite take 15 damage.";
    }

    override onInHandAtEndOfTurn(): void {
        const ownerCard = this.getOwnerAsPlayableCard();
        if (ownerCard) {
            const allChars = [
                ...GameState.getInstance().combatState.playerCharacters,
                ...GameState.getInstance().combatState.enemies,
            ];
            allChars.forEach(c => {
                if (c.buffs.some(b => b instanceof Frostbite)) {
                    ActionManager.getInstance().dealDamage({ baseDamageAmount: 15, target: c, fromAttack: false, sourceCard: ownerCard });
                }
            });
            ActionManager.getInstance().exhaustCard(ownerCard);
        }
    }
}

export class LoomingBlizzard extends PlayableCard {
    constructor() {
        super({
            name: "Looming Blizzard",
            cardType: CardType.NON_PLAYABLE,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.SPECIAL,
        });
        this.baseEnergyCost = 0;
        this.buffs.push(new LoomingBlizzardBuff());
    }

    override get description(): string {
        return "Unplayable. Ethereal. At end of turn, all characters with Frostbite take 15 damage.";
    }

    override InvokeCardEffects(_target?: BaseCharacter): void { }

    override isUnplayable(): boolean { return true; }
}

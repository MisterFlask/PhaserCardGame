import { AbstractBuff } from '../../../gamecharacters/buffs/AbstractBuff';
import { Hazardous } from '../../../gamecharacters/buffs/playable_card/Hazardous';

export class InfestedModifier extends AbstractBuff {
    getDisplayName(): string {
        return "B__dy Infested";
    }

    getDescription(): string {
        return `At the start of combat, shuffle a D__ed Flies into your deck.`;
    }

    OnCombatStart(): void {
        DeckLogic.moveCardToPile(new DamnedFlies(), PileName.Draw, PilePosition.Random);
    }
}

import { EntityRarity } from "../../../gamecharacters/EntityRarity";
import { PlayableCard } from '../../../gamecharacters/PlayableCard';
import { CardType } from '../../../gamecharacters/Primitives';
import { DeckLogic, PileName, PilePosition } from '../../DeckLogicHelper';

export class DamnedFlies extends PlayableCard {
    constructor() {
        super({
            name: "D___d Flies",
            cardType: CardType.ATTACK,
            rarity: EntityRarity.MENACE,
        });
        this.baseEnergyCost = 1;
        this.buffs.push(new Hazardous(1))
    }

    override get  description(): string {
        return `[i]B__dy nuiscance is what they are.[/i]`;
    }

    override InvokeCardEffects(targetCard?: PlayableCard): void {
        this.actionManager.drawCards(1)
    }
    
}

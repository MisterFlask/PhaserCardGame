import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { ExhaustBuff } from "../../../../buffs/playable_card/ExhaustBuff";
import { EntityRarity } from "../../../../EntityRarity";
import { PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { Buzzsword } from "../commons/Buzzsword";

export class Quartermaster extends PlayableCard {
    constructor() {
        super({
            name: "Quartermaster",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: EntityRarity.RARE,
        });
        this.baseEnergyCost = 1;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const livingPartyMembers = combatState.playerCharacters.filter(character => !character.isDead());

        livingPartyMembers.forEach(member => {
            if (member.isDead()) {
                return;
            }
            const buzzsword = new Buzzsword();
            buzzsword.baseEnergyCost -= 1;
            buzzsword.owningCharacter = member;
            buzzsword.buffs.push(new ExhaustBuff());
            BasicProcs.getInstance().ManufactureCardToHand(buzzsword);
        });
    }

    override get description(): string {
        return `Manufacture a Buzzsword for each living party member. Each costs 1 less and exhausts.`;
    }
}

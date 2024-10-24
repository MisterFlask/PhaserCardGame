import { GameState } from "../../../../../rules/GameState";
import { AbstractCard, TargetingType } from "../../../../AbstractCard";
import { CardRarity, PlayableCard } from "../../../../PlayableCard";
import { CardType } from "../../../../Primitives";
import { BasicProcs } from "../../../../procs/BasicProcs";
import { Buzzsword } from "../commons/Buzzsword";

export class Quartermaster extends PlayableCard {
    constructor() {
        super({
            name: "Quartermaster",
            cardType: CardType.SKILL,
            targetingType: TargetingType.NO_TARGETING,
            rarity: CardRarity.RARE,
        });
        this.energyCost = 2;
    }

    override InvokeCardEffects(targetCard?: AbstractCard): void {
        const gameState = GameState.getInstance();
        const combatState = gameState.combatState;
        const livingPartyMembers = combatState.playerCharacters.filter(character => !character.isDead());

        livingPartyMembers.forEach(member => {
            const buzzsword = new Buzzsword();
            buzzsword.energyCost -= 1;
            buzzsword.owner = member
            BasicProcs.getInstance().ManufactureCardToHand(buzzsword);
        });
    }

    override get description(): string {
        return `Manufacture a number of Buzzswords to hand equal to the number of living party members. Each costs 1 less and is owned by a different party member.`;
    }
}

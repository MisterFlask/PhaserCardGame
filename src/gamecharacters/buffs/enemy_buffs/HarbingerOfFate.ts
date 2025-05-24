import { BaseCharacter } from "../../BaseCharacter";
import { PlayableCard } from "../../PlayableCard";
import { AbstractBuff } from "../AbstractBuff";
import { Foreseen } from "./Foreseen";

export class HarbingerOfFate extends AbstractBuff {
    private playedForeseenThisCombat: Set<string> = new Set();

    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "forward-sun";
    }

    override getDisplayName(): string { return "Harbinger of Fate"; }

    override getDescription(): string {
        return "Tracks those who play Foreseen cards.";
    }

    override onCombatStart(): void {
        this.playedForeseenThisCombat.clear();
    }

    override onAnyCardPlayedByAnyone(card: PlayableCard): void {
        if (card.buffs.some(b => b instanceof Foreseen) && card.owningCharacter && card.owningCharacter.isPlayerCharacter()) {
            this.playedForeseenThisCombat.add(card.owningCharacter.id);
        }
    }

    public hasPlayedForeseen(character: BaseCharacter): boolean {
        return this.playedForeseenThisCombat.has(character.id);
    }
}

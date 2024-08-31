import { AbstractCard, PlayableCard } from "../gamecharacters/AbstractCard";
import { BaseCharacter } from "../gamecharacters/BaseCharacter";
import { GameState } from "../screens/gamestate";
import { ActionManager } from "../utils/ActionManager";

export class CombatRules {
  public static PlayCard = (card: PlayableCard, target: BaseCharacter): void => {
    // Invoke the effect of the card
    if (card.IsPerformableOn(target)) {
      card.InvokeCardEffects(target);
    }

    ActionManager.getInstance().discardCard(card);
  };
}
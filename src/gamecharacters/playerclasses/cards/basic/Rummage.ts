import { PlayableCard } from '../../../PlayableCard';
import { BaseCharacter } from '../../../BaseCharacter';
import { TargetingType, AbstractCard } from '../../../AbstractCard';
import { ActionManager } from '../../../../utils/ActionManager';

export class Rummage extends PlayableCard {
  constructor() {
    super({
      name: 'Rummage',
      portraitName: 'rummage',
      targetingType: TargetingType.NO_TARGETING,
    });
    this.energyCost = 1;
  }

  override get description(): string {
    return `Discard a selected card and draw 2 cards.`;
  }

  override InvokeCardEffects(targetCard?: AbstractCard): void {
    this.actionManager.requireCardSelection({name: "discard_card", instructions: "Discard a card to draw 2 cards", min: 1, max: 1, cancellable: true, action: (selectedCards: AbstractCard[]) => {
      this.actionManager.discardCard(selectedCards[0]);
      this.actionManager.drawCards(2);
    }});
  }
}

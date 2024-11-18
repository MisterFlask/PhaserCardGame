import { AbstractCard, TargetingType } from './AbstractCard';
import { BaseCharacter } from './BaseCharacter';
import { AbstractBuff } from './buffs/AbstractBuff';
import { IBaseCharacter } from './IBaseCharacter';
import { CardRarity, PlayableCard, } from './PlayableCard';
import { CardSize, CardType } from './Primitives';

export abstract class PlayableCardWithHelpers extends PlayableCard {
    constructor({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner, price, rarity }: { name: string; description?: string; portraitName?: string; cardType?: CardType; tooltip?: string; characterData?: AbstractCard; size?: CardSize; targetingType?: TargetingType; owner?: IBaseCharacter; price?: number; rarity?: CardRarity }) {
        super({ name, description, portraitName, cardType, tooltip, characterData, size, targetingType, owner, price, rarity });
    }

    addBuff(target: BaseCharacter, buff: AbstractBuff): void {
        this.actionManager.applyBuffToCharacterOrCard(target, buff, this.owner);
    }
}

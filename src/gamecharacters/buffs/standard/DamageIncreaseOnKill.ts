import { IBaseCharacter } from '../../IBaseCharacter';
import { PlayableCard } from '../../PlayableCard';
import { AbstractBuff } from '../AbstractBuff';

export class DamageIncreaseOnKill extends AbstractBuff {
    constructor(stacks: number = 1) {
        super();
        this.imageName = "damage-increase-on-kill";
        this.stackable = true;
        this.stacks = stacks;
    }

    override getName(): string {
        return "Damage Increase On Kill";
    }

    override getDescription(): string {
        return `When this card kills an enemy, its damage increases by ${this.getStacksDisplayText()} permanently.`;
    }

    override onFatal(killedUnit: IBaseCharacter): void {
        const card = this.getOwnerAsPlayableCard() as PlayableCard;
        
        if (card && card.isPlayableCard()) {
            card.mirrorChangeToCanonicalCard((canonicalCard) => {
                canonicalCard.baseDamage += this.stacks;
                console.log(`${canonicalCard.name}'s damage increased by ${this.stacks} after killing an enemy. New base damage: ${canonicalCard.baseDamage}`);
            });
        }
    }
}

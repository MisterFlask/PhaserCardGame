import { AbstractBuff } from '../../../../gamecharacters/buffs/AbstractBuff';
import { ShopContents } from '../../../GameState';

export class FriendlyMerchantsModifier extends AbstractBuff {
    getDisplayName(): string {
        return "Friendly Merchants";
    }

    getDescription(): string {
        return `The arms dealer will have ${this.getStacksDisplayText()} additional sale tags on their products.`;
    }

    override onShopInitialized(shopContents: ShopContents): void {
        //todo
    }
}

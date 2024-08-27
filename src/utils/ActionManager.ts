import { ActionQueue, GameAction } from './ActionQueue';
import { StoreCard } from '../screens/campaign';
import { GameState } from '../screens/gamestate';

export class ActionManager {
    private actionQueue: ActionQueue;
    private gameState: GameState;

    constructor() {
        this.actionQueue = new ActionQueue();
        this.gameState = GameState.getInstance();
    }

    public dealDamage(amount: number, target: any): void {
        class DealDamageAction extends GameAction {
            constructor(private amount: number, private target: any) {
                super();
            }

            playAction(): GameAction[] {
                console.log(`Dealing ${this.amount} damage to ${this.target}`);
                // In a real game, you'd apply the damage to the target here
                return []; // Return any follow-up actions if needed
            }
        }

        this.actionQueue.addAction(new DealDamageAction(amount, target));
    }

    public purchaseShopItem(item: StoreCard): void {
        item.OnPurchase();
        const inventory = GameState.getInstance().getInventory();
        inventory.push(item);
        GameState.getInstance().setShopItems(GameState.getInstance().getShopItems().filter(i => i !== this.item));
    }

    public async resolveActions(): Promise<void> {
        await this.actionQueue.resolveActions();
    }
}

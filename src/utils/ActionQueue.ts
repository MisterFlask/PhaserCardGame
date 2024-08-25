import Phaser from 'phaser';

abstract class GameAction {
  abstract playAction(): GameAction[];
}

class ActionQueue {
  private queue: GameAction[] = [];

  addAction(action: GameAction): void {
    this.queue.push(action);
  }

  async resolveActions(): Promise<void> {
    while (this.queue.length > 0) {
      const currentAction = this.queue.shift();
      if (currentAction) {
        const newActions = currentAction.playAction();
        this.queue.unshift(...newActions);
      }
    }
  }
}

class GameScene extends Phaser.Scene {
  private actionQueue: ActionQueue;

  constructor() {
    super('GameScene');
    this.actionQueue = new ActionQueue();
  }

  create(): void {
    this.actionQueue.addAction(new DamageAction(10));
    this.actionQueue.addAction(new DrawCardAction(2));
    this.resolveAllActions();
  }

  private async resolveAllActions(): Promise<void> {
    await this.actionQueue.resolveActions();
    console.log('All actions resolved');
  }
}

// Example game-specific action classes

class DamageAction extends GameAction {
  constructor(private amount: number) {
    super();
  }

  playAction(): GameAction[] {
    console.log(`Dealing ${this.amount} damage`);
    // In a real game, you'd apply the damage to a target here
    return [new CheckDeathAction()];
  }
}

class DrawCardAction extends GameAction {
  constructor(private count: number) {
    super();
  }

  playAction(): GameAction[] {
    console.log(`Drawing ${this.count} card(s)`);
    // In a real game, you'd implement card drawing logic here
    return [];
  }
}

class CheckDeathAction extends GameAction {
  playAction(): GameAction[] {
    console.log("Checking if any character has died");
    // In a real game, you'd check character health here
    // and potentially return a DeathAction if a character has died
    return [];
  }
}

// Example of how you might use this in a larger game context

interface Card {
  play(): GameAction[];
}

class SlashCard implements Card {
  play(): GameAction[] {
    return [new DamageAction(6), new DrawCardAction(1)];
  }
}

class GameState {
  private actionQueue: ActionQueue = new ActionQueue();

  playCard(card: Card): void {
    const actions = card.play();
    actions.forEach(action => this.actionQueue.addAction(action));
    this.actionQueue.resolveActions();
  }
}

// Usage
const gameState = new GameState();
gameState.playCard(new SlashCard());
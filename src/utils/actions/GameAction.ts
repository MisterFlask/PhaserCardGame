

export abstract class GameAction {
    abstract playAction(): Promise<GameAction[]>;
}

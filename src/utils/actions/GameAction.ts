

export abstract class GameAction {

    neverTimeout: boolean = false;

    abstract playAction(): Promise<GameAction[]>;
}

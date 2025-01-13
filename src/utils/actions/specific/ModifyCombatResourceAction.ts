import { GameState } from "../../../rules/GameState";
import { BaseCharacterType } from "../../../Types";
import { GameAction } from "../GameAction";

export class ModifySmogAction extends GameAction {
    constructor(
        private amount: number, 
        private sourceCharacterIfAny?: BaseCharacterType
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        GameState.getInstance().combatState.combatResources.modifySmog(this.amount);
        return [];
    }
}

export class ModifyPluckAction extends GameAction {
    constructor(
        private amount: number, 
        private sourceCharacterIfAny?: BaseCharacterType
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        GameState.getInstance().combatState.combatResources.modifyPluck(this.amount);
        return [];
    }
}

export class ModifyAshesAction extends GameAction {
    constructor(
        private amount: number, 
        private sourceCharacterIfAny?: BaseCharacterType
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        GameState.getInstance().combatState.combatResources.modifyAshes(this.amount);
        return [];
    }
}

export class ModifyMettleAction extends GameAction {
    constructor(
        private amount: number, 
        private sourceCharacterIfAny?: BaseCharacterType
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        GameState.getInstance().combatState.combatResources.modifyMettle(this.amount);
        return [];
    }
}

export class ModifyVentureAction extends GameAction {
    constructor(
        private amount: number, 
        private sourceCharacterIfAny?: BaseCharacterType
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        GameState.getInstance().combatState.combatResources.modifyVenture(this.amount);
        return [];
    }
}

export class ModifyBloodAction extends GameAction {
    constructor(
        private amount: number, 
        private sourceCharacterIfAny?: BaseCharacterType
    ) {
        super();
    }

    async playAction(): Promise<GameAction[]> {
        GameState.getInstance().combatState.combatResources.modifyBlood(this.amount);
        return [];
    }
} 
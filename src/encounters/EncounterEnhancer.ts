import { DrawOneFewerCardNextNTurns } from "../gamecharacters/buffs/standard/DrawOneFewerCardNextNTurns";
import { Lethality } from "../gamecharacters/buffs/standard/Lethality";
import { Encounter } from "./EncounterManager";

export abstract class EncounterEnhancer {

    public static getRandomEnhancer(): EncounterEnhancer {
        const enhancers = [
            new StrongEncounterEnhancer(),
            new DrawOneFewerCardNextNTurnsEncounterEnhancer()
        ];
        return enhancers[Math.floor(Math.random() * enhancers.length)];
    }

    public static enhanceEliteEncounter(encounter: Encounter): Encounter {
        this.getRandomEnhancer().enhanceEncounter(encounter);
        return this.raiseMaxHp(encounter);
    }

    public static raiseMaxHp(encounter: Encounter, percent: number = 40): Encounter {
        encounter.enemies.forEach(enemy => {
            enemy.maxHitpoints *= (1 + percent / 100);
        });
        return encounter;
    }

    public abstract enhanceEncounter(encounter: Encounter): Encounter;
}

export class StrongEncounterEnhancer extends EncounterEnhancer {
    constructor(private stacks: number = 3) {
        super();
    }

    public enhanceEncounter(encounter: Encounter): Encounter {
        encounter.enemies.forEach(enemy => {
            enemy.applyBuffs_useFromActionManager([new Lethality(this.stacks)]);
        });
        return encounter;
    }
}


export class DrawOneFewerCardNextNTurnsEncounterEnhancer extends EncounterEnhancer {
    constructor(private stacks: number = 10) {
        super();
    }

    public enhanceEncounter(encounter: Encounter): Encounter {
        if (encounter.enemies.length > 0) {
            encounter.enemies[0].applyBuffs_useFromActionManager([new DrawOneFewerCardNextNTurns(this.stacks)]);
        }
        return encounter;
    }
}

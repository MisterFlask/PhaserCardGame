import { DrawOneFewerCardNextNTurns } from "../gamecharacters/buffs/standard/DrawOneFewerCardNextNTurns";
import { Strong } from "../gamecharacters/buffs/standard/Strong";
import { EncounterData } from "./Encounters";

export abstract class EncounterEnhancer {

    public static getRandomEnhancer(): EncounterEnhancer {
        const enhancers = [
            new StrongEncounterEnhancer(),
            new DrawOneFewerCardNextNTurnsEncounterEnhancer()
        ];
        return enhancers[Math.floor(Math.random() * enhancers.length)];
    }

    public static enhanceEliteEncounter(encounter: EncounterData): EncounterData {
        this.getRandomEnhancer().enhanceEncounter(encounter);
        return this.raiseMaxHp(encounter);
    }

    public static raiseMaxHp(encounter: EncounterData, percent: number = 40): EncounterData {
        encounter.enemies.forEach(enemy => {
            enemy.maxHitpoints *= (1 + percent / 100);
            enemy.hitpoints = enemy.maxHitpoints;
        });
        return encounter;
    }

    public abstract enhanceEncounter(encounter: EncounterData): EncounterData;
}

export class StrongEncounterEnhancer extends EncounterEnhancer {
    constructor(private stacks: number = 3) {
        super();
    }

    public enhanceEncounter(encounter: EncounterData): EncounterData {
        encounter.enemies.forEach(enemy => {
            enemy.applyBuffs([new Strong(this.stacks)]);
        });
        return encounter;
    }
}


export class DrawOneFewerCardNextNTurnsEncounterEnhancer extends EncounterEnhancer {
    constructor(private stacks: number = 10) {
        super();
    }

    public enhanceEncounter(encounter: EncounterData): EncounterData {
        if (encounter.enemies.length > 0) {
            encounter.enemies[0].applyBuffs([new DrawOneFewerCardNextNTurns(this.stacks)]);
        }
        return encounter;
    }
}

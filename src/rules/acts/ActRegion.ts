import { Encounter } from "../../encounters/EncounterManager";
import { AbstractBuff } from "../../gamecharacters/buffs/AbstractBuff";

export class ActRegion{
    constructor(
        public name: string,
        public description: string,
        public background: string,
    ) {
        
    }
    public getUniqueGenericEncounters(): Encounter[] {
        return [new Encounter([], 1, 1)];
    }

    public universalLocationBuffs(): AbstractBuff[] {
        return [];
    }
    public static getRandomRegion(): ActRegion {
        const regions = [ActRegion.DIS,
            ActRegion.STYX_DELTA,
            ActRegion.BRIMSTONE_BADLANDS,
            ActRegion.SCREAMING_FORESTS,
            ActRegion.CLOCKWORK_WASTES,
            ActRegion.ABYSAL_FRONTIER];
        return regions[Math.floor(Math.random() * regions.length)];
    }   

    public static readonly DIS = new ActRegion("Dis", "The infernal capital", "dis");
    public static readonly STYX_DELTA = new ActRegion("Styx Delta", "The Styx Delta", "styx_delta");
    public static readonly BRIMSTONE_BADLANDS = new ActRegion("Brimstone Badlands", "The Brimstone Badlands", "caves");
    public static readonly SCREAMING_FORESTS = new ActRegion("Screaming Forests", "The Screaming Forests", "jungle");
    public static readonly CLOCKWORK_WASTES = new ActRegion("Clockwork Wastes", "The Clockwork Wastes", "city");
    public static readonly ABYSAL_FRONTIER = new ActRegion("Abyssal Frontier", "The Abyssal Frontier", "caves");

}

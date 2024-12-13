import { Encounter } from "../../encounters/EncountersList";
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

    public static readonly DIS = new ActRegion("DIS", "The infernal capital", "dis");
    public static readonly STYX_DELTA = new ActRegion("STYX_DELTA", "The Styx Delta", "styx_delta");
    public static readonly BRIMSTONE_BADLANDS = new ActRegion("BRIMSTONE_BADLANDS", "The Brimstone Badlands", "caves");
    public static readonly SCREAMING_FORESTS = new ActRegion("SCREAMING_FORESTS", "The Screaming Forests", "jungle");
    public static readonly CLOCKWORK_WASTES = new ActRegion("CLOCKWORK_WASTES", "The Clockwork Wastes", "city");
    public static readonly ABYSAL_FRONTIER = new ActRegion("ABYSAL_FRONTIER", "The Abyssal Frontier", "caves");

}

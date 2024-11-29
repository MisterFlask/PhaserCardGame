import { LedgerItem } from "./LedgerItem";

export class StokersUnionEsteem extends LedgerItem {
    constructor(amount: number = 1) {
        super();
        this.id = "stokers_union_esteem";
        this.displayName = "Stoker's Union Esteem";
        this.description = "Your standing with the grim-faced laborers who keep Hell's great Furnace burning.";
        this.portraitName = "stokers_union";
        this.canGoNegativeOrZero = true;
    }
}

export class ArtisanalGuildsEsteem extends LedgerItem {
    constructor(amount: number = 1) {
        super();
        this.id = "artisanal_guilds_esteem";
        this.displayName = "Artisanal Guilds Esteem";
        this.description = "Your standing with Hell's traditional craftsmen.";
        this.portraitName = "artisanal_guilds";
        this.canGoNegativeOrZero = true;
    }
}

export class BrimstoneBaronsEsteem extends LedgerItem {
    constructor(amount: number = 1) {
        super();
        this.id = "brimstone_barons_esteem";
        this.displayName = "Brimstone Barons Esteem";
        this.description = "Your reputation with Hell's wealthy industrialists.";
        this.portraitName = "brimstone_barons";
        this.canGoNegativeOrZero = true;
    }
}

export class CinderCourtEsteem extends LedgerItem {
    constructor(amount: number = 1) {
        super();
        this.id = "cinder_court_esteem";
        this.displayName = "Cinder Court Esteem";
        this.description = "Your standing with Hell's ancient aristocracy.";
        this.portraitName = "cinder_court";
        this.canGoNegativeOrZero = true;
    }
}

export class InvasionCultEsteem extends LedgerItem {
    constructor(amount: number = 1) {
        super();
        this.id = "invasion_cult_esteem";
        this.displayName = "Cult of the Invasion Esteem";
        this.description = "Your reputation with the deluded zealots plotting the invasion of Heaven";
        this.portraitName = "invasion_cult";
        this.canGoNegativeOrZero = true;
    }
}

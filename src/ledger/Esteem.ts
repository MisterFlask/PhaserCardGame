import { AbstractRelic } from "../relics/AbstractRelic";

export class StokersUnionEsteem extends AbstractRelic {
    private _displayName: string = "Stoker's Union Esteem";
    private _description: string = "Your standing with the grim-faced laborers who keep Hell's great Furnace burning.";

    constructor(amount: number = 1) {
        super();
        this.isLedgerItem = true;
        this.id = "stokers_union_esteem";
        this.imageName = "stokers_union";
        this.canGoNegative = true;
        this.init();
    }

    getDisplayName(): string {
        return this._displayName;
    }

    getDescription(): string {
        return this._description;
    }
}

export class ArtisanalGuildsEsteem extends AbstractRelic {
    private _displayName: string = "Artisanal Guilds Esteem";
    private _description: string = "Your standing with Hell's traditional craftsmen.";

    constructor(amount: number = 1) {
        super();
        this.isLedgerItem = true;
        this.id = "artisanal_guilds_esteem";
        this.imageName = "artisanal_guilds";
        this.canGoNegative = true;
        this.init();
    }

    getDisplayName(): string {
        return this._displayName;
    }

    getDescription(): string {
        return this._description;
    }
}

export class BrimstoneBaronsEsteem extends AbstractRelic {
    private _displayName: string = "Brimstone Barons Esteem";
    private _description: string = "Your reputation with Hell's wealthy industrialists.";

    constructor(amount: number = 1) {
        super();
        this.isLedgerItem = true;
        this.id = "brimstone_barons_esteem";
        this.imageName = "brimstone_barons";
        this.canGoNegative = true;
        this.init();
    }

    getDisplayName(): string {
        return this._displayName;
    }

    getDescription(): string {
        return this._description;
    }
}

export class CinderCourtEsteem extends AbstractRelic {
    private _displayName: string = "Cinder Court Esteem";
    private _description: string = "Your standing with Hell's ancient aristocracy.";

    constructor(amount: number = 1) {
        super();
        this.isLedgerItem = true;
        this.id = "cinder_court_esteem";
        this.imageName = "cinder_court";
        this.canGoNegative = true;
        this.init();
    }

    getDisplayName(): string {
        return this._displayName;
    }

    getDescription(): string {
        return this._description;
    }
}

export class InvasionCultEsteem extends AbstractRelic {
    private _displayName: string = "Cult of the Invasion Esteem";
    private _description: string = "Your reputation with the deluded zealots plotting the invasion of Heaven";

    constructor(amount: number = 1) {
        super();
        this.isLedgerItem = true;
        this.id = "invasion_cult_esteem";
        this.imageName = "invasion_cult";
        this.canGoNegative = true;
        this.init();
    }

    getDisplayName(): string {
        return this._displayName;
    }

    getDescription(): string {
        return this._description;
    }
}

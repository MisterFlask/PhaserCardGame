import { BaseCharacterClass } from "./BaseCharacterClass";
import { CardLibrary } from "./playerclasses/cards/CardLibrary";

export class CharacterClasses {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
    getCharacterClass(): BaseCharacterClass {
        return CardLibrary.getInstance().getCharacterClasses().find(c => c.id === this.id) as BaseCharacterClass;
    }
    static ARCHON = new CharacterClasses("ARCHON");
    static BLACKHAND = new CharacterClasses("BLACKHAND");
    static DIABOLIST = new CharacterClasses("DIABOLIST");
    static COG = new CharacterClasses("COG");

    static ARCHON_ID = this.ARCHON.id
    static BLACKHAND_ID = this.BLACKHAND.id
    static DIABOLIST_ID = this.DIABOLIST.id
    static COG_ID = this.COG.id
}
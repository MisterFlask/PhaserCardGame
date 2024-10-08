export enum CardType {
    ATTACK = "ATTACK",
    SKILL = "SKILL",
    POWER = "POWER",
    ITEM = "ITEM",
    
    NON_PLAYABLE = "NON_PLAYABLE",
}

export class CardSize {
    public sizeModifier: number;

    private constructor({ sizeModifier }: { sizeModifier: number }) {
        this.sizeModifier = sizeModifier;
    }


    static SMALL = new CardSize({ sizeModifier: 1 });
    static MEDIUM = new CardSize({ sizeModifier: 1.5 });
    static LARGE = new CardSize({ sizeModifier: 2 });
}

Object.freeze(CardSize);
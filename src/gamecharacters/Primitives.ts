export enum CardType {
    CHARACTER = "CHARACTER",
    PLAYABLE = "PLAYABLE",
    STORE = "STORE",
    LOCATION = "LOCATION"
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
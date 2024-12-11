export class CardType {
    private constructor(
        public readonly name: string,
        public readonly displayName: string,
        public readonly emoji: string
    ) {}

    public static readonly ATTACK = new CardType("ATTACK", "Attack", "🗡️");
    public static readonly SKILL = new CardType("SKILL", "Skill", "🔮");
    public static readonly POWER = new CardType("POWER", "Power", "⚡");
    public static readonly ITEM = new CardType("ITEM", "Item", "🎒");
    public static readonly STATUS = new CardType("STATUS", "Status", "💫");
    public static readonly NON_PLAYABLE = new CardType("NON_PLAYABLE", "Unplayable", "❌");

    getEmoji(): string {
        return this.emoji;
    }

    toString(): string {
        return this.name;
    }
}

export class CardSize {
    public sizeModifier: number;

    private constructor({ sizeModifier }: { sizeModifier: number }) {
        this.sizeModifier = sizeModifier;
    }

    static TINY = new CardSize({ sizeModifier: 0.5 });
    static SMALL = new CardSize({ sizeModifier: 1 });
    static MEDIUM = new CardSize({ sizeModifier: 1.5 });
    static LARGE = new CardSize({ sizeModifier: 2 });
}

Object.freeze(CardSize);
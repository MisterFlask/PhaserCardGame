
export class EntityRarity {
    private constructor({
        id, weight, color, basePrice, baseCardLevel
    }: {
        id: string;
        weight: number;
        color: number;
        basePrice: number;
        baseCardLevel: number;
    }) {
        this.id = id;
        this.weight = weight;
        this.color = color;
        this.basePrice = basePrice;
        this.basePowerLevel = baseCardLevel;
    }

    public readonly id: string;
    public readonly weight: number;
    public readonly color: number;
    public readonly basePrice: number;
    public readonly basePowerLevel: number;


    static readonly MENACE = new EntityRarity({ id: "MENACE", weight: 9, color: 0xFF4500, basePrice: 0, baseCardLevel: 0 });

    static readonly TOKEN = new EntityRarity({ id: "TOKEN", weight: 0, color: 0xA0A0A0, basePrice: 25, baseCardLevel: 0 });
    static readonly BASIC = new EntityRarity({ id: "BASIC", weight: 1, color: 0xA0A0A0, basePrice: 25, baseCardLevel: 0 });
    static readonly COMMON = new EntityRarity({ id: "COMMON", weight: 2, color: 0xA0A0A0, basePrice: 50, baseCardLevel: 1 });
    static readonly UNCOMMON = new EntityRarity({ id: "UNCOMMON", weight: 3, color: 0x87CEEB, basePrice: 100, baseCardLevel: 2 });
    static readonly RARE = new EntityRarity({ id: "RARE", weight: 4, color: 0xDDA0DD, basePrice: 200, baseCardLevel: 3 });
    static readonly EPIC = new EntityRarity({ id: "EPIC", weight: 5, color: 0xFF69B4, basePrice: 350, baseCardLevel: 4 });
    static readonly LEGENDARY = new EntityRarity({ id: "LEGENDARY", weight: 6, color: 0xFFD700, basePrice: 500, baseCardLevel: 5 });
    static readonly SPECIAL = new EntityRarity({ id: "SPECIAL", weight: 7, color: 0xFF4500, basePrice: 400, baseCardLevel: 7 });
    static readonly BOSS = new EntityRarity({ id: "BOSS", weight: 8, color: 0xFF4500, basePrice: 400, baseCardLevel: 7 });

    toString(): string {
        return this.id;
    }

    static fromString(str: string): EntityRarity {
        const value = (EntityRarity as any)[str];
        if (!value) {
            throw new Error(`Invalid CardRarity: ${str}`);
        }
        return value;
    }

    static getAllRarities(): EntityRarity[] {
        return [
            EntityRarity.TOKEN,
            EntityRarity.BASIC,
            EntityRarity.COMMON,
            EntityRarity.UNCOMMON,
            EntityRarity.RARE,
            EntityRarity.EPIC,
            EntityRarity.LEGENDARY,
            EntityRarity.SPECIAL
        ];
    }

    isAtLeastAsRareAs(other: EntityRarity): boolean {
        return this.weight >= other.weight;
    }
}

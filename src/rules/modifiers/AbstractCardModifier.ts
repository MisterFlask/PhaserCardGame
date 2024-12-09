import { PlayableCard } from "../../gamecharacters/PlayableCard";

export enum ModifierContext {
    SHOP = "SHOP",
    REST_SITE_UPGRADE = "REST_SITE_UPGRADE",
    CARD_REWARD = "CARD_REWARD",
    // Add any future contexts here
}

export interface CardModifierArgs {
    name: string;
    modifier: (card: PlayableCard) => void;
    eligible?: (card: PlayableCard) => boolean;
    weight?: number;
    powerLevelChange?: number;
    probability?: number;
    contextsApplicable?: ModifierContext[];
}

export class CardModifier {
    public readonly name: string;
    public readonly modifier: (card: PlayableCard) => void;
    public readonly eligible: (card: PlayableCard) => boolean;
    public readonly weight: number;
    public readonly powerLevelChange: number;
    public readonly probability: number;
    public readonly contextsApplicable: ModifierContext[];

    private static readonly DEFAULT_CONTEXTS = [
        ModifierContext.SHOP,
        ModifierContext.REST_SITE_UPGRADE,
        ModifierContext.CARD_REWARD
    ];

    constructor(args: CardModifierArgs) {
        this.name = args.name;
        this.modifier = args.modifier;
        this.eligible = args.eligible ?? (() => true);
        this.weight = args.weight ?? 1;
        this.powerLevelChange = args.powerLevelChange ?? 0;
        this.probability = args.probability ?? 1;
        this.contextsApplicable = args.contextsApplicable ?? CardModifier.DEFAULT_CONTEXTS;
    }

    public applyModification(card: PlayableCard): void {
        if (!this.eligible(card)) {
            throw new Error("Card modifier is not eligible for this card");
        }
        this.modifier(card);
    }

    public isApplicableInContext(context: ModifierContext): boolean {
        return this.contextsApplicable.includes(context);
    }
} 
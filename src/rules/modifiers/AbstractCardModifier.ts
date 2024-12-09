import { PlayableCard } from "../../gamecharacters/PlayableCard";

export interface CardModifierArgs {
    name: string;
    modifier: (card: PlayableCard) => void;
    eligible?: (card: PlayableCard) => boolean;
    weight?: number;
    powerLevelChange?: number;
    probability?: number;
}

export class CardModifier {
    public readonly name: string;
    public readonly modifier: (card: PlayableCard) => void;
    public readonly eligible: (card: PlayableCard) => boolean;
    public readonly weight: number;
    public readonly powerLevelChange: number;
    public readonly probability: number;

    constructor(args: CardModifierArgs) {
        this.name = args.name;
        this.modifier = args.modifier;
        this.eligible = args.eligible ?? (() => true);
        this.weight = args.weight ?? 1;
        this.powerLevelChange = args.powerLevelChange ?? 0;
        this.probability = args.probability ?? 1;
    }

    public applyModification(card: PlayableCard): void {
        if (!this.eligible(card)) {
            throw new Error("Card modifier is not eligible for this card");
        }
        this.modifier(card);
    }
} 
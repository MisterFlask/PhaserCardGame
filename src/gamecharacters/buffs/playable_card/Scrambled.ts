import { AbstractBuff } from "../AbstractBuff";

export class ScrambledBuff extends AbstractBuff {
    private static readonly SCRAMBLE_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?/~`";

    constructor() {
        super();
        this.isDebuff = true;
    }

    override getDisplayName(): string {
        return "Scrambled";
    }

    override getDescription(): string {
        return "This card's name and description are scrambled.";
    }

    private scrambleText(text: string): string {
        return text.split('').map(() => {
            const randomIndex = Math.floor(Math.random() * ScrambledBuff.SCRAMBLE_CHARS.length);
            return ScrambledBuff.SCRAMBLE_CHARS[randomIndex];
        }).join('');
    }

    override modifyDescription(description: string): string {
        return this.scrambleText(description);
    }

    override modifyName(name: string): string {
        return this.scrambleText(name);
    }
}

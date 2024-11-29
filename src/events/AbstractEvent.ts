export abstract class AbstractChoice {
    constructor(
        public text: string,
    ) {}

    abstract canChoose(): boolean;
    abstract effect(): void;
    public nextEvent: AbstractEvent | null = null;
}

export abstract class AbstractEvent {
    public portraitName: string = "";
    public name: string = "";
    public description: string = "";
    public choices: AbstractChoice[] = [];
} 
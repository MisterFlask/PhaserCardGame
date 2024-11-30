export abstract class AbstractPeriodicBark {
    protected secondsBetweenBarks: number;

    constructor(secondsBetweenBarks: number) {
        this.secondsBetweenBarks = secondsBetweenBarks;
    }

    public getSecondsBetweenBarks(): number {
        return this.secondsBetweenBarks;
    }

    public abstract bark(): string;
}

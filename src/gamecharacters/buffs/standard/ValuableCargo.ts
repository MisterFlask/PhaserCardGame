import { AbstractBuff } from "../AbstractBuff";
import { HellSellValue } from "./HellSellValue";
import { SurfaceSellValue } from "./SurfaceSellValue";

export class ValuableCargo extends AbstractBuff {
    constructor() {
        super();
        this.imageName = "valuable-cargo";
        this.stackable = false;
    }

    override getDisplayName(): string {
        return "Valuable Cargo";
    }

    override getDescription(): string {
        return `This card is valuable cargo. It will be purged if it loses all its value.`;
    }

    override shouldPurgeAsStateBasedEffect(): boolean {
        const owner = this.getOwnerAsPlayableCard();
        if (!owner) return false;

        const surfaceValue = owner.buffs.find(buff => buff instanceof SurfaceSellValue);
        const hellValue = owner.buffs.find(buff => buff instanceof HellSellValue);

        return (!surfaceValue || surfaceValue.stacks <= 0) && (!hellValue || hellValue.stacks <= 0);
    }
}

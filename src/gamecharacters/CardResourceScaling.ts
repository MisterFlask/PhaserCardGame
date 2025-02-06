import { AbstractCombatResource } from "../rules/combatresources/AbstractCombatResource";


export interface CardResourceScaling {
    resource: AbstractCombatResource;
    attackScaling?: number;
    blockScaling?: number;
    magicNumberScaling?: number;
}

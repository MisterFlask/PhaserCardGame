export type LocationType = string;

// Common location type constants
export const LocationTypes = {
    COMBAT: 'COMBAT',
    ELITE_COMBAT: 'ELITE_COMBAT',
    MERCHANT: 'MERCHANT',
    EVENT: 'EVENT',
    BOSS: 'BOSS',
    REST: 'REST',
    CHARON: 'CHARON',
    ENTRANCE: 'ENTRANCE',
} as const; 
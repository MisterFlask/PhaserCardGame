import { Buster } from "../gamecharacters/buffs/playable_card/Buster";
import { Doubled } from "../gamecharacters/buffs/playable_card/Doubled";
import { Lightweight } from "../gamecharacters/buffs/playable_card/Lightweight";
import { BloodPriceBuff } from "../gamecharacters/buffs/standard/Bloodprice";
import { GrowingPowerBuff } from "../gamecharacters/buffs/standard/GrowingPower";
import { HellSellValue } from "../gamecharacters/buffs/standard/HellSellValue";
import { SacrificeBuff } from "../gamecharacters/buffs/standard/SacrificeBuff";
import { StressReliefFinisher } from "../gamecharacters/buffs/standard/StressReliefFinisher";
import { SurfaceSellValue } from "../gamecharacters/buffs/standard/SurfaceSellValue";
import { PlayableCard } from "../gamecharacters/PlayableCard";



export class RestSiteCardUpgradeModifier {
    constructor(
        public readonly weight: number,
        public readonly modifier: (card: PlayableCard) => void,
        public readonly eligible: (card: PlayableCard) => boolean = () => true
    ) {}
}


export class RestSiteUpgradeOptionManager {
    private static instance: RestSiteUpgradeOptionManager;

    private constructor() {}

    private modifiers: RestSiteCardUpgradeModifier[] = [
        // lethality for attacks
        new RestSiteCardUpgradeModifier(2, (card: PlayableCard) => {
            card.baseDamage += 3;
            card.name = card.name + "💥";
        },
        (card: PlayableCard) => card.baseDamage > 0),
        
        // bulwark for block cards
        new RestSiteCardUpgradeModifier(2, (card: PlayableCard) => {
            card.baseBlock += 3;
            card.name = card.name + "🛡️";
        },
        (card: PlayableCard) => card.baseBlock > 0),

        // decrease cost for cards that cost more than 1
        new RestSiteCardUpgradeModifier(2, (card: PlayableCard) => {
            card.baseEnergyCost -= 1;
            card.name = card.name + "💧";
        },
        (card: PlayableCard) => card.baseEnergyCost > 1),

        // magic number for cards that are not 0
        new RestSiteCardUpgradeModifier(2, (card: PlayableCard) => {
            card.baseMagicNumber += 1;
            card.name = card.name + "🔮";
        },
        (card: PlayableCard) => card.baseMagicNumber != 0),

        // double invoke card
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new Doubled());
            card.baseEnergyCost += 1;
            card.name = card.name + "🔄";
        },
        (card: PlayableCard) => true),
        
        // bloodprice and sacrifice
        new RestSiteCardUpgradeModifier(1,
            (card: PlayableCard) => {
                card.buffs.push(new BloodPriceBuff(3));
                card.buffs.push(new SacrificeBuff());
                card.name = card.name + "🖤";
            },
            (card: PlayableCard) => card.baseEnergyCost > 0
        ),
        
        // surface sell value
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new SurfaceSellValue(30));
            card.name = card.name + "💰";
        },
        (card: PlayableCard) => true),

        // hell sell value
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new HellSellValue(10));
            card.name = card.name + "🔥";
        },
        (card: PlayableCard) => true),

        // buster for attacks
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new Buster(1));
            card.name = card.name + "🔪";
        },
        (card: PlayableCard) => card.baseDamage > 0),

        // stress relief finisher
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new StressReliefFinisher());
            card.name = card.name + "💆";
        },
        (card: PlayableCard) => card.baseDamage > 0),


        // stress relief finisher
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new StressReliefFinisher());
            card.name = card.name + "🧘‍♂️";
        },
        (card: PlayableCard) => card.baseDamage > 0),

        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new GrowingPowerBuff(1));
            card.name = card.name + "🌱";
        },
        (card: PlayableCard) => card.baseDamage > 0),

        /// Lightweight
        new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
            card.buffs.push(new Lightweight(1));
            card.name = card.name + "🪶";
        },
        (card: PlayableCard) => true),
    ];

    private standardUpgrade = new RestSiteCardUpgradeModifier(1, (card: PlayableCard) => {
        return card.upgrade();
    }, (card: PlayableCard) => true);

    public static getInstance(): RestSiteUpgradeOptionManager {
        if (!RestSiteUpgradeOptionManager.instance) {
            RestSiteUpgradeOptionManager.instance = new RestSiteUpgradeOptionManager();
        }
        return RestSiteUpgradeOptionManager.instance;
    }

    public getRandomSetOfUpgradeOptions(quantityOptions: number): RestSiteCardUpgradeModifier[] {
        const options: RestSiteCardUpgradeModifier[] = [];

        options.push(this.standardUpgrade);
        
        // Create a pool of available modifiers based on their probabilities
        const modifierPool: RestSiteCardUpgradeModifier[] = [];
        this.modifiers.forEach(modifier => {
            // Add each modifier to the pool based on its probability weight
            for (let i = 0; i < modifier.weight; i++) {
                modifierPool.push(modifier);
            }
        });

        // Fisher-Yates shuffle
        for (let i = modifierPool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [modifierPool[i], modifierPool[j]] = [modifierPool[j], modifierPool[i]];
        }

        // Add unique modifiers until we reach desired quantity
        let added = 1; // Start at 1 since we already pushed standardUpgrade
        let poolIndex = 0;
        
        while (added < quantityOptions && poolIndex < modifierPool.length) {
            const modifier = modifierPool[poolIndex];
            if (!options.includes(modifier)) {
                options.push(modifier);
                added++;
            }
            poolIndex++;
        }

        return options;
    }

    
    
}

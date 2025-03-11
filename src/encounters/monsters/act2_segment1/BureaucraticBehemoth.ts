import { AbstractIntent, AttackIntent, BlockForSelfIntent, IntentListCreator } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { DamageInfo } from "../../../rules/DamageInfo";

// Custom buff to track damage taken in a turn and trigger a state change
class BureaucraticOutrage extends AbstractBuff {
    private damageTakenThisTurn: number = 0;
    private thresholdExceeded: boolean = false;
    private damageThreshold: number = 40;

    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "bureaucrat";
    }

    override getDisplayName(): string {
        return "Bureaucratic Outrage";
    }

    override getDescription(): string {
        return `If this creature takes more than ${this.damageThreshold} damage in a single turn, it will switch to a heavy attack pattern.`;
    }

    override onTurnStart(): void {
        // Reset damage tracking at the start of each turn
        this.damageTakenThisTurn = 0;
        this.thresholdExceeded = false;
    }

    override onOwnerStruck_CannotModifyDamage(_strikingUnit: any, _cardPlayedIfAny: any, damageInfo: DamageInfo): void {
        // Track damage taken this turn
        this.damageTakenThisTurn += damageInfo.unblockedDamageTaken;
        
        // Check if threshold is exceeded
        if (this.damageTakenThisTurn > this.damageThreshold && !this.thresholdExceeded) {
            this.thresholdExceeded = true;
            console.log(`${this.getOwnerAsCharacter()?.name} has taken more than ${this.damageThreshold} damage this turn and is outraged!`);
            
            // Get the owner and update its intents if it's a BureaucraticBehemoth
            const owner = this.getOwnerAsCharacter();
            if (owner instanceof BureaucraticBehemoth) {
                owner.triggerOutrage();
            }
        }
    }
}

export class BureaucraticBehemoth extends AutomatedCharacter {
    private isOutraged: boolean = false;
    private normalIntents: AbstractIntent[][] = [];
    private outrageIntents: AbstractIntent[][] = [];
    
    constructor() {
        super({
            name: "Bureaucratic Behemoth",
            portraitName: "Bureaucratic Beast",
            maxHitpoints: 120,
            description: "A massive creature adorned with countless forms, stamps, and official seals. Its movements are methodical until provoked."
        });
        
        // Add the tracking buff
        this.buffs.push(new BureaucraticOutrage());
        
        // Initialize intent patterns
        this.initializeIntentPatterns();
    }
    
    private initializeIntentPatterns(): void {
        // Normal intent pattern - methodical, predictable
        this.normalIntents = [
            // First turn: Block and small attack
            [
                new BlockForSelfIntent({ blockAmount: 15, owner: this }).withTitle("File Defensive Forms"),
                new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Stamp of Disapproval")
            ],
            // Second turn: Medium attack
            [
                new AttackIntent({ baseDamage: 14, owner: this }).withTitle("Regulatory Strike")
            ],
            // Third turn: Block and small attack again
            [
                new BlockForSelfIntent({ blockAmount: 12, owner: this }).withTitle("Bureaucratic Shield"),
                new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Red Tape Lash")
            ]
        ];
        
        // Outrage intent pattern - heavy attacks
        this.outrageIntents = [
            // Just one heavy attack pattern that repeats
            [
                new AttackIntent({ baseDamage: 25, owner: this }).withTitle("ADMINISTRATIVE FURY")
            ]
        ];
    }
    
    // Method to trigger outrage mode
    public triggerOutrage(): void {
        if (!this.isOutraged) {
            this.isOutraged = true;
            
            // Clear current intents and replace with the heavy attack immediately
            this.intents = [
                new AttackIntent({ baseDamage: 30, owner: this }).withTitle("BUREAUCRATIC MELTDOWN")
            ];
            
            console.log(`${this.name} has entered outrage mode!`);
        }
    }
    
    override generateNewIntents(): AbstractIntent[] {
        // Use different intent patterns based on outrage state
        if (this.isOutraged) {
            return IntentListCreator.iterateIntents(this.outrageIntents);
        } else {
            return IntentListCreator.iterateIntents(this.normalIntents);
        }
    }
} 
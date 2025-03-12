import { AbstractIntent, AttackIntent, BlockForSelfIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { AbstractBuff } from "../../../gamecharacters/buffs/AbstractBuff";
import { DamageInfo } from "../../../rules/DamageInfo";

// Custom buff to track damage taken in a turn and trigger a state change
class BureaucraticOutrage extends AbstractBuff {
    private thresholdExceeded: boolean = false;

    constructor() {
        super();
        this.isDebuff = false;
        this.imageName = "bureaucrat";
        this.stacks = 40; // Damage threshold
        this.secondaryStacks = 0; // Damage taken this turn
    }

    override getDisplayName(): string {
        return "Heavy Armaments Limitations Act";
    }

    override getDescription(): string {
        return `If this creature takes more than ${this.stacks} damage in a single turn, it will switch to a heavy attack pattern next turn. (${this.secondaryStacks}/${this.stacks})`;
    }

    override onTurnStart(): void {
        // Reset damage tracking at the start of each turn
        this.secondaryStacks = 0;
        this.thresholdExceeded = false;
    }

    override onOwnerStruck_CannotModifyDamage(_strikingUnit: any, _cardPlayedIfAny: any, damageInfo: DamageInfo): void {
        // Track damage taken this turn
        this.secondaryStacks += damageInfo.unblockedDamageTaken;
        
        // Check if threshold is exceeded
        if (this.secondaryStacks > this.stacks && !this.thresholdExceeded) {
            this.thresholdExceeded = true;
            console.log(`${this.getOwnerAsCharacter()?.name} has taken more than ${this.stacks} damage this turn and is outraged!`);
            
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
    private intentCounter: number = 0;
    
    constructor() {
        super({
            name: "Bureaucratic Behemoth",
            portraitName: "Bureaucratic Beast",
            maxHitpoints: 120,
            description: "A massive creature adorned with countless forms, stamps, and official seals. Its movements are methodical until provoked."
        });
        
        // Add the tracking buff
        this.buffs.push(new BureaucraticOutrage());
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
            // In outraged state, just use a single heavy attack pattern
            return [
                new AttackIntent({ baseDamage: 45, owner: this }).withTitle("ADMINISTRATIVE FURY")
            ];
        } else {
            // In normal state, cycle through a 3-turn pattern
            this.intentCounter = (this.intentCounter % 3) + 1;
            
            switch (this.intentCounter) {
                case 1:
                    // First turn: Block and small attack
                    return [
                        new BlockForSelfIntent({ blockAmount: 15, owner: this }).withTitle("File Defensive Forms"),
                        new AttackIntent({ baseDamage: 8, owner: this }).withTitle("Stamp of Disapproval")
                    ];
                case 2:
                    // Second turn: Medium attack
                    return [
                        new AttackIntent({ baseDamage: 14, owner: this }).withTitle("Regulatory Strike")
                    ];
                case 3:
                    // Third turn: Block and small attack again
                    return [
                        new BlockForSelfIntent({ blockAmount: 12, owner: this }).withTitle("Bureaucratic Shield"),
                        new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Red Tape Lash")
                    ];
                default:
                    // Should never happen, but just in case
                    return [
                        new AttackIntent({ baseDamage: 10, owner: this }).withTitle("Bureaucratic Error")
                    ];
            }
        }
    }
} 
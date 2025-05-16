import { Gender } from "../BaseCharacter";
import { BaseCharacterClass } from "../BaseCharacterClass";
import { PlayableCard } from "../PlayableCard";
import { PlayerCharacter } from "../PlayerCharacter";

class SimpleAmphibiousSteamer extends BaseCharacterClass {
    constructor() {
        super({
            name: "Erebus-Class Amphibious Traction-Steamer",
            iconName: "amphibious_steamer",
            startingMaxHp: 100,
            id: "amphibious_steamer"
        });
    }

    getPortraitNameAtRandom(gender: Gender): string {
        return "amphibious_steamer";
    }
}


export class PlayerVessel extends PlayerCharacter {
    constructor() { 
        super({
            name: "The H.M.S. Cervantes",
            description: "Your cargo is here.  Also, if it sinks you're toast.",
            portraitName: "amphibious_steamer",
            characterClass: new SimpleAmphibiousSteamer(),
        });
        this.hitpoints = this.characterClass.startingMaxHp;
        this.maxHitpoints = this.characterClass.startingMaxHp;
    }

    public purgeAllCargo(){
        this.cardsInMasterDeck = [];
    }

    public addCargoCard(card: PlayableCard){
        this.cardsInMasterDeck.push(card);
    }
    public removeRandomCargoCards(num: number){
        if (num <= 0 || this.cardsInMasterDeck.length === 0) return;
        
        // Ensure we don't try to remove more cards than exist
        const cardsToRemove = Math.min(num, this.cardsInMasterDeck.length);
        
        for (let i = 0; i < cardsToRemove; i++){
            // Get random index
            const randomIndex = Math.floor(Math.random() * this.cardsInMasterDeck.length);
            // Remove card at random index
            this.cardsInMasterDeck.splice(randomIndex, 1);
        }
    }
}


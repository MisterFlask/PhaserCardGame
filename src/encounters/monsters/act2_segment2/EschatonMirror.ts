import { AbstractIntent, AttackAllPlayerCharactersIntent, DoSomethingIntent } from "../../../gamecharacters/AbstractIntent";
import { AutomatedCharacter } from "../../../gamecharacters/AutomatedCharacter";
import { ScrambledBuff } from "../../../gamecharacters/buffs/playable_card/Scrambled";


export class EschatonMirror extends AutomatedCharacter {
    constructor() {
        super({
            name: "Eschaton Mirror",
            portraitName: "Mirror Mimic",
            maxHitpoints: 55,
            description: "a cracked reflection of impossible futures. it manipulates the deck itself, warping your memory of cards."
        });
    }

    override generateNewIntents(): AbstractIntent[] {
        // each turn it either attacks, or distorts memory of a card, or rearranges reality.
        const roll = Math.random();

        return [
            new DoSomethingIntent({
                    owner: this,
                    action: () => {
                        const drawPile = this.gameState.combatState.drawPile;
                    const numCardsToScramble = Math.min(5, drawPile.length);
                    const shuffledDrawPile = [...drawPile].sort(() => Math.random() - 0.5);
                    for (let i = 0; i < numCardsToScramble; i++) {
                        this.actionManager.applyBuffToCharacterOrCard(shuffledDrawPile[i], new ScrambledBuff());
                    }
                },
                imageName: "reality_slip",
                title: "Reality Slip"
            }),
            new AttackAllPlayerCharactersIntent({
                baseDamage: 8,
                owner: this
            })
        ];
    }
}

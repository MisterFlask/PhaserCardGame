// Pure guid helpers with no Phaser dependency, safe to import from headless
// unit tests and from any game-logic module.

const adjectives = ["swift", "brave", "calm", "wise", "bold"];
const nouns = ["falcon", "lion", "eagle", "wolf", "bear"];

export function generateWordGuid(baseId: string = ""): string {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${randomAdjective}-${randomNoun}-${randomNumber} + ${baseId}`;
}

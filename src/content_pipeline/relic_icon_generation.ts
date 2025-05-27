const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const { RelicsLibrary } = require('../relics/RelicsLibrary');

async function generateRelicIcons() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
  });

  const outputBase = path.join(__dirname, '../../resources/Sprites/RelicIcons');
  await fs.mkdir(outputBase, { recursive: true });

  const library = RelicsLibrary.getInstance();
  const relics = library.getAllBeneficialRelics().concat(library.getAllCursedRelics());
  const uniqueNames = Array.from(new Set(relics.map(r => r.getDisplayName())));

  for (const name of uniqueNames) {
    console.log(`Generating icons for ${name}`);
    const prompt = `minimalist flat icon of a thing called "${name}", vector style, centered on transparent background, no text, high contrast, simple geometric shapes, suitable for small resolution display, clear silhouette, no shadows, no gradients, colorful, clear black outlines`;
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 3,
        size: '256x256',
        response_format: 'b64_json',
      });
      const relicDir = path.join(outputBase, name.replace(/\s+/g, '_'));
      await fs.mkdir(relicDir, { recursive: true });
      for (let i = 0; i < response.data.length; i++) {
        const imageData = response.data[i].b64_json;
        if (imageData) {
          const buffer = Buffer.from(imageData, 'base64');
          const outPath = path.join(relicDir, `${i + 1}.png`);
          await fs.writeFile(outPath, buffer);
          console.log(`Saved ${outPath}`);
        }
      }
    } catch (error) {
      console.error(`Failed to generate icon for ${name}:`, error);
    }
  }
}

generateRelicIcons();

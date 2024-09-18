import * as fs from 'fs/promises';
import { OpenAI } from 'openai';
import * as path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

async function modifyCharacterStyle(inputFilePath: string, outputFilePath: string, styleIdentifier: string) {
  try {
    // Read the input JSON file
    const inputData = JSON.parse(await fs.readFile(inputFilePath, 'utf-8'));


    // Make the API call
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages:  [
        { role: "system", content: `You are a creative writer tasked with modifying character descriptions to fit a specific style: ${styleIdentifier}. Maintain the core themes and information while adapting the language and tone to match the style.` },
        { role: "user", content: `Please modify the following character descriptions to fit the ${styleIdentifier} style. Keep the same structure and information, but change the language and tone:\n${JSON.stringify(inputData, null, 2)}` }
      ],
      temperature: 0.7,
    });

    // Parse the response
    const modifiedData = JSON.parse(completion.choices[0].message.content || '');

    // Ensure the output directory exists
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });

    // Write the modified data to the output file
    await fs.writeFile(outputFilePath, JSON.stringify(modifiedData, null, 2));

    console.log(`Modified character data written to ${outputFilePath}`);
    console.log('Tokens consumed in completion:', completion.usage?.total_tokens);
    const costPerToken = 0.03 / 1000; // Estimated cost per token in dollars for GPT-4
    const estimatedCost = completion.usage?.total_tokens ? completion.usage.total_tokens * costPerToken : -1;
    console.log('Estimated cost of API call: $', estimatedCost?.toFixed(5));
  } catch (error) {
    console.error('Error:', error);
  }
}

 modifyCharacterStyle(
  path.join(__dirname, 'content', 'characters_v1.json'),
  path.join(__dirname, 'content', 'characters_noir_v1.json'),
  'film noir'
 );

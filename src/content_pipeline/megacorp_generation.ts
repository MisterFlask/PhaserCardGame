const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // This should be set in your environment variables
});

const exampleResponse = {
  items: [
    {
      name: "The Binns and Gromnir Plastics and Heavy Industry Concern",
      description: "Specializes in plastics and heavy industry, with a focus on creating durable and high-quality storage containers.  Massively negative environmental impact.  Poor PR.",
      core_industries: "Plastics",
      negative_externalities: "Environmental impact via deep-sea fracking operations",
      ceo: "Sir Albertforth Binns",
      ceo_description: "A British businessman who inherited the company from his family. He is known for his ruthless business tactics and his disdain for environmental regulations.",
      ceo_demeanor:"Snobbish and condescending.",
      company_motto:"",
      ceo_nationality:"British",
    },
    {
      name: "Mujihiro Industries",
      description: "Corporate rivals of Binns and Gromnir, known for their advanced robotics and AI technologies.",
      core_industries: "AI, Robotics",
      ceo: "Johann Mujihiro",
      negative_externalities: "AI-driven communications surveillance",
      ceo_description: "A Japanese entrepreneur.",
      ceo_demeanor: "Violent and unstable.  Looks homeless, but is actually a billionaire.",
      company_motto:"",
      ceo_nationality:"Japanese",
    },
    {
      name: "EcoFortis",
      description: "Biological research and development, focusing on genetically-engineered crops and animals.",
      core_industries: "Genetic engineering",
      ceo: "Ngozi Okorie",
      negative_externalities: "Escaped specimens from lab",
      ceo_description: "A cutthroat Nigerian businesswoman.",
      ceo_demeanor: "Calm, collected.  Doesn't like small talk.",
      company_motto:"",
      ceo_nationality:"Nigerian",
    },
    {
      name: "Henry Construction Ltd",
      description: "A construction company that specializes in building massive structures via advanced materials.",
      core_industries: "Construction, Advanced Materials",
      negative_externalities: "Massive destruction of natural habitats",
      ceo: "Henry Robbins",
      ceo_description: "A gruff American construction magnate.",
      ceo_demeanor: "Gruff and no-nonsense, swears heavily.",
      company_motto:"",
      ceo_nationality:"American",
    }
  ]
};

async function generateMegacorps(outputFilePath = path.join(__dirname, "/content/megacorps_v1.json")) {
  const prompt = "Please provide 10 creative megacorp ideas for a story set in a cyberpunk-style dystopia.  Follow the structure of the example provided.  Try to vary things up beyond standard cliches and tropes.";
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You must respond with a JSON object matching this structure:" + JSON.stringify(exampleResponse) },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    
    // Ensure the directory exists
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    
    // Write the result to the specified file
    await fs.writeFile(outputFilePath, JSON.stringify(result, null, 2));
    
    console.log(`Megacorps data written to ${outputFilePath}`);
    console.log('Tokens consumed in completion:', completion.usage.total_tokens);
    const costPerToken = 3.00/1_000_000; // Estimated cost per token in dollars
    const estimatedCost = completion.usage.total_tokens * costPerToken;
    console.log('Estimated cost of API call: $', estimatedCost.toFixed(5));
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function with the default output path
generateMegacorps(path.join(__dirname, "/content/megacorps_v1.json"));
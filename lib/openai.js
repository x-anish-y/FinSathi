import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const MODEL = 'gpt-4o-mini';

export async function getAIResponse(systemPrompt, userPrompt, options = {}) {
  try {
    const completion = await client.chat.completions.create({
      model: options.model || MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function getJSONResponse(systemPrompt, userPrompt, options = {}) {
  try {
    const completion = await client.chat.completions.create({
      model: options.model || MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2048,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('❌ OpenAI JSON API error:', error.message);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export default client;

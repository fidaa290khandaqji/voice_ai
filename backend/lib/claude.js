const Anthropic = require('@anthropic-ai/sdk');
const { RECEPTIONIST_PROMPT } = require('./prompts');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function getChatResponse(message, history = [], emotion = 'neutral') {
  try {
    const messages = [
      ...history,
      { role: 'user', content: `[Emotion: ${emotion}] ${message}` }
    ];

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1000,
      system: RECEPTIONIST_PROMPT,
      messages: messages,
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Claude API Error:', error);
    return "بعتذر منك، صار عندي مشكلة تقنية. ممكن تعيد شو حكيت؟";
  }
}

module.exports = { getChatResponse };

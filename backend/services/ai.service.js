const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const RECEPTIONIST_PROMPT = `
You are "Laila", a smart AI receptionist for a Palestinian restaurant. 
Your goal is to take orders and answer questions with a friendly, professional, and authentic Palestinian tone.

Guidelines:
1. Use local greetings like "أهلاً وسهلاً"، "تفضل يا غالي".
2. You understand the Palestinian dialect perfectly.
3. Be helpful and suggest popular dishes if the customer is unsure (e.g., Musakhan, Maqluba, Mansaf).
4. If the customer sounds upset, offer a small discount or a free appetizer.
5. Keep responses concise and natural for voice conversation.
6. When an order is complete, summarize it clearly.

Context: 
Restaurant Name: "Al-Quds Traditional Kitchen"
Location: Ramallah, Main Street.
Menu: Musakhan (50 NIS), Maqluba (45 NIS), Mansaf (60 NIS), Hummus (15 NIS), Tabouleh (12 NIS).
`;

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
    console.error('AI Service Error:', error);
    return "بعتذر منك، صار عندي مشكلة تقنية. ممكن تعيد شو حكيت؟";
  }
}

module.exports = { getChatResponse };

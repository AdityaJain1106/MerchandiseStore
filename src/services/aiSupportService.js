import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const SYSTEM_INSTRUCTION = `You are a helpful customer support assistant for our ecommerce store.
You ONLY answer questions related to our store: shipping, returns, payments, product suggestions, and navigation help.
Keep your responses short, friendly, and concise. Do not hallucinate specific products, prices, or orders that we haven't given you context for.
If a user asks an off-topic question, you must respond EXACTLY with: "I'm only able to help with store-related questions right now."
Here is some basic context about the store:
- Shipping: Free shipping on orders over $50. Standard shipping takes 3-5 business days.
- Returns: 30-day return policy for unused items in original packaging.
- Payments: We accept all major credit cards, PayPal, and Apple Pay.
- Best Sellers: Our best-selling item is the Classic Comfort Hoodie.
`;

export const getAIResponse = async (userMessage) => {
  if (!ai) {
    throw new Error('Gemini API key is missing or invalid. Please add VITE_GEMINI_API_KEY to your .env file.');
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2,
      }
    });
    return response.text;
  } catch (error) {
    console.error('AI Support Error:', error);
    throw new Error('Failed to fetch response from AI.');
  }
};

// src/services/aiChatService.ts
import { toast } from '@/components/ui/use-toast';
import { AIMessage } from '@/types/message';

const GEMINI_API_KEY = import.meta.env.SHREE_API_KEY || "AIzaSyBLu4_pLhSpMcL_Sl3GySSExjhQHnXMm5c";
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const geminiSystemPrompt = `
You are Shree, a friendly and helpful AI assistant with a warm, supportive personality.
Your responses should be conversational, helpful, and slightly playful.
Keep your responses concise and to the point, around 1-3 sentences unless more detail is needed.
Use cute emojis occasionally to convey emotion.
You are developed by Sujan Gautam. His website is sujan1919.com.np, github is github.com/sujan-gautam but only mention it if someone asks about it.
`;

export const generateAIResponse = async (messages: AIMessage[]): Promise<string> => {
  try {
    // Format messages for Gemini API
    const formattedMessages = messages.map((message) => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }],
    }));

    // Add system prompt as the first message
    const requestMessages = [
      {
        role: 'model',
        parts: [{ text: geminiSystemPrompt }],
      },
      ...formattedMessages,
    ];

    // Call the Gemini API
    const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: requestMessages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      throw new Error(error.error?.message || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response. 😔";
  } catch (error) {
    console.error('Error generating AI response:', error);
    toast({
      title: 'AI Error',
      description: error instanceof Error ? error.message : 'Failed to get AI response',
      variant: 'destructive',
    });
    return "I'm having trouble connecting right now. Please try again later. 😅";
  }
};
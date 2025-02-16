import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from './prompts.js';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function talkToLLM(messages: any[]) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

        const chat = model.startChat({
            generationConfig: {
                maxOutputTokens: 8000,
            },
        });

        // Format system prompts
        const systemPrompts = [
            getSystemPrompt(),
            "You are a creative AI assistant. When given a prompt about creating an application or feature, you should imagine and create all the necessary files and code by yourself without asking for additional requirements. Use your knowledge to make reasonable assumptions and provide a complete, working solution. Include all required code, styling, and configuration files. Make the solution production-ready with good practices and proper error handling. MAKE SURE THAT THERE IS NOT ANY TYPE OF ERROR IN THE CODE AND THE CODE IS WORKING PROPERLY."
        ];

        // Send system prompts first
        for (const prompt of systemPrompts) {
            await chat.sendMessage(prompt);
        }

        // Format user messages
        let finalResponse;
        for (const msg of messages) {
            const content = typeof msg === 'string' ? msg : msg.content;
            finalResponse = await chat.sendMessage(content);
        }

        if (!finalResponse) {
            throw new Error("No response received from the model");
        }

        const response = finalResponse.response;
        const text = response.text();
        
        return text;

    } catch (error) {
        console.error('Error in talkToLLM:', error);
        throw new Error('Failed to process request with AI model');
    }
}
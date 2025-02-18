import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from './prompts.js';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface Message {
    role: string;
    content: string;
}

export async function talkToLLM(messages: Message[]) {
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY as string);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = await model.startChat({
            generationConfig: {
                maxOutputTokens: 8000,
            },
        });

        const systemPrompts = [
            {
                role: "system",
                content: getSystemPrompt()
            },
            {
                role: "system",
                content: "You are a creative AI assistant. When given a prompt about creating an application or feature, you should imagine and create all the necessary files and code by yourself without asking for additional requirements. Use your knowledge to make reasonable assumptions and provide a complete, working solution. Include all required code, styling, and configuration files. Make the solution production-ready with good practices and proper error handling. MAKE SURE THAT THERE IS NOT ANY TYPE OF ERROR IN THE CODE AND THE CODE IS WORKING PROPERLY."
            }
        ];

        // Send system prompts first
        for (const prompt of systemPrompts) {
            await chat.sendMessage(prompt.content);
        }

        // Send user messages
        let finalResponse;
        for (const msg of messages) {
            finalResponse = await chat.sendMessage(msg.content);
        }

        if (!finalResponse) {
            console.log("No response received from the model");
        }

        const response = finalResponse?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

        return response;
    } catch (error) {
        console.error('Error in talkToLLM:', error);
        return null;
    }
}